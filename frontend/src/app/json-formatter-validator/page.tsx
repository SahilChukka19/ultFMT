"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CodeEditor } from "@/components/ui/code-editor";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { validateJson } from "@/lib/api";
import { CheckCircle2, AlertCircle, Copy, AlignLeft, ExternalLink, Code, CheckSquare, Lightbulb } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

export default function JsonValidatorPage() {
  const { tabSize } = useSettings();
  const [jsonInput, setJsonInput] = useState(`{
  "project": "ultFMT",
  "version": "1.0.0",
  "components": [
    {
      "id": "nav-01",
      "type": "sidebar",
      "active": true
    }
  ],
  "settings": {
    "theme": "dark",
    "autoSave": true,
    "invalidKey": 
  }
}`);
  
  const [results, setResults] = useState<{
    is_valid: boolean;
    formatted: string | null;
    error: string | null;
    line?: number | null;
    col?: number | null;
    snippet?: string | null;
    solution?: string | null;
    auto_fixed_json?: string | null;
  } | null>(null);

  const handleValidate = async () => {
    try {
      const data = await validateJson(jsonInput);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, tabSize));
      // Optionally run validate to show success immediately
      handleValidate();
    } catch (e) {
      // If the JSON is invalid, run validate so the user sees the exact syntax error
      handleValidate();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
  };

  const actions = (
    <>
      <Button onClick={handleCopy} variant="outline" className="h-9 border-slate-300 text-slate-700 bg-white">
        <Copy className="h-4 w-4 mr-2" /> Copy
      </Button>
      <Button onClick={handleFormat} variant="outline" className="h-9 border-slate-300 text-slate-700 bg-white">
        <AlignLeft className="h-4 w-4 mr-2" /> Format
      </Button>
      <Button onClick={handleValidate} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
        Validate
      </Button>
    </>
  );

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate, format, and debug your JSON structures instantly."
      actions={actions}
    >
      <div className="flex h-full w-full">
        {/* Left Pane - Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               input.json
             </div>
             <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full border border-slate-400"></span>
               UTF-8
             </div>
          </div>
          <div className="flex-1 bg-white">
            <CodeEditor
              language="json"
              value={jsonInput}
              onChange={(val) => setJsonInput(val || "")}
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
            {!results ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">
                Click Validate to analyze the JSON structure.
              </div>
            ) : results.is_valid ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Validation Passed
                </div>
                <p className="text-sm text-green-700 ml-7">The JSON structure is completely valid.</p>
              </div>
            ) : (
              <>
                <div className="bg-red-100 border border-red-200 rounded-md p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold text-base mb-1">
                    <AlertCircle className="h-5 w-5" />
                    Validation Failed
                  </div>
                  <p className="text-sm text-red-600 ml-7">1 error found in the JSON structure.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issues Log</span>
                  
                  <div className="bg-red-50 border border-red-200 rounded-md flex flex-col">
                    <div className="flex justify-between items-center px-3 py-2 border-b border-red-200 bg-red-100/50">
                       <span className="text-xs font-medium text-red-800">
                         {results.line && results.col ? `Line ${results.line}  Col ${results.col}` : 'Global Error'}
                       </span>
                       <span className="text-[10px] font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">Syntax Error</span>
                    </div>
                    <div className="p-3 text-sm text-red-600 font-medium">
                      {results.error}
                    </div>
                    {results.snippet && (
                      <div className="mx-3 mb-3 bg-white border border-red-100 rounded p-3 font-mono text-xs text-slate-600 overflow-x-auto whitespace-pre leading-relaxed">
                        {results.snippet}
                      </div>
                    )}
                    {results.solution && (
                      <div className="mx-3 mb-3 bg-blue-50/50 border border-blue-100 rounded p-3 flex flex-col gap-3">
                        <div className="flex gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Suggested Fix</span>
                            <span className="text-sm text-blue-700">{results.solution}</span>
                          </div>
                        </div>
                        
                        {results.auto_fixed_json && (
                          <div className="ml-6 border-t border-blue-100 pt-3 mt-1 flex flex-col gap-3">
                            <div className="font-mono text-xs text-blue-800 bg-blue-100/50 p-2 rounded whitespace-pre overflow-x-auto max-h-40 border border-blue-200">
                              {results.auto_fixed_json}
                            </div>
                            <Button 
                              onClick={() => {
                                setJsonInput(results.auto_fixed_json!);
                                setResults(null);
                              }}
                              className="self-start h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4"
                            >
                              ✨ Apply Auto-Fix
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Global</span>
                    <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Warning</span>
                  </div>
                  <p className="text-sm text-slate-600">No JSON schema associated. Validation is strictly syntactic.</p>
                </div>
              </>
            )}

            <AdSensePlaceholder />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
