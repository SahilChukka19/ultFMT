"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  UploadCloud, FileText, TrendingUp, Settings2,
  AlertCircle, ChevronDown, ChevronUp, Terminal, BookOpen
} from "lucide-react";

// Color palette for lines
const LINE_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"
];

// Snippets showing users how to export training logs as CSV
const HOW_TO_SNIPPETS = [
  {
    label: "Keras / TensorFlow",
    lang: "python",
    code: `from tensorflow import keras
import pandas as pd

model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=50)

# Export history to CSV
history_df = pd.DataFrame(model.history.history)
history_df.index.name = "epoch"
history_df.to_csv("training_log.csv")`,
  },
  {
    label: "PyTorch Lightning (CSVLogger)",
    lang: "python",
    code: `from pytorch_lightning.loggers import CSVLogger

logger = CSVLogger("logs/", name="my_model")
trainer = Trainer(logger=logger, max_epochs=50)
trainer.fit(model, datamodule)

# CSV saved at: logs/my_model/version_0/metrics.csv`,
  },
  {
    label: "PyTorch (manual)",
    lang: "python",
    code: `import csv

with open("training_log.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["epoch", "train_loss", "val_loss"])

    for epoch in range(num_epochs):
        train_loss = train_one_epoch(...)
        val_loss = validate(...)
        writer.writerow([epoch + 1, train_loss, val_loss])`,
  },
  {
    label: "scikit-learn (manual)",
    lang: "python",
    code: `import pandas as pd
from sklearn.model_selection import learning_curve

train_sizes, train_scores, val_scores = learning_curve(
    estimator, X, y, cv=5, scoring="accuracy"
)

df = pd.DataFrame({
    "train_size": train_sizes,
    "train_score": train_scores.mean(axis=1),
    "val_score": val_scores.mean(axis=1),
})
df.to_csv("learning_curve.csv", index=False)`,
  },
];

function CodeSnippet({ snippet }: { snippet: typeof HOW_TO_SNIPPETS[0] }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300">
        <span className="font-semibold">{snippet.label}</span>
        <button onClick={copy} className="text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 bg-slate-900 text-slate-200 overflow-x-auto leading-relaxed">{snippet.code}</pre>
    </div>
  );
}

