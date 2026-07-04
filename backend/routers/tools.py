from fastapi import APIRouter, File, UploadFile, Form
import io
import pandas as pd
import numpy as np
import warnings
from pydantic import BaseModel
from typing import Optional
import re
import math
from routers.metadata import load_json_file
from services.feature_intelligence import compute_feature_intelligence

router = APIRouter(prefix="/api/v1/tools", tags=["tools"])

class TokenEstimatorRequest(BaseModel):
    text: str

@router.post("/token-estimator")
def estimate_tokens(request: TokenEstimatorRequest):
    text = request.text
    char_count = len(text)
    words = [w for w in text.split() if w.strip()]
    word_count = len(words)
    line_count = len(text.splitlines()) if text else 0
    
    # Rough estimation: 1 token ~= 4 chars or 0.75 words
    token_count = max(int(char_count / 4), int(word_count / 0.75))
    
    # Reading time (average 238 words per min)
    reading_time_sec = math.ceil((word_count / 238) * 60)
    
    return {
        "char_count": char_count,
        "word_count": word_count,
        "line_count": line_count,
        "token_count": token_count,
        "reading_time_sec": reading_time_sec
    }

class CostCalculatorRequest(BaseModel):
    model_config = {'protected_namespaces': ()}
    
    model_id: str
    input_tokens: int
    output_tokens: int
    requests_per_day: int

@router.post("/cost-calculator")
def calculate_cost(request: CostCalculatorRequest):
    pricing_data = load_json_file("pricing.json").get("pricing", {})
    model_pricing = pricing_data.get(request.model_id)
    
    if not model_pricing:
        return {"error": "Model not found"}
        
    input_cost = (request.input_tokens / 1_000_000) * model_pricing["input_cost_per_1m"]
    output_cost = (request.output_tokens / 1_000_000) * model_pricing["output_cost_per_1m"]
    
    cost_per_request = input_cost + output_cost
    daily_cost = cost_per_request * request.requests_per_day
    monthly_cost = daily_cost * 30
    annual_cost = daily_cost * 365
    
    return {
        "cost_per_request": round(cost_per_request, 6),
        "daily_cost": round(daily_cost, 4),
        "monthly_cost": round(monthly_cost, 4),
        "annual_cost": round(annual_cost, 4)
    }

class ContextCheckerRequest(BaseModel):
    text: str

@router.post("/context-checker")
def check_context_window(request: ContextCheckerRequest):
    text = request.text
    char_count = len(text)
    word_count = len([w for w in text.split() if w.strip()])
    token_count = max(int(char_count / 4), int(word_count / 0.75))
    
    models_data = load_json_file("models.json").get("models", [])
    
    results = []
    for model in models_data:
        context_window = model["context_window"]
        remaining = context_window - token_count
        percentage_used = round((token_count / context_window) * 100, 2)
        
        results.append({
            "model_id": model["id"],
            "model_name": model["name"],
            "context_window": context_window,
            "tokens_used": token_count,
            "remaining_context": remaining,
            "percentage_used": percentage_used,
            "is_supported": remaining >= 0
        })
        
    return {"results": results}

import difflib

class PromptDiffRequest(BaseModel):
    prompt_a: str
    prompt_b: str

@router.post("/prompt-diff")
def prompt_diff(request: PromptDiffRequest):
    diff = list(difflib.ndiff(request.prompt_a.splitlines(keepends=True), request.prompt_b.splitlines(keepends=True)))
    
    added = sum(1 for line in diff if line.startswith("+ "))
    removed = sum(1 for line in diff if line.startswith("- "))
    
    # Simple HTML conversion for the frontend
    diff_html = []
    for line in diff:
        if line.startswith("+ "):
            diff_html.append(f'<span class="bg-green-200 text-green-900 block">{line}</span>')
        elif line.startswith("- "):
            diff_html.append(f'<span class="bg-red-200 text-red-900 block">{line}</span>')
        elif line.startswith("? "):
            continue
        else:
            diff_html.append(f'<span class="block">{line}</span>')
            
    return {
        "added_lines": added,
        "removed_lines": removed,
        "diff_html": "".join(diff_html),
        "unified_diff": "".join(diff)
    }

class VariableExtractorRequest(BaseModel):
    prompt: str

@router.post("/variable-extractor")
def extract_variables(request: VariableExtractorRequest):
    # Find patterns like {{variable}} or {variable} or <<variable>>
    prompt = request.prompt
    
    # Matches {{var}}, {var}, <<var>>, <var>, [var]
    patterns = [
        r'\{\{\s*([a-zA-Z0-9_]+)\s*\}\}', # {{ var }}
        r'\{([a-zA-Z0-9_]+)\}',           # {var}
        r'<<\s*([a-zA-Z0-9_]+)\s*>>',     # << var >>
        r'\[\[\s*([a-zA-Z0-9_]+)\s*\]\]', # [[ var ]]
        r'\[([a-zA-Z0-9_]+)\]'            # [var]
    ]
    
    variables = set()
    for pattern in patterns:
        matches = re.findall(pattern, prompt)
        for match in matches:
            variables.add(match)
            
    return {
        "variables": list(variables),
        "count": len(variables)
    }


