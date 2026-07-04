import Link from "next/link";
import { Sparkles, Activity, PenTool, Database, Calculator } from "lucide-react";

export const metadata = {
  title: "Documentation | ultFMT",
  description: "Documentation and guides for ultFMT tools.",
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Documentation</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Welcome to ultFMT. This is a collection of fast, privacy-first developer utilities tailored specifically for AI engineers and researchers.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 space-y-12">
        
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Core Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-2">Zero Data Retention</h3>
              <p className="text-sm">
                We don't save your data. Ever. Files uploaded for analysis are processed entirely in-memory and immediately garbage-collected once the response is sent. There is no database storing your inputs.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-2">No Accounts Required</h3>
              <p className="text-sm">
                ultFMT is designed for immediate use. You do not need to create an account, log in, or provide an API key. Just open the tool and get to work.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tool Categories</h2>
          
          <div className="space-y-6">
            
            {/* ML Studio */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 m-0">ML Studio</h3>
              </div>
              <p className="mb-4">Tools for exploring, debugging, and visualizing machine learning datasets and training runs.</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                <li><strong>Dataset Health:</strong> Instantly check CSV datasets for missing values, class imbalances, and duplicate rows before training.</li>
                <li><strong>Feature Intelligence:</strong> Calculate correlation matrices, mutual information, and PCA components to identify the strongest predictors in your dataset.</li>
                <li><strong>Learning Curve Plotter:</strong> A client-side charting tool to visualize training vs. validation loss/accuracy from CSV logs to spot overfitting.</li>
              </ul>
            </div>

            {/* Prompt Tools */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                  <PenTool className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 m-0">Prompt Tools</h3>
              </div>
              <p className="mb-4">Utilities to debug and optimize complex LLM prompts.</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                <li><strong>Token Estimator:</strong> Estimate token counts across different tokenizers (OpenAI cl100k_base, Anthropic, etc.) without making API calls.</li>
                <li><strong>Prompt Diff:</strong> Visual side-by-side diff tool to track exactly what changed between two prompt versions.</li>
                <li><strong>Context Checker:</strong> Verify if your prompt + document payload fits within specific model context windows.</li>
              </ul>
            </div>

            {/* MCP Studio */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 m-0">MCP Studio</h3>
              </div>
              <p className="mb-4">Tools for building and configuring Model Context Protocol (MCP) agents.</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                <li><strong>Visual Builder:</strong> Drag-and-drop interface to build complex multi-agent MCP configurations.</li>
                <li><strong>MCP Validator:</strong> Static analysis tool to ensure your MCP JSON configurations are valid, have correct env vars, and don't contain conflicting scopes.</li>
              </ul>
            </div>

          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Open Source</h2>
          <p className="leading-relaxed">
            ultFMT is open source. You can view the code, run it locally, or contribute new tools on our GitHub repository.
          </p>
          <a href="https://github.com/SahilChukka19/ultFMT" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 mt-2">
            View on GitHub
          </a>
        </section>

      </div>
    </div>
  );
}
