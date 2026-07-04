"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CodeEditor } from "@/components/ui/code-editor";
import { Button } from "@/components/ui/button";
import { promptDiff } from "@/lib/api";
import { Code, CheckSquare, Layers } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

export default function PromptDiffPage() {
  const [promptA, setPromptA] = useState("");
  const [promptB, setPromptB] = useState("");
  const [results, setResults] = useState<{
    added_lines: number;
    removed_lines: number;
    diff_html: string;
    unified_diff: string;
  } | null>(null);

  const handleCompare = async () => {
    try {
      const data = await promptDiff(promptA, promptB);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const actions = (
    <Button onClick={handleCompare} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
      Compare Prompts
    </Button>
  );

  return (
    <ToolLayout
      title="Prompt Diff Tool"
      description="Visually compare prompt iterations to track changes and optimize instruction phrasing."
      actions={actions}
    >
      <div className="flex h-full w-full">
        {/* Left Pane - Editor A */}
        <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               Prompt A (Original)
             </div>
          </div>
          <div className="flex-1 bg-white">
            <CodeEditor
              language="text"
              value={promptA}
              onChange={(val) => setPromptA(val || "")}
            />
          </div>
        </div>

        {/* Center Pane - Editor B */}
        <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               Prompt B (Modified)
             </div>
          </div>
          <div className="flex-1 bg-white">
            <CodeEditor
              language="text"
              value={promptB}
              onChange={(val) => setPromptB(val || "")}
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
                Click Compare to see the differences.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Added</span>
                      <span className="text-2xl font-bold text-green-600">+{results.added_lines}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Removed</span>
                      <span className="text-2xl font-bold text-red-600">-{results.removed_lines}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diff Output</span>
                     <div className="bg-white border border-slate-200 rounded-md p-4 font-mono text-xs overflow-auto max-h-[500px]">
                       <div dangerouslySetInnerHTML={{ __html: results.diff_html }} />
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
