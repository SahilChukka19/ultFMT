"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { fetchModels, calculateCost } from "@/lib/api";
import { Settings, CheckSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdSensePlaceholder } from "@/components/ui/ad-sense";

export default function CostCalculatorPage() {
  const [models, setModels] = useState<any[]>([]);
  const [modelId, setModelId] = useState("");
  const [inputTokens, setInputTokens] = useState(1500);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(1000);
  
  const [results, setResults] = useState<{
    cost_per_request: number;
    daily_cost: number;
    monthly_cost: number;
    annual_cost: number;
  } | null>(null);

  useEffect(() => {
    fetchModels().then(data => {
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        setModelId(data.models[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleCalculate = async () => {
    try {
      const data = await calculateCost(modelId, inputTokens, outputTokens, requestsPerDay);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const actions = (
    <Button onClick={handleCalculate} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium">
      Calculate Estimate
    </Button>
  );

  return (
    <ToolLayout
      title="API Cost Calculator"
      description="Estimate your monthly usage costs across various AI models based on token throughput and request frequency."
      actions={actions}
    >
      <div className="flex flex-col lg:flex-row flex-1 w-full">
        {/* Left Pane - Config Form */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <Settings className="h-3.5 w-3.5 mr-2" />
             CONFIGURATION
          </div>
          <div className="flex-1 p-8 flex flex-col gap-8 max-w-xl">
             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Model Provider</label>
                <select 
                  className="w-full p-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-800"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Avg. Input Tokens</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-600"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Avg. Output Tokens</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-600"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Requests Per Day</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-600"
                  value={requestsPerDay}
                  onChange={(e) => setRequestsPerDay(parseInt(e.target.value) || 0)}
                />
              </div>
          </div>
        </div>
        
        {/* Right Pane - Results & Ads */}
        <div className="w-[500px] flex flex-col bg-slate-50">
          <div className="flex items-center px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
             <CheckSquare className="h-3.5 w-3.5 mr-2" />
             ANALYSIS RESULTS
          </div>
          
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-8">
                {results ? (
                  <div className="flex flex-col gap-8">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                      <div className="flex flex-col gap-2 pb-6 border-b border-slate-100 mb-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Monthly Cost</span>
                        <span className="text-6xl font-bold tracking-tight text-blue-600">${results.monthly_cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Cost</span>
                            <span className="text-xl font-bold text-slate-800">${results.daily_cost.toFixed(2)}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost Per Request</span>
                            <span className="text-xl font-bold text-slate-800">${results.cost_per_request.toFixed(6)}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yearly Projection</span>
                            <span className="text-xl font-bold text-slate-800">${results.annual_cost.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Tokens / Day</span>
                            <span className="text-xl font-bold text-slate-800">{((inputTokens + outputTokens) * requestsPerDay).toLocaleString()}</span>
                         </div>
                      </div>
                    </div>

                    <AdSensePlaceholder />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                    Configure your parameters and click calculate.
                  </div>
                )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
