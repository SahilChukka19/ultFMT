"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Settings2, BarChart3, Database } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

const EMBEDDING_MODELS = [
  { id: "text-embedding-3-small", name: "OpenAI text-embedding-3-small", costPer1M: 0.02 },
  { id: "text-embedding-3-large", name: "OpenAI text-embedding-3-large", costPer1M: 0.13 },
  { id: "text-embedding-ada-002", name: "OpenAI text-embedding-ada-002", costPer1M: 0.10 },
  { id: "cohere-embed-v3", name: "Cohere embed-english-v3.0", costPer1M: 0.10 },
  { id: "bge-large-en", name: "BGE-Large (Open Source)", costPer1M: 0.00 }
];

const SEPARATORS = [
  { id: "double_newline", label: "Double Newline (\\n\\n)", value: "\n\n" },
  { id: "newline", label: "Newline (\\n)", value: "\n" },
  { id: "period", label: "Sentence (.)", value: ". " },
  { id: "space", label: "Word (Space)", value: " " },
  { id: "char", label: "Character", value: "" }
];

type Chunk = {
  id: number;
  text: string;
  overlapFromPrev: string;
};

export default function RAGPlaygroundPage() {
  const [documentText, setDocumentText] = useState("");
  const [fileName, setFileName] = useState("No file selected");
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(50);
  const [separatorId, setSeparatorId] = useState("double_newline");
  const [modelId, setModelId] = useState("text-embedding-3-small");
  
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced Chunking Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!documentText) {
        setChunks([]);
        return;
      }

      const separator = SEPARATORS.find(s => s.id === separatorId)?.value ?? "\n\n";
      const maxChars = chunkSize * 4; // Approx 4 chars per token
      const overlapChars = overlap * 4;
      
      const splits = separator ? documentText.split(separator) : documentText.split('');
      
      let newChunks: Chunk[] = [];
      let currentChunk: string[] = [];
      let currentLength = 0;
      let currentOverlapFromPrev = "";

      for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        const splitLen = split.length + (separator ? separator.length : 0);
        
        if (currentLength + splitLen > maxChars && currentChunk.length > 0) {
           const chunkText = currentChunk.join(separator);
           newChunks.push({ id: newChunks.length + 1, text: chunkText, overlapFromPrev: currentOverlapFromPrev });
           
           let overlapPieces: string[] = [];
           let overlapLen = 0;
           for (let j = currentChunk.length - 1; j >= 0; j--) {
               const pLen = currentChunk[j].length + (separator ? separator.length : 0);
               if (overlapLen + pLen <= overlapChars || overlapPieces.length === 0) {
                   overlapPieces.unshift(currentChunk[j]);
                   overlapLen += pLen;
               } else {
                   break;
               }
           }
           
           currentOverlapFromPrev = overlapPieces.join(separator) + (separator && i < splits.length - 1 ? separator : ""); // rough approximation for overlap highlight
           currentChunk = [...overlapPieces, split];
           currentLength = overlapLen + splitLen;
        } else {
           currentChunk.push(split);
           currentLength += splitLen;
        }
      }
      
      if (currentChunk.length > 0) {
          const chunkText = currentChunk.join(separator);
          newChunks.push({ id: newChunks.length + 1, text: chunkText, overlapFromPrev: currentOverlapFromPrev });
      }

      setChunks(newChunks);
    }, 300);

    return () => clearTimeout(timer);
  }, [documentText, chunkSize, overlap, separatorId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setErrorMsg("File is too large. Max size is 1MB.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setDocumentText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const selectedModel = EMBEDDING_MODELS.find(m => m.id === modelId)!;
  
  // Calculate Analytics
  const totalTokens = Math.ceil(documentText.length / 4);
  const estimatedCost = (totalTokens / 1_000_000) * selectedModel.costPer1M;
  
  // Heuristic Quality
  let quality = "Excellent";
  let qualityColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (chunkSize > 1500) {
    quality = "Poor (Chunks too large, loss of precision)";
    qualityColor = "text-red-700 bg-red-50 border-red-200";
  } else if (chunkSize < 100) {
    quality = "Poor (Chunks too small, loss of context)";
    qualityColor = "text-red-700 bg-red-50 border-red-200";
  } else if (overlap < 10) {
    quality = "Warning (Overlap too low, risk of cut-off context)";
    qualityColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (overlap > chunkSize / 2) {
    quality = "Warning (Overlap too high, wasted compute)";
    qualityColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  // Highlight overlap helper
  const renderChunkText = (text: string, overlapText: string) => {
    if (!overlapText || !text.startsWith(overlapText)) {
      return <span>{text}</span>;
    }
    const uniqueText = text.substring(overlapText.length);
    return (
      <>
        <span className="bg-amber-200/50 text-amber-900 border-b-2 border-amber-300" title="Overlap from previous chunk">
          {overlapText}
        </span>
        <span>{uniqueText}</span>
      </>
    );
  };

  return (
    <ToolLayout
      title="RAG Playground"
      description="Visualize your text chunking strategies in real-time. Tune parameters and see estimated retrieval quality."
    >
      <div className="flex flex-col lg:flex-row h-full w-full bg-slate-50 relative overflow-hidden">
        
        {/* Left Pane - Document & Controls */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50 gap-2">
            <Settings2 className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chunking Strategy</h3>
          </div>
          
          <div className="p-6 flex flex-col gap-6 overflow-auto">
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                  <span>Chunk Size</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{chunkSize} tokens</span>
                </label>
                <input 
                  type="range" min="50" max="2000" step="50" 
                  value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                  <span>Overlap</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{overlap} tokens</span>
                </label>
                <input 
                  type="range" min="0" max="500" step="10" 
                  value={overlap} onChange={(e) => setOverlap(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Separator</label>
                <select 
                  value={separatorId} onChange={(e) => setSeparatorId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 font-medium text-slate-700"
                >
                  {SEPARATORS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Embedding Model</label>
                <select 
                  value={modelId} onChange={(e) => setModelId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 font-medium text-slate-700"
                >
                  {EMBEDDING_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {/* Document Input */}
            <div className="flex flex-col gap-2 flex-1 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Document Source
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400 truncate max-w-[150px]" title={fileName}>{fileName}</span>
                  <input type="file" accept=".txt,.md" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <Button variant="outline" size="sm" className="h-7 text-xs font-bold" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3 w-3 mr-2" /> Upload .txt
                  </Button>
                </div>
              </div>
              
              {errorMsg && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{errorMsg}</div>}
              
              <textarea 
                className="w-full flex-1 min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono text-sm leading-relaxed resize-none text-slate-700"
                placeholder="Paste your document text here..."
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  if (fileName !== "Manual Input") setFileName("Manual Input");
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Right Pane - Visualizer & Analytics */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-100 border-l border-slate-200">
          <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-white gap-2 shadow-sm z-10">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Analytics & Preview</h3>
          </div>
          
          <div className="flex-1 overflow-auto flex flex-col">
            {/* Analytics Dashboard */}
            <div className="p-6 pb-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Chunks</span>
                <span className="text-2xl font-black text-slate-800">{chunks.length}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tokens</span>
                <span className="text-2xl font-black text-slate-800">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-1 shadow-sm col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Embedding Cost</span>
                <span className="text-2xl font-black text-slate-800">${estimatedCost.toFixed(6)}</span>
              </div>
              
              <div className={`col-span-2 md:col-span-4 p-3 rounded-lg border flex items-center justify-between shadow-sm ${qualityColor}`}>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-bold">Estimated Retrieval Quality:</span>
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">{quality}</span>
              </div>
            </div>

            {/* Chunk Previews */}
            <div className="p-6 flex flex-col gap-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <div className="h-px bg-slate-300 flex-1"></div>
                Generated Chunks
                <div className="h-px bg-slate-300 flex-1"></div>
              </h4>
              
              {chunks.length === 0 ? (
                <div className="text-center p-12 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-300 rounded-xl">
                  Add some text to see the chunks visualized here.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {chunks.map((chunk, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Chunk {chunk.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                          {Math.ceil(chunk.text.length / 4)} tokens
                        </span>
                      </div>
                      <div className="p-5 text-sm text-slate-700 leading-relaxed font-serif whitespace-pre-wrap">
                        {renderChunkText(chunk.text, chunk.overlapFromPrev)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-auto px-6 pb-6">
               <AdSensePlaceholder />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
