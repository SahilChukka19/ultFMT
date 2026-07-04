"use client";

import { useState, useRef } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Upload, AlertCircle, CheckCircle2, FileText, ChevronRight, BarChart2, Activity, Settings2, AlertTriangle, Network, ArrowRight, FileSpreadsheet, Info, ChevronDown, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type HealthMetrics = {
  health_score: number;
  problems: string[];
  recommendations: string[];
  total_rows: number;
  total_columns: number;
  preprocessing_advice: { column: string; recommended: string; reason: string; missing_pct: number; mcar: string; mar: string; mnar: string }[];
  split_advice?: { detected: string; recommended: string; stratify: string; shuffle: string };
  outliers_advice?: { column: string; outlier_count: number; method: string; recommendation: string; outlier_pct: number }[];
  dependency_paths?: string[][];
  visualizations: {
    null_distribution: { column: string; null_percentage: number }[];
    target_distribution: { class: string; percentage: number }[];
    correlation_matrix?: { features: string[]; matrix: number[][] } | null;
  };
};

export default function DatasetHealthPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllPaths, setShowAllPaths] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeDataset = async (selectedFile: File, selectedTarget: string | null = null) => {
    setIsAnalyzing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (selectedTarget) {
      formData.append("target_column", selectedTarget);
    }
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${baseUrl}/tools/dataset-health`, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.is_valid) {
        throw new Error(data.error || "Failed to analyze dataset.");
      }
      
      setColumns(data.columns);
      setTargetColumn(data.guessed_target || "");
      setMetrics(data.metrics);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      analyzeDataset(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      analyzeDataset(droppedFile);
    } else {
      setError("Please drop a valid CSV or Excel file.");
    }
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTarget = e.target.value;
    setTargetColumn(newTarget);
    if (file) {
      analyzeDataset(file, newTarget);
    }
  };

  const renderHealthGauge = () => {
    if (!metrics) return null;
    const score = metrics.health_score;
    let color = "text-red-500";
    let strokeColor = "stroke-red-500";
    if (score > 85) {
      color = "text-green-500";
      strokeColor = "stroke-green-500";
    } else if (score > 60) {
      color = "text-yellow-500";
      strokeColor = "stroke-yellow-500";
    }
    
    const strokeDasharray = `${score}, 100`;

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm h-full">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Health Score</h3>
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              className="stroke-slate-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
            />
            <path
              className={`${strokeColor} transition-all duration-1000 ease-out`}
              strokeDasharray={strokeDasharray}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-3xl font-bold ${color}`}>{score}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPreprocessingAdvisor = () => {
    if (!metrics || !metrics.preprocessing_advice || metrics.preprocessing_advice.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8 mb-2">
        <div className="bg-indigo-50/30 px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-indigo-900 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
            Preprocessing Advisor (Imputation)
          </h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="font-semibold p-4">Missing Value Column</th>
                <th className="font-semibold p-4">Recommended Imputation</th>
                <th className="font-semibold p-4">Reason</th>
                <th className="font-semibold p-4 text-center">MCAR</th>
                <th className="font-semibold p-4 text-center">MAR</th>
                <th className="font-semibold p-4 text-center">MNAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.preprocessing_advice.map((advice, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-slate-800">{advice.column}</span>
                    <span className="ml-3 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">{advice.missing_pct.toFixed(1)}% missing</span>
                  </td>
                  <td className="p-4 font-medium text-indigo-600">{advice.recommended}</td>
                  <td className="p-4 text-slate-500">{advice.reason}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${advice.mcar === 'Likely' ? 'bg-green-100 text-green-700' : advice.mcar === 'Possible' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{advice.mcar}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${advice.mar === 'Likely' ? 'bg-green-100 text-green-700' : advice.mar === 'Possible' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{advice.mar}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${advice.mnar === 'Likely' ? 'bg-green-100 text-green-700' : advice.mnar === 'Possible' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{advice.mnar}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSplitAdvisor = () => {
    if (!metrics || !metrics.split_advice) return null;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8 mb-2">
        <div className="bg-indigo-50/30 px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-indigo-900 flex items-center">
            <Settings2 className="h-4 w-4 mr-2 text-indigo-600" />
            Train/Test Split Advisor
          </h3>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected Task</span>
            <span className="text-sm font-bold text-indigo-700">{metrics.split_advice.detected}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Split Ratio</span>
            <span className="text-sm font-bold text-slate-800">{metrics.split_advice.recommended}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stratify</span>
            <span className={`text-sm font-bold ${metrics.split_advice.stratify === 'YES' ? 'text-green-600' : 'text-slate-600'}`}>
              {metrics.split_advice.stratify}
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shuffle</span>
            <span className={`text-sm font-bold ${metrics.split_advice.shuffle === 'YES' ? 'text-green-600' : 'text-slate-600'}`}>
              {metrics.split_advice.shuffle}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderOutlierExplorer = () => {
    if (!metrics || !metrics.outliers_advice || metrics.outliers_advice.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8 mb-2">
        <div className="bg-indigo-50/30 px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-indigo-900 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-indigo-600" />
            Outlier Explorer
          </h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="font-semibold p-4">Feature</th>
                <th className="font-semibold p-4">Outliers Detected</th>
                <th className="font-semibold p-4">Method</th>
                <th className="font-semibold p-4">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.outliers_advice.map((advice, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{advice.column}</td>
                  <td className="p-4">
                    <span className="font-semibold text-rose-600">{advice.outlier_count}</span>
                    <span className="ml-2 text-xs text-slate-500">({advice.outlier_pct.toFixed(1)}%)</span>
                  </td>
                  <td className="p-4 text-slate-500">{advice.method}</td>
                  <td className="p-4 font-medium text-indigo-600">{advice.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDependencyGraph = () => {
    if (!metrics || !metrics.dependency_paths || metrics.dependency_paths.length === 0) return null;
    
    const displayPaths = showAllPaths ? metrics.dependency_paths : metrics.dependency_paths.slice(0, 10);
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8 mb-2">
        <div className="bg-indigo-50/30 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-indigo-900 flex items-center">
            <Network className="h-4 w-4 mr-2 text-indigo-600" />
            Feature Dependency Flow
          </h3>
          {metrics.dependency_paths.length > 10 && (
            <button 
              onClick={() => setShowAllPaths(!showAllPaths)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              {showAllPaths ? "Show Top 10" : `Show All (${metrics.dependency_paths.length})`}
            </button>
          )}
        </div>
        <div className="p-5 flex flex-col gap-4">
          {displayPaths.map((path, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              {path.map((node, nIdx) => (
                <div key={nIdx} className="flex items-center">
                  <span className={`px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm border ${
                    nIdx === path.length - 1 
                      ? 'bg-indigo-600 text-white border-indigo-700' 
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {node}
                  </span>
                  {nIdx < path.length - 1 && (
                    <ArrowRight className="w-4 h-4 mx-2 text-slate-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVisualizations = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {metrics.visualizations.null_distribution.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center mb-4">
              <BarChart2 className="w-4 h-4 mr-2 text-indigo-500" />
              Highest Null Percentages
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.visualizations.null_distribution} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="column" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Nulls']} />
                  <Bar dataKey="null_percentage" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center mb-4">
            <Activity className="w-4 h-4 mr-2 text-blue-500" />
            Target Class Distribution
          </h3>
          {metrics.visualizations.target_distribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.visualizations.target_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Frequency']} />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg">
              <Activity className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">Not applicable for regression targets</p>
              <p className="text-xs text-slate-400 mt-1">Class distribution requires a categorical target</p>
            </div>
          )}
        </div>

        {metrics.visualizations.correlation_matrix && metrics.visualizations.correlation_matrix.features.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 xl:col-span-2 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center mb-4">
              <Activity className="w-4 h-4 mr-2 text-indigo-500" />
              Feature Correlation Matrix
            </h3>
            <div className="min-w-max">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border-b border-r border-slate-200 bg-slate-50 text-slate-500 font-medium"></th>
                    {metrics.visualizations.correlation_matrix.features.map(f => (
                      <th key={f} className="p-2 border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold max-w-[80px] truncate" title={f}>{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.visualizations.correlation_matrix.features.map((f1, i) => (
                    <tr key={f1}>
                      <td className="p-2 border-r border-slate-200 bg-slate-50 text-slate-700 font-semibold text-right truncate max-w-[120px]" title={f1}>{f1}</td>
                      {metrics.visualizations.correlation_matrix!.matrix[i].map((val, j) => {
                        let colorClass = "bg-slate-50 text-slate-400";
                        if (val === 1) colorClass = "bg-indigo-600 text-white font-bold";
                        else if (val > 0.8) colorClass = "bg-indigo-400 text-white";
                        else if (val > 0.5) colorClass = "bg-indigo-200 text-indigo-900";
                        else if (val > 0.2) colorClass = "bg-indigo-50 text-indigo-800";
                        else if (val < -0.8) colorClass = "bg-rose-500 text-white";
                        else if (val < -0.5) colorClass = "bg-rose-300 text-rose-900";
                        else if (val < -0.2) colorClass = "bg-rose-100 text-rose-800";
                        
                        return (
                          <td key={j} className={`p-2 border border-slate-100 ${colorClass}`} title={`${f1} vs ${metrics.visualizations.correlation_matrix!.features[j]}: ${val}`}>
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const actions = (
    <Button onClick={() => fileInputRef.current?.click()} className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all">
      <Upload className="mr-2 h-4 w-4" />
      Upload Dataset
    </Button>
  );

  return (
    <ToolLayout
      title="Dataset Health Studio"
      description="Deeply analyze your CSV/Excel datasets for common Machine Learning pitfalls like target leakage, extreme nulls, and class imbalances."
      actions={actions}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".csv,.xlsx,.xls"
      />

      <div className="flex flex-col lg:flex-row flex-1 w-full bg-slate-50 overflow-visible lg:overflow-hidden">
        
        {/* Left Pane - Upload and Settings */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
          <div className="flex items-center px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <Settings2 className="h-4 w-4 mr-2 text-slate-500" />
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Configuration</h2>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            {!file ? (
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Drop Dataset Here</h3>
                <p className="text-xs text-slate-500">Supports .CSV, .XLSX (Max 100MB)</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {metrics ? `${metrics.total_rows.toLocaleString()} rows` : "Analyzing..."}
                    </p>
                  </div>
                </div>

                {columns.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">
                      Target / Label Column
                    </label>
                    <p className="text-xs text-slate-500 -mt-2">
                      We heuristically guessed this. Change it to re-run the target analysis (leakage, imbalance).
                    </p>
                    <div className="relative">
                      <select
                        value={targetColumn}
                        onChange={handleTargetChange}
                        disabled={isAnalyzing}
                        className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-shadow"
                      >
                        {columns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-sm font-medium"
                  onClick={() => {
                    setFile(null);
                    setMetrics(null);
                    setColumns([]);
                  }}
                >
                  Start Over
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Results */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 xl:p-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start mb-6">
              <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1">Analysis Failed</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-500">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="font-medium animate-pulse">Profiling dataset health...</p>
            </div>
          )}

          {!isAnalyzing && !metrics && !error && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Activity className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500 mb-1">Ready for Analysis</p>
              <p className="text-sm text-center max-w-sm">Upload a CSV or Excel dataset to generate a comprehensive health report, identify leakage, and view statistics.</p>
            </div>
          )}

          {!isAnalyzing && metrics && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Score */}
                <div className="flex-shrink-0">
                  {renderHealthGauge()}
                </div>

                {/* Top Level Stats */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Rows</span>
                    <span className="text-2xl font-bold text-slate-800">{metrics.total_rows.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Columns</span>
                    <span className="text-2xl font-bold text-slate-800">{metrics.total_columns.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Issues Found</span>
                    <span className="text-2xl font-bold text-slate-800">{metrics.problems.length}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Target Variable</span>
                    <span className="text-lg font-bold text-slate-800 truncate" title={targetColumn}>{targetColumn}</span>
                  </div>
                </div>
              </div>

              {/* Problems & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-red-50/50 px-5 py-4 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-red-800 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Detected Problems
                    </h3>
                  </div>
                  <div className="p-5 flex-1">
                    {metrics.problems.length > 0 ? (
                      <ul className="space-y-4">
                        {metrics.problems.map((prob, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 mr-3 flex-shrink-0"></span>
                            {prob}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center text-sm text-green-600 font-medium h-full justify-center py-4">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        No critical problems detected!
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-indigo-50/50 px-5 py-4 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-indigo-800 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Actionable Recommendations
                    </h3>
                  </div>
                  <div className="p-5 flex-1">
                    {metrics.recommendations.length > 0 ? (
                      <ul className="space-y-4">
                        {metrics.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-3 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center text-sm text-slate-500 h-full justify-center py-4">
                        Your dataset looks clean and ready for training.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preprocessing Advisor */}
              {renderPreprocessingAdvisor()}

              {/* Split Advisor */}
              {renderSplitAdvisor()}

              {/* Outlier Explorer */}
              {renderOutlierExplorer()}

              {/* Dependency Graph */}
              {renderDependencyGraph()}

              {/* Charts */}
              {renderVisualizations()}

            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