@router.post("/dataset-health")
async def analyze_dataset(file: UploadFile = File(...), target_column: Optional[str] = Form(None)):
    try:
        filename = file.filename.lower()
        content = await file.read()
        
        # 1. Load data
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"is_valid": False, "error": "Only CSV and Excel files are supported."}
            
        if df.empty:
            return {"is_valid": False, "error": "The dataset is empty."}
            
        columns = df.columns.tolist()
        num_rows = len(df)
        
        # 1.5 Auto-cast "dirty" numeric columns
        # If an object column is mostly numeric (e.g. contains strings like "13.3", or a few rogue "?" strings),
        # casting to numeric with coerce will fix it and properly identify it as numeric for the advisor.
        for col in columns:
            if df[col].dtype == 'object':
                # Remove common string noise like commas or quotes before coercing
                if df[col].apply(lambda x: isinstance(x, str)).any():
                    clean_series = df[col].replace(r'["\',]', '', regex=True)
                else:
                    clean_series = df[col]
                    
                coerced = pd.to_numeric(clean_series, errors='coerce')
                orig_nans = df[col].isna().sum()
                new_nans = coerced.isna().sum()
                
                # If coercing to numeric introduces <= 5% new NaNs, it's safe to assume it's a numeric column
                if new_nans - orig_nans <= num_rows * 0.05:
                    df[col] = coerced
        
        # 2. Heuristically guess target column if not provided
        guessed_target = None
        if not target_column or target_column not in columns:
            target_keywords = ["target", "label", "class", "y", "output", "survived", "price"]
            for col in columns:
                if str(col).lower() in target_keywords:
                    guessed_target = col
                    break
            
            if not guessed_target:
                # Fallback to the last column
                guessed_target = columns[-1]
                
            target_column = guessed_target
        else:
            guessed_target = target_column

        # 3. General Health Checks
        health_score = 100
        problems = []
        recommendations = []
        
        # Duplicates
        duplicate_count = df.duplicated().sum()
        if duplicate_count > 0:
            dup_percent = (duplicate_count / num_rows) * 100
            problems.append(f"{duplicate_count} duplicate rows ({dup_percent:.1f}%)")
            recommendations.append("Drop duplicate rows before training to prevent data leakage between train/test splits.")
            health_score -= min(15, (dup_percent / 2))
            
            
        # Prepare numeric_df for missingness checks and correlation matrix
        encoded_df = df.copy()
        for c in encoded_df.columns:
            if encoded_df[c].dtype == 'object' or str(encoded_df[c].dtype) == 'category':
                encoded_df[c] = pd.factorize(encoded_df[c])[0]
        numeric_df_all = encoded_df.select_dtypes(include=[np.number])

        # Null Analysis
        null_counts = df.isnull().sum()
        null_distribution = []
        preprocessing_advice = []
        high_null_cols = 0
        for col, count in null_counts.items():
            pct = (count / num_rows) * 100
            null_distribution.append({"column": col, "null_percentage": float(pct)})
            if pct > 70:
                high_null_cols += 1
                
            if count > 0:
                if pct > 70:
                    advice = "Drop Column"
                    reason = f"{pct:.1f}% Missing"
                else:
                    if df[col].dtype == 'object' or str(df[col].dtype) == 'category':
                        advice = "Most Frequent (Mode)"
                        reason = "Categorical Feature"
                    else:
                        skewness = df[col].skew()
                        if pd.isna(skewness):
                            advice = "Median"
                            reason = "Numeric (Unknown Skew)"
                        elif abs(skewness) > 1.0:
                            advice = "Median"
                            reason = f"Skewed Distribution (Skew: {skewness:.1f})"
                        else:
                            advice = "Mean"
                            reason = f"Symmetric Distribution (Skew: {skewness:.1f})"
                            
                    # Missingness Mechanism check (MCAR, MAR, MNAR)
                    mcar = "Possible"
                    mar = "Possible"
                    mnar = "Possible"
                    
                    if not numeric_df_all.empty:
                        with warnings.catch_warnings():
                            warnings.simplefilter("ignore")
                            indicator = df[col].isnull().astype(int)
                            # Check if indicator has variance
                            if indicator.nunique() > 1:
                                corrs = numeric_df_all.corrwith(indicator).abs()
                                corrs = corrs.drop(col, errors='ignore')
                                if not corrs.empty:
                                    max_corr = corrs.max()
                                    if pd.notna(max_corr):
                                        if max_corr < 0.1:
                                            mcar = "Likely"
                                            mar = "Unlikely"
                                        else:
                                            mcar = "Unlikely"
                                            mar = "Likely"
                            
                preprocessing_advice.append({
                    "column": str(col),
                    "recommended": advice,
                    "reason": reason,
                    "missing_pct": float(pct),
                    "mcar": mcar,
                    "mar": mar,
                    "mnar": mnar
                })
                
        if high_null_cols > 0:
            problems.append(f"{high_null_cols} columns with >70% missing values")
            recommendations.append("Drop columns with >70% missing values, or carefully impute them if they carry critical signal.")
            health_score -= (high_null_cols * 5)
            
        # Mixed Data Types
        mixed_types = []
        for col in columns:
            if df[col].apply(type).nunique() > 1:
                mixed_types.append(col)
                
        if len(mixed_types) > 0:
            problems.append(f"{len(mixed_types)} columns have mixed data types (e.g. strings and numbers)")
            recommendations.append(f"Standardize data types in columns: {', '.join(mixed_types[:3])}{'...' if len(mixed_types)>3 else ''}.")
            health_score -= (len(mixed_types) * 2)
            
        # ID Columns
        id_cols = []
        for col in columns:
            if col != target_column:
                unique_count = df[col].nunique()
                if unique_count == num_rows and num_rows > 100:
                    # Likely an ID column
                    id_cols.append(col)
        if len(id_cols) > 0:
            problems.append(f"{len(id_cols)} possible ID columns detected")
            recommendations.append(f"Remove ID columns ({', '.join(id_cols[:3])}) before training. Models can memorize IDs instead of learning patterns.")
            health_score -= 5
            
        # 4. Target Analysis (Imbalance & Leakage)
        target_distribution = []
        if target_column in df.columns:
            target_series = df[target_column].dropna()
            
            is_classification = False
            # Simple heuristic for classification vs regression
            if target_series.dtype == 'object' or target_series.nunique() < 20:
                is_classification = True
                
            if is_classification:
                counts = target_series.value_counts(normalize=True)
                for val, pct in counts.items():
                    target_distribution.append({"class": str(val), "percentage": float(pct * 100)})
                    
                if not counts.empty and counts.iloc[0] > 0.8:
                    problems.append(f"High class imbalance detected in target '{target_column}'")
                    recommendations.append("Consider using SMOTE, class weights, or stratified sampling to handle the imbalance.")
                    health_score -= 15
                    
            # Target Leakage (High correlation with target)
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                # Only check numeric columns for correlation leakage
                numeric_df = df.select_dtypes(include=[np.number])
                if target_column in numeric_df.columns:
                    correlations = numeric_df.corrwith(numeric_df[target_column]).abs()
                    leakage_cols = []
                    for col, corr_val in correlations.items():
                        if col != target_column and corr_val > 0.90:
                            leakage_cols.append(col)
                            
                    if leakage_cols:
                        problems.append(f"Target leakage suspected ({len(leakage_cols)} highly correlated features)")
                        recommendations.append(f"Review features heavily correlated (>0.90) with target: {', '.join(leakage_cols[:3])}")
                        health_score -= 20
        
        # 5. Train/Test Split Advisor
        split_advice = {}
        has_time_series = False
        for col in columns:
            col_lower = str(col).lower()
            if 'date' in col_lower or 'time' in col_lower or 'year' in col_lower:
                has_time_series = True
                break
                
        if has_time_series:
            split_advice = {
                "detected": "Time Series",
                "recommended": "80/20 (Time-based)",
                "stratify": "NO",
                "shuffle": "NO"
            }
        elif 'is_classification' in locals() and is_classification:
            split_advice = {
                "detected": "Classification",
                "recommended": "80/20",
                "stratify": "YES",
                "shuffle": "YES"
            }
        else:
            split_advice = {
                "detected": "Regression",
                "recommended": "80/20",
                "stratify": "NO",
                "shuffle": "YES"
            }
            
        # 6. Outlier Explorer (IQR Method)
        outliers_advice = []
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            # For outliers, use the original df for purely numeric columns (not the factorized strings)
            pure_numeric = df.select_dtypes(include=[np.number])
            for col in pure_numeric.columns:
                series = pure_numeric[col].dropna()
                if len(series) < 10:
                    continue
                    
                # Calculate IQR
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                
                if iqr > 0:
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    
                    outliers = series[(series < lower_bound) | (series > upper_bound)]
                    outlier_count = len(outliers)
                    
                    if outlier_count > 0:
                        pct = (outlier_count / len(series)) * 100
                        if pct > 5:
                            recommendation = "Clip / Winsorize"
                        elif pct < 1:
                            recommendation = "Investigate / Drop"
                        else:
                            recommendation = "Robust Scaler"
                            
                        outliers_advice.append({
                            "column": str(col),
                            "outlier_count": int(outlier_count),
                            "method": "IQR",
                            "recommendation": recommendation,
                            "outlier_pct": float(pct)
                        })
        
        # 7. Feature Dependency Graph (Path Extraction)
        dependency_paths = []
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            if target_column in numeric_df_all.columns:
                target_corrs = numeric_df_all.corrwith(numeric_df_all[target_column]).abs()
                full_corr = numeric_df_all.corr().abs()
                
                edges = {}
                incoming_counts = {col: 0 for col in numeric_df_all.columns}
                features = [col for col in numeric_df_all.columns if col != target_column]
                
                for feature in features:
                    feat_target_corr = target_corrs.get(feature, 0)
                    candidates = []
                    for c in numeric_df_all.columns:
                        if c == feature: continue
                        # Must be strictly closer to target AND corr >= 0.4
                        if target_corrs.get(c, 0) > feat_target_corr and full_corr.loc[feature, c] >= 0.4:
                            candidates.append((c, full_corr.loc[feature, c]))
                            
                    if candidates:
                        candidates.sort(key=lambda x: x[1], reverse=True)
                        top_candidates = candidates[:3]
                        edges[feature] = top_candidates
                        for c, _ in top_candidates:
                            incoming_counts[c] += 1
                    elif feat_target_corr >= 0.4:
                        edges[feature] = [(target_column, feat_target_corr)]
                        incoming_counts[target_column] += 1
                        
                # Identify leaves (nodes with no incoming edges that have outgoing edges)
                leaves = [n for n in features if incoming_counts[n] == 0 and n in edges]
                all_paths = []
                
                def dfs(current_node, current_path, current_corrs):
                    if current_node not in edges or not edges[current_node]:
                        if len(current_path) > 1:
                            all_paths.append({
                                "nodes": current_path.copy(),
                                "avg_corr": sum(current_corrs) / len(current_corrs) if current_corrs else 0
                            })
                        return
                        
                    for next_node, weight in edges[current_node]:
                        if next_node not in current_path:
                            current_path.append(next_node)
                            current_corrs.append(weight)
                            dfs(next_node, current_path, current_corrs)
                            current_path.pop()
                            current_corrs.pop()
                            
                for leaf in leaves:
                    dfs(leaf, [leaf], [])
                    
                all_paths.sort(key=lambda x: (len(x["nodes"]), x["avg_corr"]), reverse=True)
                for p in all_paths:
                    dependency_paths.append(p["nodes"])

        # Correlation Matrix for Heatmap
        correlation_matrix = None
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            if not numeric_df_all.empty:
                # Limit to 30 columns to prevent massive matrices
                if len(numeric_df_all.columns) > 30:
                    numeric_df = numeric_df_all.iloc[:, :30]
                else:
                    numeric_df = numeric_df_all
                
                corr = numeric_df.corr().round(2).fillna(0)
                correlation_matrix = {
                    "features": corr.columns.tolist(),
                    "matrix": corr.values.tolist()
                }
        
        health_score = max(0, int(health_score))
        
        return {
            "is_valid": True,
            "columns": columns,
            "guessed_target": guessed_target,
            "metrics": {
                "health_score": health_score,
                "problems": problems,
                "recommendations": recommendations,
                "total_rows": num_rows,
                "total_columns": len(columns),
                "preprocessing_advice": sorted(preprocessing_advice, key=lambda x: x["missing_pct"], reverse=True),
                "split_advice": split_advice,
                "outliers_advice": sorted(outliers_advice, key=lambda x: x["outlier_count"], reverse=True),
                "dependency_paths": dependency_paths,
                "visualizations": {
                    "null_distribution": sorted(null_distribution, key=lambda x: x["null_percentage"], reverse=True)[:10],
                    "target_distribution": target_distribution,
                    "correlation_matrix": correlation_matrix
                }
            }
        }
    except Exception as e:
        return {"is_valid": False, "error": str(e)}


@router.post("/feature-intelligence")
async def feature_intelligence(
    file: UploadFile = File(...),
    target_column: Optional[str] = Form(None)
):
    try:
        content = await file.read()

        # Security: file size cap
        if len(content) > 5 * 1024 * 1024:
            return {"is_valid": False, "error": "File size exceeds the 5MB limit."}

        # Security: filetype whitelist
        filename = (file.filename or "").lower()
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            return {"is_valid": False, "error": "Only CSV and Excel files are supported."}

        if df.empty:
            return {"is_valid": False, "error": "The dataset is empty."}

        results = compute_feature_intelligence(df, target_column)
        if "error" in results:
            return {"is_valid": False, "error": results["error"]}

        return {"is_valid": True, "results": results}

    except Exception as e:
        return {"is_valid": False, "error": str(e)}
