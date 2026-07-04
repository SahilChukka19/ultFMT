"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { CodeEditor } from "@/components/ui/code-editor";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Code, CheckSquare, Lightbulb, Network, Maximize2, Minimize2, Activity, AlertTriangle, XCircle } from "lucide-react";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

function getCapability(command: string, args?: string[]): string {
  if (!command) return "Unknown";
  const fullCmd = [command, ...(args || [])].join(' ').toLowerCase();
  if (fullCmd.includes('filesystem') || fullCmd.includes('fs')) return 'Read/Write Files';
  if (fullCmd.includes('postgres') || fullCmd.includes('sqlite') || fullCmd.includes('mysql')) return 'Query Database';
  if (fullCmd.includes('github') || fullCmd.includes('gitlab')) return 'Repo Access';
  if (fullCmd.includes('slack')) return 'Workspace Chat';
  if (fullCmd.includes('brave') || fullCmd.includes('puppeteer') || fullCmd.includes('google')) return 'Web Search';
  if (fullCmd.includes('memory')) return 'Persistent Memory';
  return `Run ${command}`;
}

type HealthResult = {
  score: number | null;
  checks: {
    active: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    json: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    required: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    github: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    secret: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    root: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    claude: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
    cursor: { pass: boolean; msg: string; type: 'pass' | 'fail' | 'warn' | 'neutral' };
  }
};

function calculateHealth(parsedJson: any): HealthResult {
  let score = 100;
  const checks: HealthResult["checks"] = {
    active: { pass: true, msg: "Active Servers", type: "pass" },
    json: { pass: true, msg: "Valid JSON", type: "pass" },
    required: { pass: true, msg: "Required Fields", type: "pass" },
    github: { pass: true, msg: "GitHub Token Configured", type: "pass" },
    secret: { pass: true, msg: "No Hardcoded Secrets", type: "pass" },
    root: { pass: true, msg: "No Root Directory Access", type: "pass" },
    claude: { pass: true, msg: "Claude Compatible", type: "pass" },
    cursor: { pass: true, msg: "Cursor Compatible", type: "pass" }
  };

  const servers = parsedJson?.mcpServers ? Object.entries(parsedJson.mcpServers) : [];

  if (servers.length === 0) {
    return {
      score: null,
      checks: {
        active: { pass: false, msg: "No Servers Configured", type: "neutral" as const },
        json: { pass: true, msg: "Valid JSON", type: "pass" as const },
        required: { pass: false, msg: "Required Fields", type: "neutral" as const },
        github: { pass: false, msg: "GitHub Token Configured", type: "neutral" as const },
        secret: { pass: false, msg: "No Hardcoded Secrets", type: "neutral" as const },
        root: { pass: false, msg: "No Root Directory Access", type: "neutral" as const },
        claude: { pass: false, msg: "Claude Compatible", type: "neutral" as const },
        cursor: { pass: false, msg: "Cursor Compatible", type: "neutral" as const }
      }
    };
  }

  servers.forEach(([name, config]: [string, any]) => {
    if (!name.trim() || !config.command?.trim()) {
      if (checks.required.pass) {
        checks.required.pass = false;
        checks.required.msg = "Missing Required Fields";
        checks.required.type = "fail";
        score -= 20;
      }
    }

    const args = Array.isArray(config.args) ? config.args : [];
    const env = config.env && typeof config.env === 'object' ? config.env : {};

    args.forEach((arg: string) => {
      if (arg === "/" || arg === "C:\\\\" || arg === "C:/") {
        if (checks.root.pass) {
          checks.root.pass = false;
          checks.root.msg = "Root Directory Access";
          checks.root.type = "warn";
          score -= 10;
        }
      }
      
      if (
        /ghp_[a-zA-Z0-9]{36}/.test(arg) || 
        /sk-[a-zA-Z0-9]{32,}/.test(arg) || 
        /ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(arg) ||
        /token=[A-Za-z0-9_-]+/.test(arg.toLowerCase())
      ) {
        if (checks.secret.pass) {
          checks.secret.pass = false;
          checks.secret.msg = "Hardcoded Secret";
          checks.secret.type = "warn";
          score -= 15;
        }
      }
    });

    const fullCmd = [config.command, ...args].join(" ").toLowerCase();
    if (fullCmd.includes("github") || fullCmd.includes("gitlab")) {
      const hasToken = Object.keys(env).some(k => k.includes("TOKEN"));
      if (!hasToken) {
        if (checks.github.pass) {
          checks.github.pass = false;
          checks.github.msg = "Missing GITHUB_TOKEN";
          checks.github.type = "warn";
          score -= 10;
        }
      }
    }
  });

  return { score: Math.max(0, score), checks };
}

