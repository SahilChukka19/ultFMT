"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { analyzeFeatures } from "@/lib/api";
import {
  UploadCloud, AlertCircle, FileSpreadsheet, Activity,
  BrainCircuit, Target, Settings2, TrendingUp
} from "lucide-react";

export default function FeatureIntelligencePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setResults(null); setError(null); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResults(null); setError(null); }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeFeatures(file, targetColumn || undefined);
      if (data.is_valid) setResults(data.results);
      else setError(data.error || "Analysis failed.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const redundancyColor = (score: number) =>
    score > 0.7 ? "bg-red-500" : score > 0.4 ? "bg-orange-400" : "bg-emerald-500";

  const redundancyLabel = (score: number) =>
    score > 0.7 ? "High" : score > 0.4 ? "Medium" : "Low";

  return (
    <ToolLayout
      title="Feature Intelligence"
      description="Compute Pearson, Spearman, VIF, PCA, Mutual Information, and ANOVA scores for your dataset."
    >
      <div className="flex flex-col lg:flex-row flex-1 w-full bg-slate-50 overflow-visible lg:overflow-hidden">

        {/* Left Pane */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
          <div className="flex items-center px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <Settings2 className="h-4 w-4 mr-2 text-slate-500" />
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Configuration</h2>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5">
            {/* Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative group"
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".csv,.xls,.xlsx"
              />
              <div className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Drop Dataset Here</p>
              <p className="text-xs text-slate-500">CSV, XLS, XLSX · Max 5MB</p>
            </div>

            {file && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-emerald-900 truncate">{file.name}</p>
                  <p className="text-xs text-emerald-700">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* Target column */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Target Column <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <p className="text-xs text-slate-500">Unlocks Mutual Information and ANOVA F-scores.</p>
              <input
                type="text"
                placeholder="e.g. price, survived, label"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={handleAnalyze}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  Extract Intelligence
                </span>
              )}
            </Button>

            {results && (
              <Button variant="outline" className="w-full text-sm"
                onClick={() => { setFile(null); setResults(null); setError(null); setTargetColumn(""); }}>
                Start Over
              </Button>
            )}

            {/* Legend */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metric Reference</p>
              <p className="text-xs text-slate-600"><strong className="text-slate-800">VIF &gt; 5:</strong> Multicollinear — consider dropping.</p>
              <p className="text-xs text-slate-600"><strong className="text-slate-800">PCA Loading:</strong> Contribution to 1st principal component.</p>
              <p className="text-xs text-slate-600"><strong className="text-slate-800">Redundancy:</strong> Blend of avg correlation + VIF. Higher = more redundant.</p>
              <p className="text-xs text-slate-600"><strong className="text-slate-800">Mutual Info:</strong> Non-linear predictive power vs target.</p>
              <p className="text-xs text-slate-600"><strong className="text-slate-800">ANOVA F:</strong> Linear predictive power vs target.</p>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 xl:p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Analysis Failed</p>
                <p className="text-sm mt-0.5 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {!results && !isLoading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-500">No Analysis Yet</p>
                <p className="text-sm mt-1">Upload a CSV and click <strong>Extract Intelligence</strong> to begin.</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Running analysis… first run loads the ML engine, may take a few seconds.</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">

              {/* PCA Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PCA — 1st Component</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{results.pca_variance_explained}%</p>
                  <p className="text-sm text-slate-500 mt-0.5">of total variance explained by the first principal component</p>
                </div>
              </div>

              {/* Main Feature Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Feature Rankings
                  </h3>
                  <span className="text-xs text-slate-400">{results.features.length} features</span>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3">Feature</th>
                        <th className="px-5 py-3 text-right">Pearson</th>
                        <th className="px-5 py-3 text-right">Spearman</th>
                        <th className="px-5 py-3 text-right">VIF</th>
                        <th className="px-5 py-3 text-right">PCA Loading</th>
                        <th className="px-5 py-3">Redundancy</th>
                        {results.target_analysis && <th className="px-5 py-3 text-right bg-blue-50 text-blue-700">MI</th>}
                        {results.target_analysis && <th className="px-5 py-3 text-right bg-blue-50 text-blue-700">ANOVA F</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {results.features.map((feature: string) => {
                        // Get avg pearson corr with all other features (excluding self)
                        const peers = results.features.filter((f: string) => f !== feature);
                        const avgPearson = peers.length > 0
                          ? peers.reduce((sum: number, f: string) => sum + Math.abs(results.correlations[feature][f].pearson), 0) / peers.length
                          : 0;

                        return (
                          <tr key={feature} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-900">{feature}</td>
                            <td className="px-5 py-3 text-right font-mono text-xs">{avgPearson.toFixed(3)}</td>
                            <td className="px-5 py-3 text-right font-mono text-xs">
                              {peers.length > 0
                                ? (peers.reduce((sum: number, f: string) => sum + Math.abs(results.correlations[feature][f].spearman), 0) / peers.length).toFixed(3)
                                : "—"}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {results.vif[feature] === -1
                                ? <span className="text-red-500 font-medium">∞</span>
                                : <span className={results.vif[feature] > 5 ? "text-orange-500 font-semibold" : ""}>
                                    {results.vif[feature].toFixed(1)}
                                  </span>}
                            </td>
                            <td className="px-5 py-3 text-right font-mono text-xs">{results.pca_loadings[feature]?.toFixed(4)}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${redundancyColor(results.redundancy_score[feature])}`}
                                    style={{ width: `${results.redundancy_score[feature] * 100}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${results.redundancy_score[feature] > 0.7 ? "text-red-500" : results.redundancy_score[feature] > 0.4 ? "text-orange-500" : "text-emerald-600"}`}>
                                  {redundancyLabel(results.redundancy_score[feature])}
                                </span>
                              </div>
                            </td>
                            {results.target_analysis && (
                              <td className="px-5 py-3 text-right bg-blue-50/20 font-medium text-blue-700">
                                {results.target_analysis[feature]?.mutual_information?.toFixed(3) ?? "—"}
                              </td>
                            )}
                            {results.target_analysis && (
                              <td className="px-5 py-3 text-right bg-blue-50/20 text-blue-600">
                                {results.target_analysis[feature]?.anova_f_score?.toFixed(1) ?? "—"}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Predictors */}
              {results.target_analysis && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5" />
                    Top Predictors for <span className="font-bold ml-1">"{targetColumn}"</span>
                  </h3>
                  <p className="text-xs text-blue-600 mb-4">
                    Detected as <span className="font-semibold capitalize">{results.target_type}</span> · ranked by Mutual Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {results.features
                      .filter((f: string) => f !== targetColumn && results.target_analysis[f])
                      .sort((a: string, b: string) =>
                        results.target_analysis[b].mutual_information - results.target_analysis[a].mutual_information
                      )
                      .slice(0, 3)
                      .map((feature: string, idx: number) => (
                        <div key={feature} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            #{idx + 1} Best Predictor
                          </div>
                          <div className="font-bold text-slate-800 truncate" title={feature}>{feature}</div>
                          <div className="text-sm text-blue-600 font-medium mt-1.5">
                            MI: {results.target_analysis[feature].mutual_information.toFixed(3)}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            F: {results.target_analysis[feature].anova_f_score.toFixed(1)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
