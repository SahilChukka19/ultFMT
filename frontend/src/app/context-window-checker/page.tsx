"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CodeEditor } from "@/components/ui/code-editor";
import { Button } from "@/components/ui/button";
import { checkContext } from "@/lib/api";
import { Code, CheckSquare } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

export default function ContextWindowCheckerPage() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<{
    results: any[];
  } | null>(null);

  const handleCheck = async () => {
    try {
      const data = await checkContext(text);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const actions = (
    <Button onClick={handleCheck} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
      Check Context Limits
    </Button>
  );

  return (
    <ToolLayout
      title="Context Window Checker"
      description="Validate if your prompt and data fit within the specific context window of target models."
      actions={actions}
    >
      <div className="flex h-full w-full">
        {/* Left Pane - Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               payload.txt
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
        <div className="w-[450px] flex flex-col bg-slate-50">
          <div className="flex items-center px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <CheckSquare className="h-3.5 w-3.5 mr-2" />
             ANALYSIS RESULTS
          </div>
          
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
              {results ? (
                <div className="flex flex-col gap-4">
                  {results.results.map((res: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-slate-900">{res.model_name}</span>
                         {res.is_supported ? (
                           <span className="px-2 py-0.5 bg-green-100 border border-green-200 text-green-800 text-[10px] font-bold uppercase rounded">Supported</span>
                         ) : (
                           <span className="px-2 py-0.5 bg-red-100 border border-red-200 text-red-800 text-[10px] font-bold uppercase rounded">Exceeded</span>
                         )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                              className={`h-full ${res.percentage_used > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
                              style={{ width: `${Math.min(res.percentage_used, 100)}%` }}
                           ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-12 text-right">{res.percentage_used}%</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                         <span>{res.tokens_used.toLocaleString()} tokens used</span>
                         <span>{res.context_window.toLocaleString()} max</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                  Paste your entire prompt payload and check against models.
                </div>
              )}
              
              <AdSensePlaceholder />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
