"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CodeEditor } from "@/components/ui/code-editor";
import { Button } from "@/components/ui/button";
import { estimateTokens } from "@/lib/api";
import { Code, CheckSquare } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

export default function TokenEstimatorPage() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<{
    char_count: number;
    word_count: number;
    line_count: number;
    token_count: number;
    reading_time_sec: number;
  } | null>(null);

  const handleEstimate = async () => {
    try {
      const data = await estimateTokens(text);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const actions = (
    <Button onClick={handleEstimate} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
      Estimate Tokens
    </Button>
  );

  return (
    <ToolLayout
      title="Token Estimator"
      description="Quickly estimate OpenAI token counts, word counts, and reading times for any block of text."
      actions={actions}
    >
      <div className="flex h-full w-full">
        {/* Left Pane - Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               input.txt
             </div>
             <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full border border-slate-400"></span>
               UTF-8
             </div>
          </div>
          <div className="flex-1 bg-white">
            <CodeEditor
              language="text"
              value={text}
              onChange={(val) => setText(val || "")}
            />
          </div>
        </div>
        
        {/* Right Pane - Results */}
        <div className="w-[350px] flex flex-col bg-slate-50">
          <div className="flex items-center px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <CheckSquare className="h-3.5 w-3.5 mr-2" />
             ANALYSIS RESULTS
          </div>
          
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
            {!results ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">
                Click Estimate to analyze text.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Tokens</span>
                    <span className="text-5xl font-bold tracking-tight text-blue-600">~{results.token_count.toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Words</span>
                        <span className="text-2xl font-bold text-slate-800">{results.word_count.toLocaleString()}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Characters</span>
                        <span className="text-2xl font-bold text-slate-800">{results.char_count.toLocaleString()}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lines</span>
                        <span className="text-2xl font-bold text-slate-800">{results.line_count.toLocaleString()}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reading Time</span>
                        <span className="text-2xl font-bold text-slate-800">
                          {results.reading_time_sec < 60 
                            ? `${results.reading_time_sec}s` 
                            : `${Math.floor(results.reading_time_sec / 60)}m ${results.reading_time_sec % 60}s`}
                        </span>
                     </div>
                  </div>
              </div>
            )}
            
            <AdSensePlaceholder />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