export default function LearningCurvePlotterPage() {
  const [csvData, setCsvData] = useState<Record<string, number>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState<string>("");
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const MAX_ROWS = 10_000;
  const MAX_COLS = 30;

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setError("CSV must have at least a header row and one data row.");
      return;
    }

    // 4. Row count cap
    if (lines.length - 1 > MAX_ROWS) {
      setError(`CSV has too many rows. Maximum allowed is ${MAX_ROWS.toLocaleString()} rows.`);
      return;
    }

    // 5. Sanitize headers: strip quotes, trim, limit length, remove non-printable chars
    const rawHeaders = lines[0].split(",").map((h) =>
      h.trim().replace(/^"|"$/g, "").replace(/[^\x20-\x7E]/g, "").slice(0, 64)
    );

    // 6. Column count cap
    if (rawHeaders.length > MAX_COLS) {
      setError(`CSV has too many columns. Maximum allowed is ${MAX_COLS} columns.`);
      return;
    }

    const headers = rawHeaders.filter((h) => h.length > 0);
    if (headers.length === 0) {
      setError("Could not parse any valid column headers.");
      return;
    }

    const rows: Record<string, number>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, number> = {};
      headers.forEach((h, idx) => {
        const raw = parseFloat(vals[idx]);
        // 7. Filter NaN and Infinity — both break recharts silently
        if (Number.isFinite(raw)) row[h] = raw;
      });
      if (Object.keys(row).length > 0) rows.push(row);
    }

    if (rows.length === 0) {
      setError("No valid numeric data found. Ensure your CSV contains numeric columns.");
      return;
    }

    setError(null);
    setColumns(headers);
    setCsvData(rows);

    // Auto-select x axis: prefer "epoch", "step", "iteration", else first column
    const xGuess = headers.find((h) =>
      ["epoch", "step", "iteration", "train_size"].includes(h.toLowerCase())
    ) || headers[0];
    setXAxis(xGuess);

    // Auto-select lines: everything except x axis, up to 6
    const lineGuess = headers.filter((h) => h !== xGuess);
    setSelectedLines(lineGuess.slice(0, 6));
  }, []);

  const handleFile = (file: File) => {
    // 1. Extension whitelist
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported.");
      return;
    }
    // 2. File size cap: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // 3. Binary content sniff — CSVs must be printable text
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text.slice(0, 1000))) {
        setError("File appears to be binary, not a text CSV.");
        return;
      }
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const toggleLine = (col: string) => {
    setSelectedLines((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const plotData = csvData.map((row) => {
    const point: Record<string, number> = {};
    if (xAxis) point[xAxis] = row[xAxis];
    selectedLines.forEach((col) => { point[col] = row[col]; });
    return point;
  });

  const lineColumns = columns.filter((c) => c !== xAxis);

  return (
    <ToolLayout
      title="Learning Curve Plotter"
      description="Upload a training log CSV and instantly visualize loss, accuracy, and other metrics over epochs."
    >
      <div className="flex h-full w-full bg-slate-50 overflow-hidden">

        {/* Left Pane */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
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
                accept=".csv"
              />
              <div className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Drop Training Log CSV</p>
              <p className="text-xs text-slate-500">CSV only · columns auto-detected</p>
            </div>

            {fileName && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-900 truncate">{fileName}</p>
              </div>
            )}

            {/* X-Axis selector */}
            {columns.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 block">X-Axis</label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Line toggles */}
            {lineColumns.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">Metrics to Plot</label>
                {lineColumns.map((col, i) => (
                  <label key={col} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedLines.includes(col) ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}
                      onClick={() => toggleLine(col)}
                    >
                      {selectedLines.includes(col) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm text-slate-700 group-hover:text-slate-900"
                      style={{ color: selectedLines.includes(col) ? LINE_COLORS[i % LINE_COLORS.length] : undefined }}
                      onClick={() => toggleLine(col)}
                    >
                      {col}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Reset */}
            {csvData.length > 0 && (
              <button
                onClick={() => { setCsvData([]); setColumns([]); setFileName(""); setError(null); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg py-2 transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 xl:p-8 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Parse Error</p>
                <p className="text-sm mt-0.5 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {/* Chart */}
          {csvData.length > 0 && selectedLines.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Learning Curves — {fileName}
              </h3>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={plotData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey={xAxis}
                    label={{ value: xAxis, position: "insideBottomRight", offset: -10, fontSize: 12 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} width={55} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value: any, name: any) => [
                      typeof value === "number" ? value.toFixed(4) : value,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
                  {selectedLines.map((col, i) => (
                    <Line
                      key={col}
                      type="monotone"
                      dataKey={col}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={csvData.length <= 30}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : csvData.length === 0 && !error ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-4 min-h-[300px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-500">No Data Yet</p>
                <p className="text-sm mt-1">Upload a training log CSV to see your learning curves.</p>
              </div>
            </div>
          ) : null}

          {/* How to get the CSV guide */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowGuide((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">How to export your training log as CSV</p>
                  <p className="text-xs text-slate-500 mt-0.5">Keras, PyTorch, PyTorch Lightning, scikit-learn</p>
                </div>
              </div>
              {showGuide
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showGuide && (
              <div className="px-6 pb-6 space-y-5 border-t border-slate-100 pt-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
                  <Terminal className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Expected CSV format:</strong> The first row must be column headers.
                    One column should be <code className="bg-amber-100 px-1 rounded">epoch</code> or <code className="bg-amber-100 px-1 rounded">step</code> (used as X-axis).
                    All other numeric columns are plotted as lines.
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Framework Snippets</div>

                <div className="space-y-4">
                  {HOW_TO_SNIPPETS.map((s) => (
                    <CodeSnippet key={s.label} snippet={s} />
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700 mb-2">📋 Example CSV structure</p>
                  <pre className="font-mono text-slate-500 leading-relaxed">{`epoch,train_loss,val_loss,train_acc,val_acc
1,0.8512,0.9103,0.6241,0.5873
2,0.7130,0.7923,0.7019,0.6612
3,0.5821,0.6789,0.7734,0.7301
4,0.4512,0.6201,0.8312,0.7819`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