export default function MCPValidatorPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [rootNode, setRootNode] = useState("Claude Desktop");
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<"visualizer" | "health">("visualizer");
  const [results, setResults] = useState<{
    is_valid: boolean;
    errors: { message: string; solution: string }[];
    parsedConfig?: any;
  } | null>(null);

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const errors: { message: string; solution: string }[] = [];
      
      if (!parsed.mcpServers) {
        errors.push({
          message: "Missing required root key: 'mcpServers'",
          solution: "Wrap your server definitions inside an 'mcpServers' object at the root level of your JSON file."
        });
      } else if (typeof parsed.mcpServers !== 'object') {
        errors.push({
          message: "'mcpServers' must be an object mapping server names to configurations.",
          solution: "Ensure 'mcpServers' is a JSON object `{}`, not an array or string."
        });
      } else {
         for (const [serverName, config] of Object.entries(parsed.mcpServers)) {
            const conf = config as any;
            if (!conf.command) errors.push({
              message: `Server '${serverName}' is missing 'command'.`,
              solution: `Add a 'command' field to '${serverName}' (e.g. "command": "node" or "command": "python").`
            });
            if (conf.args && !Array.isArray(conf.args)) errors.push({
              message: `Server '${serverName}' 'args' must be an array.`,
              solution: `Convert the 'args' string in '${serverName}' into an array of strings (e.g. ["run", "script.js"]).`
            });
            if (conf.env && typeof conf.env !== 'object') errors.push({
              message: `Server '${serverName}' 'env' must be an object.`,
              solution: `Ensure the 'env' field in '${serverName}' is a key-value object of strings.`
            });
         }
      }

      setResults({
        is_valid: errors.length === 0,
        errors,
        parsedConfig: parsed
      });
    } catch (e: any) {
      setResults({
        is_valid: false,
        errors: [{
          message: "Invalid JSON format: " + e.message,
          solution: "Check your JSON syntax. Make sure all quotes are closed, and there are no trailing commas."
        }],
        parsedConfig: null
      });
    }
  };

  const actions = (
    <Button onClick={handleValidate} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
      Validate Schema
    </Button>
  );

  return (
    <ToolLayout
      title="MCP Config Validator"
      description="Validate your Model Context Protocol (MCP) configuration files before deploying."
      actions={actions}
    >
      <div className="flex flex-col lg:flex-row flex-1 w-full">
        {/* Left Pane - Editor */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <div className="flex items-center gap-2">
               <Code className="h-3.5 w-3.5" />
               mcp.json
             </div>
             <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full border border-slate-400"></span>
               UTF-8
             </div>
          </div>
          <div className="flex-1 flex flex-col bg-white">
            <CodeEditor
              language="json"
              value={jsonInput}
              onChange={(val) => setJsonInput(val || "")}
            />
          </div>
        </div>
        
        {/* Right Pane - Results */}
        <div className="w-full lg:w-[450px] flex flex-col bg-slate-50 border-l border-slate-200">
          {/* Tabs */}
          <div className="flex items-center px-4 pt-2 border-b border-slate-200 bg-white gap-1">
             <button 
               onClick={() => setActiveTab("visualizer")}
               className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === "visualizer" ? "border-blue-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
             >
               <Network className={`h-3.5 w-3.5 ${activeTab === "visualizer" ? "text-blue-500" : ""}`} />
               Visualizer
             </button>
             <button 
               onClick={() => setActiveTab("health")}
               className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === "health" ? "border-blue-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
             >
               <Activity className={`h-3.5 w-3.5 ${(!results?.is_valid || (results?.is_valid && calculateHealth(results?.parsedConfig || {}).score === null)) ? "text-slate-400" : (results?.is_valid && calculateHealth(results?.parsedConfig || {}).score === 100) ? "text-green-500" : (results?.is_valid && (calculateHealth(results?.parsedConfig || {}).score ?? 0) >= 70) ? "text-amber-500" : "text-red-500"}`} />
               Health Score ({!results?.is_valid || (results?.is_valid && calculateHealth(results?.parsedConfig || {}).score === null) ? "-" : calculateHealth(results?.parsedConfig || {}).score})
             </button>
          </div>
          
          <div className="flex-1 overflow-auto flex flex-col relative">
              {results ? (
                 activeTab === "visualizer" ? (
                  results.is_valid ? (
                    <div className={
                    isMaximized 
                      ? "fixed inset-0 z-[100] bg-slate-50 flex flex-col"
                      : "flex flex-col h-full border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-sm min-h-[400px]"
                  }>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm z-10">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Valid MCP Configuration
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Client:</span>
                          <select 
                            value={rootNode}
                            onChange={(e) => setRootNode(e.target.value)}
                            className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-1 rounded outline-none cursor-pointer font-medium hover:bg-slate-200 transition-colors"
                          >
                            <option value="Claude Desktop">Claude Desktop</option>
                            <option value="Cursor">Cursor</option>
                            <option value="Windsurf">Windsurf</option>
                            <option value="Generic Client">Generic Client</option>
                          </select>
                        </div>
                        <div className="w-px h-5 bg-slate-300"></div>
                        <button 
                          onClick={() => setIsMaximized(!isMaximized)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title={isMaximized ? "Restore view" : "Maximize view"}
                        >
                          {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-8">
                      {/* Using min-w-max and mx-auto ensures it centers when small, but scrolls from the very left edge without cutting off when wide */}
                      <div className="flex flex-col items-center min-w-max mx-auto pb-4 px-4">
                         {/* Root Node */}
                         <div className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-md z-10 text-sm border-2 border-slate-800 flex items-center gap-2">
                           <Network className="h-4 w-4 text-amber-200/80" />
                           {rootNode}
                         </div>
                         
                         {results?.parsedConfig?.mcpServers && Object.keys(results.parsedConfig.mcpServers).length > 0 && (
                           <>
                             {/* Vertical trunk */}
                             <div className="h-8 w-px bg-slate-400"></div>
                             
                             {/* Branches Container */}
                             <div className="flex w-full">
                               {Object.entries(results.parsedConfig.mcpServers).map(([name, config], i, arr) => (
                                 <div key={name} className="flex flex-col items-center relative px-2 sm:px-4 pt-8">
                                   {/* Horizontal connector line */}
                                   <div className="absolute top-0 h-px bg-slate-400"
                                        style={{ 
                                          left: i === 0 ? '50%' : '0', 
                                          right: i === arr.length - 1 ? '50%' : '0',
                                          display: arr.length === 1 ? 'none' : 'block'
                                        }} 
                                   />
                                   
                                   {/* Vertical line up to horizontal connector */}
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-400"></div>
                                   
                                   {/* Server Node */}
                                   <div className="bg-white border-2 border-slate-200 rounded-lg px-5 py-3 shadow-sm z-10 min-w-[120px] flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-default">
                                     <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{name}</span>
                                   </div>
                                   
                                   {/* Vertical line down */}
                                   <div className="h-6 w-px bg-slate-300"></div>
                                   
                                   {/* Capability Pill */}
                                   <div className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap text-center max-w-[150px] truncate">
                                      {getCapability((config as any).command, (config as any).args)}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </>
                         )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 flex flex-col gap-6 h-full">
                    <div className="bg-red-100 border border-red-200 rounded-md p-4">
                      <div className="flex items-center gap-2 text-red-700 font-semibold text-base mb-1">
                        <AlertCircle className="h-5 w-5" />
                        Schema Invalid
                      </div>
                      <p className="text-sm text-red-600 ml-7">{results.errors.length} validation errors found.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issues Log</span>
                      
                      <div className="bg-red-50 border border-red-200 rounded-md flex flex-col gap-2 p-3">
                         {results.errors.map((err, i) => (
                           <div key={i} className="flex flex-col gap-2 bg-white border border-red-100 rounded p-3">
                             <div className="flex gap-2 text-sm text-red-700 font-bold">
                               <span>-</span>
                               <span>{err.message}</span>
                             </div>
                             <div className="ml-4 bg-blue-50/50 border border-blue-100 rounded p-2 flex gap-2">
                               <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0" />
                               <span className="text-xs text-blue-700 font-medium">{err.solution}</span>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                 <div className="h-full flex flex-col bg-slate-50 text-slate-900">
                   {!results.is_valid ? (
                     <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                       Cannot calculate health: Schema is invalid.
                     </div>
                   ) : (
                     <div className="p-8 max-w-lg mx-auto w-full flex flex-col items-center">
                       {/* Circular Score */}
                       <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                           <circle className="text-slate-200 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                           <circle 
                             className={`${calculateHealth(results?.parsedConfig || {}).score === null ? "text-slate-400" : calculateHealth(results?.parsedConfig || {}).score === 100 ? "text-green-500" : (calculateHealth(results?.parsedConfig || {}).score ?? 0) >= 70 ? "text-amber-500" : "text-red-500"} stroke-current transition-all duration-1000 ease-out`} 
                             strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" 
                             strokeDasharray={`${2 * Math.PI * 40}`} 
                             strokeDashoffset={`${calculateHealth(results?.parsedConfig || {}).score === null ? 0 : 2 * Math.PI * 40 * (1 - (calculateHealth(results?.parsedConfig || {}).score ?? 0) / 100)}`}
                           />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-bold text-slate-900">{calculateHealth(results?.parsedConfig || {}).score === null ? "-" : calculateHealth(results?.parsedConfig || {}).score}</span>
                         </div>
                       </div>
                       
                       {/* Checklist */}
                       <div className="w-full flex flex-col gap-3">
                         {Object.values(calculateHealth(results?.parsedConfig || {}).checks).map((check, i) => (
                           <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${check.type === "neutral" ? "bg-slate-100/50 border-slate-200" : check.pass ? "bg-white border-slate-200 shadow-sm" : check.type === "warn" ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-red-50 border-red-200 shadow-sm"}`}>
                             <div className="flex items-center gap-3">
                               {check.type === "neutral" ? (
                                 <CheckCircle2 className="h-4 w-4 text-slate-400" />
                               ) : check.pass ? (
                                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                               ) : check.type === "warn" ? (
                                 <AlertTriangle className="h-4 w-4 text-amber-500" />
                               ) : (
                                 <XCircle className="h-4 w-4 text-red-500" />
                               )}
                               <span className={`text-sm font-medium ${check.type === "neutral" ? "text-slate-500" : check.pass ? "text-slate-700" : check.type === "warn" ? "text-amber-700" : "text-red-700"}`}>{check.msg}</span>
                             </div>
                             <span className="text-[10px] uppercase font-bold text-slate-500">
                               {check.type === "neutral" ? "STANDBY" : check.pass ? "PASS" : check.type === "warn" ? "WARN" : "FAIL"}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               )
              ) : (
                <p className="text-slate-400 text-sm h-full flex items-center justify-center text-center px-8">
                  Paste your MCP configuration JSON and validate it against the official schema.
                </p>
              )}
              
              <AdSensePlaceholder />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
