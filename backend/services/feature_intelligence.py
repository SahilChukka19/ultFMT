"""
Feature Intelligence Service
Computes: Pearson, Spearman, VIF, PCA Loadings, Mutual Info, ANOVA F-score, Redundancy Score.
All sklearn imports are LAZY (loaded on first request) to keep server startup instant.
"""
import pandas as pd
import numpy as np
import gc
import warnings

MAX_ROWS = 5000
MAX_COLS = 50

# --- Lazy sklearn module holders ---
_PCA = None
_mutual_info_regression = None
_mutual_info_classif = None
_f_classif = None
_f_regression = None
_LabelEncoder = None

def _load_sklearn():
    """Load sklearn components exactly once, on first analysis request."""
    global _PCA, _mutual_info_regression, _mutual_info_classif
    global _f_classif, _f_regression, _LabelEncoder
    if _PCA is None:
        warnings.filterwarnings('ignore')
        from sklearn.decomposition import PCA as _P
        from sklearn.feature_selection import (
            mutual_info_regression as _mir,
            mutual_info_classif as _mic,
            f_classif as _fc,
            f_regression as _fr,
        )
        from sklearn.preprocessing import LabelEncoder as _LE
        _PCA = _P
        _mutual_info_regression = _mir
        _mutual_info_classif = _mic
        _f_classif = _fc
        _f_regression = _fr
        _LabelEncoder = _LE


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """Downsample, select numeric cols, impute, drop zero-variance cols."""
    if len(df) > MAX_ROWS:
        df = df.sample(n=MAX_ROWS, random_state=42)

    df = df.select_dtypes(include=[np.number])

    if len(df.columns) > MAX_COLS:
        df = df.iloc[:, :MAX_COLS]

    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna(df.median())

    # Drop constant columns (variance = 0)
    df = df.loc[:, df.nunique() > 1]
    return df


def _compute_vif(df: pd.DataFrame) -> dict:
    """VIF via inverse of correlation matrix. Capped at 100."""
    try:
        corr = df.corr().to_numpy()
        inv = np.linalg.inv(corr)
        vifs = np.diag(inv)
        return {col: round(float(min(v, 100.0)), 3) for col, v in zip(df.columns, vifs)}
    except np.linalg.LinAlgError:
        return {col: -1.0 for col in df.columns}


def compute_feature_intelligence(df: pd.DataFrame, target_col: str = None) -> dict:
    _load_sklearn()
    df_c = _clean(df)
    cols = df_c.columns.tolist()

    if len(cols) < 2:
        return {"error": "Need at least 2 numeric columns with variance."}

    # 1. Correlations
    pearson = df_c.corr(method='pearson')
    spearman = df_c.corr(method='spearman')

    corr_matrix = {}
    for c1 in cols:
        corr_matrix[c1] = {}
        for c2 in cols:
            corr_matrix[c1][c2] = {
                "pearson": round(float(pearson.loc[c1, c2]), 4),
                "spearman": round(float(spearman.loc[c1, c2]), 4),
            }

    # 2. VIF
    vif = _compute_vif(df_c)

    # 3. PCA Loadings (1st component)
    try:
        df_std = (df_c - df_c.mean()) / df_c.std().replace(0, 1)
        pca = _PCA(n_components=1)
        pca.fit(df_std)
        pca_loadings = {col: round(float(v), 4) for col, v in zip(cols, pca.components_[0])}
        pca_variance_explained = round(float(pca.explained_variance_ratio_[0]) * 100, 2)
    except Exception:
        pca_loadings = {col: 0.0 for col in cols}
        pca_variance_explained = 0.0

    # 4. Redundancy Score (blend of avg |pearson| + VIF)
    redundancy = {}
    for col in cols:
        avg_corr = (pearson[col].abs().sum() - 1.0) / max(len(cols) - 1, 1)
        v = vif.get(col, 1.0)
        if v == -1.0:
            v = 100.0
        vif_score = min(v / 10.0, 1.0)
        r = (avg_corr * 0.6) + (vif_score * 0.4)
        redundancy[col] = round(float(min(max(r, 0.0), 1.0)), 3)

    # 5. Target analysis (optional)
    target_analysis = None
    target_type = None
    if target_col and target_col in df.columns:
        target = df[target_col].dropna()
        X = df_c.loc[target.index.intersection(df_c.index)]
        y = target.loc[X.index]

        if len(y) > 10:
            is_cat = y.dtype == 'object' or y.nunique() < 10
            target_type = "categorical" if is_cat else "continuous"

            if is_cat:
                y_enc = _LabelEncoder().fit_transform(y)
                mi = _mutual_info_classif(X, y_enc, random_state=42)
                try:
                    f_scores, _ = _f_classif(X, y_enc)
                except Exception:
                    f_scores = [0.0] * len(cols)
            else:
                mi = _mutual_info_regression(X, y, random_state=42)
                try:
                    f_scores, _ = _f_regression(X, y)
                except Exception:
                    f_scores = [0.0] * len(cols)

            target_analysis = {
                col: {
                    "mutual_information": round(float(mi[i]), 4),
                    "anova_f_score": round(float(f_scores[i]) if not np.isnan(float(f_scores[i])) else 0.0, 2),
                }
                for i, col in enumerate(cols)
            }

    # Cleanup
    del df_c, pearson, spearman
    gc.collect()

    return {
        "features": cols,
        "correlations": corr_matrix,
        "vif": vif,
        "pca_loadings": pca_loadings,
        "pca_variance_explained": pca_variance_explained,
        "redundancy_score": redundancy,
        "target_analysis": target_analysis,
        "target_type": target_type,
    }
