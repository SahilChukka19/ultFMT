"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Network, Plus, Trash2, ShieldAlert, Download, Copy, CheckCircle2 } from "lucide-react";

type MCPServerState = {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
};

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



export default function MCPStudioPage() {
  const [rootNode, setRootNode] = useState("Claude Desktop");
  const [servers, setServers] = useState<MCPServerState[]>([
    {
      id: "1",
      name: "filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"],
      env: {}
    }
  ]);

  const handleAddServer = () => {
    const newId = Date.now().toString();
    const newName = `server-${servers.length + 1}`;
    setServers([...servers, { id: newId, name: newName, command: "npx", args: [], env: {} }]);
  };

  const handleUpdateServer = (id: string, updates: Partial<MCPServerState>) => {
    setServers(servers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteServer = (id: string) => {
    setServers(servers.filter(s => s.id !== id));
  };

  const generateJSON = () => {
    const mcpServers: Record<string, any> = {};
    servers.forEach(s => {
      mcpServers[s.name] = { command: s.command, args: s.args, env: s.env };
    });
    return JSON.stringify({ mcpServers }, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateJSON());
  };

  const handleExport = () => {
    const blob = new Blob([generateJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcp.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <ToolLayout
      title="MCP Visual Builder"
      description="Visually build, validate, and export Model Context Protocol (MCP) configurations without writing JSON."
      actions={
        <div className="flex gap-2">
           <Button onClick={handleCopy} variant="outline" className="h-9 border-slate-300 bg-white text-slate-700">
             <Copy className="h-4 w-4 mr-2" /> Copy JSON
           </Button>
           <Button onClick={handleExport} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
             <Download className="h-4 w-4 mr-2" /> Export mcp.json
           </Button>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row flex-1 w-full">
        {/* Left Pane - Builder */}
        <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 lg:overflow-auto">
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Server Registry</h3>
                <Button onClick={handleAddServer} size="sm" className="bg-slate-800 hover:bg-slate-900 text-white text-xs h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Server
                </Button>
              </div>

              <div className="flex flex-col gap-6">
                {servers.map((server) => (
                  <div key={server.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative group">
                     <button 
                       onClick={() => handleDeleteServer(server.id)}
                       className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                     
                     <div className="flex flex-col gap-4">
                       <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">Server Name</label>
                         <input 
                           type="text" 
                           value={server.name} 
                           onChange={(e) => handleUpdateServer(server.id, { name: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                         />
                       </div>
                       
                       <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">Command</label>
                         <input 
                           type="text" 
                           value={server.command} 
                           onChange={(e) => handleUpdateServer(server.id, { command: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                           placeholder="e.g. npx, python, docker"
                         />
                       </div>

                       <div>
                         <div className="flex items-center justify-between mb-1">
                           <label className="block text-xs font-semibold text-slate-500">Arguments</label>
                           <button 
                             onClick={() => handleUpdateServer(server.id, { args: [...server.args, ""] })}
                             className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                           >
                             + Add Arg
                           </button>
                         </div>
                         {server.args.length === 0 && <span className="text-xs text-slate-400 italic">No arguments defined.</span>}
                         <div className="flex flex-col gap-2">
                           {server.args.map((arg, i) => (
                             <div key={i} className="flex gap-2">
                               <input 
                                 type="text" 
                                 value={arg}
                                 onChange={(e) => {
                                   const newArgs = [...server.args];
                                   newArgs[i] = e.target.value;
                                   handleUpdateServer(server.id, { args: newArgs });
                                 }}
                                 className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                 placeholder="--flag or value"
                               />
                               <button 
                                 onClick={() => {
                                   const newArgs = server.args.filter((_, index) => index !== i);
                                   handleUpdateServer(server.id, { args: newArgs });
                                 }}
                                 className="text-slate-400 hover:text-red-500"
                               >
                                 <Trash2 className="h-3.5 w-3.5" />
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       {/* Env Variables Section */}
                       <div>
                         <div className="flex items-center justify-between mb-1">
                           <label className="block text-xs font-semibold text-slate-500">Environment Variables</label>
                           <button 
                             onClick={() => {
                               const newKey = `KEY_${Object.keys(server.env).length + 1}`;
                               const newEnv = { ...server.env, [newKey]: `\${${newKey}}` };
                               handleUpdateServer(server.id, { env: newEnv });
                             }}
                             className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                           >
                             + Add Env
                           </button>
                         </div>
                         {Object.keys(server.env).length === 0 && <span className="text-xs text-slate-400 italic">No environment variables.</span>}
                         <div className="flex flex-col gap-2">
                           {Object.entries(server.env).map(([key, val], i) => (
                             <div key={i} className="flex gap-2">
                               <input 
                                 type="text" 
                                 value={key}
                                 onChange={(e) => {
                                   const newEnv = { ...server.env };
                                   const newKey = e.target.value;
                                   delete newEnv[key];
                                   newEnv[newKey] = `\${${newKey}}`;
                                   handleUpdateServer(server.id, { env: newEnv });
                                 }}
                                 className="w-1/3 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                 placeholder="KEY"
                               />
                               <input 
                                 type="text" 
                                 value={`\${${key}}`}
                                 readOnly
                                 className="flex-1 bg-slate-100 border border-slate-200 text-slate-500 rounded px-3 py-1.5 text-xs font-mono cursor-not-allowed"
                                 title="Values are automatically mapped to host variables for security."
                               />
                               <button 
                                 onClick={() => {
                                   const newEnv = { ...server.env };
                                   delete newEnv[key];
                                   handleUpdateServer(server.id, { env: newEnv });
                                 }}
                                 className="text-slate-400 hover:text-red-500"
                               >
                                 <Trash2 className="h-3.5 w-3.5" />
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                  </div>
                ))}

                {servers.length === 0 && (
                  <div className="text-center p-8 bg-slate-100 rounded-lg border border-dashed border-slate-300">
                    <Network className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">No servers configured.</p>
                    <p className="text-xs text-slate-400">Click "Add Server" to begin building your MCP network.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
        
        {/* Right Pane - Visualizer & JSON Output */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
           {/* Top Half: Visualizer */}
           <div className="min-h-[400px] lg:min-h-0 lg:h-[60%] border-b border-slate-200 flex flex-col bg-slate-50 relative min-h-0">
             <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client:</span>
                <select 
                  value={rootNode}
                  onChange={(e) => setRootNode(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Claude Desktop">Claude Desktop</option>
                  <option value="Cursor">Cursor</option>
                  <option value="Windsurf">Windsurf</option>
                  <option value="Generic Client">Generic Client</option>
                </select>
             </div>

             <div className="flex-1 overflow-auto p-8">
               <div className="flex flex-col items-center min-w-max mx-auto pb-8 pt-4 px-4">
                  {/* Root Node */}
                  <div className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-md z-10 text-sm border-2 border-slate-800 flex items-center gap-2">
                    <Network className="h-4 w-4 text-amber-200/80" />
                    {rootNode}
                  </div>
                  
                  {servers.length > 0 && (
                    <>
                      {/* Vertical trunk */}
                      <div className="h-8 w-px bg-slate-400"></div>
                      
                      {/* Branches Container */}
                      <div className="flex justify-center w-full">
                        {servers.map((server, i, arr) => (
                          <div key={server.id} className="flex flex-col items-center relative px-2 sm:px-4 pt-8">
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
                              <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{server.name}</span>
                            </div>
                            
                            {/* Vertical line down */}
                            <div className="h-6 w-px bg-slate-300"></div>
                            
                            {/* Capability Pill */}
                            <div className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap text-center max-w-[150px] truncate">
                               {getCapability(server.command, server.args)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
               </div>
               
             </div>
           </div>
           
           {/* Bottom Half */}
           <div className="min-h-[300px] lg:min-h-0 flex-1 flex flex-col bg-[#1e1e1e] text-slate-300 relative">
             <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-[#252526]">
               <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-slate-400">
                 <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                 Live JSON Output
               </div>
             </div>
             <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed">
               <pre className="whitespace-pre">
                 {generateJSON()}
               </pre>
             </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
