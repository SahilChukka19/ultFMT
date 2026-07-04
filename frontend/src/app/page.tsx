import Link from "next/link";
import { ArrowRight, Gauge, Calculator, GitCompare, Text, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const featuredTools = [
  {
    title: "Token Estimator",
    description: "Accurately count tokens across multiple models and encoding schemes before sending requests.",
    href: "/token-estimator",
    icon: Gauge,
  },
  {
    title: "Cost Calculator",
    description: "Project API costs based on anticipated token volume and model pricing tiers.",
    href: "/ai-cost-calculator",
    icon: Calculator,
  },
  {
    title: "Context Checker",
    description: "Validate if your prompt and data fit within the specific context window of target models.",
    href: "/context-window-checker",
    icon: Text,
  },
  {
    title: "Prompt Diff",
    description: "Visually compare prompt iterations to track changes and optimize instruction phrasing.",
    href: "/prompt-diff",
    icon: GitCompare,
  },
  {
    title: "MCP Validator",
    description: "Validate your Model Context Protocol implementations against standard schema requirements.",
    href: "/mcp-config-validator",
    icon: Settings,
  },
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-8 py-16">
        <div className="mb-16 max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-800 uppercase mb-6">
            NEW: MCP VALIDATOR TOOL RELEASED
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Developer Utilities for the AI Era
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Modern, fast, and privacy-friendly tools for AI engineers. Streamline your workflow with utilities designed for deep-focus development.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#tools"
              className="inline-flex h-12 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90"
            >
              EXPLORE TOOLS
            </Link>
          </div>
        </div>

        <section id="tools" className="mb-20 pt-8 scroll-mt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Tools</h2>
              <p className="text-slate-500 mt-1">Essential utilities for your daily AI engineering tasks.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <div key={tool.title} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mb-6">
                  <tool.icon className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{tool.title}</h3>
                <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">
                  {tool.description}
                </p>
                <Link href={tool.href} className="inline-flex items-center text-xs font-bold tracking-widest text-slate-900 uppercase group-hover:text-blue-600 transition-colors">
                  LAUNCH TOOL <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-500 uppercase">
                ADS
              </div>
              <p className="text-sm font-medium text-slate-700">
                Support the toolkit: <span className="font-bold text-slate-900">CloudCompute Pro</span> — High-performance GPU clusters for LLM fine-tuning.
              </p>
            </div>
            <Link href="#" className="text-xs font-bold tracking-widest text-slate-900 uppercase hover:text-blue-600 transition-colors flex items-center">
              LEARN MORE <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 text-center text-sm text-slate-500">
        <div className="max-w-[1200px] mx-auto px-8 flex justify-between items-center">
          <p>© 2024 ultFMT. Engineered for performance.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-900">PRIVACY POLICY</Link>
            <Link href="/terms-of-service" className="hover:text-slate-900">TERMS OF SERVICE</Link>
            <a href="https://github.com/SahilChukka19/ultFMT" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">GITHUB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
