"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CodeEditor } from "@/components/ui/code-editor";
import { Button } from "@/components/ui/button";
import { extractVariables } from "@/lib/api";
import { Code, CheckSquare } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

export default function VariableExtractorPage() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<{
    variables: string[];
    count: number;
  } | null>(null);

  const handleExtract = async () => {
    try {
      const data = await extractVariables(prompt);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const actions = (
    <Button onClick={handleExtract} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
      Extract Variables
    </Button>
  );

  return (
    <ToolLayout
      title="Prompt Variable Extractor"
      description="Automatically detect and extract dynamic variables from your prompt templates."
      actions={actions}
    >
      <div className="flex flex-col lg:flex-row flex-1 w-full">
        {/* Left Pane - Editor */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               template.txt
             </div>
             <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full border border-slate-400"></span>
               UTF-8
             </div>
          </div>
          <div className="flex-1 flex flex-col bg-white">
            <CodeEditor
              language="text"
              value={prompt}
              onChange={(val) => setPrompt(val || "")}
            />
          </div>
        </div>
        
        {/* Right Pane - Results */}
        <div className="w-full lg:w-[350px] flex flex-col bg-slate-50">
          <div className="flex items-center px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <CheckSquare className="h-3.5 w-3.5 mr-2" />
             ANALYSIS RESULTS
          </div>
          
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
              {results ? (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Found</span>
                    <span className="text-4xl font-bold text-blue-600">{results.count}</span>
                  </div>
                  
                  {results.count > 0 ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Detected Variables</span>
                      <div className="flex flex-wrap gap-2">
                        {results.variables.map((v, i) => (
                          <div key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-sm font-mono font-medium text-slate-800">
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No variables detected in this prompt.</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm h-full flex items-center justify-center text-center">
                  Enter a prompt and click Extract.
                </p>
              )}
              
              <AdSensePlaceholder />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
