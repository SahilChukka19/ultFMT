"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Code2, PenTool, Calculator, BookOpen, Send, Settings, HelpCircle, Sparkles, Code, ChevronDown, ChevronRight, Database, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "./SettingsModal";

const GITHUB_URL = "https://github.com/your-username/your-repo"; // <-- UPDATE THIS LINK

const categories = [
  { name: "All Tools", href: "/", icon: LayoutGrid },
  { 
    name: "MCP Studio", 
    icon: Sparkles,
    subItems: [
      { name: "Visual Builder", href: "/mcp-studio" },
      { name: "MCP Validator", href: "/mcp-config-validator" }
    ]
  },
  { 
    name: "Prompt", 
    icon: PenTool,
    subItems: [
      { name: "Token Estimator", href: "/token-estimator" },
      { name: "Prompt Diff", href: "/prompt-diff" },
      { name: "Context Checker", href: "/context-window-checker" }
    ]
  },
  { 
    name: "ML Studio", 
    icon: Activity,
    subItems: [
      { name: "Dataset Health", href: "/dataset-health" },
      { name: "Feature Intelligence", href: "/feature-intelligence" },
      { name: "Learning Curve Plotter", href: "/learning-curve-plotter" }
    ]
  },
  { name: "RAG Playground", href: "/rag-playground", icon: Database },
  { name: "Cost Analysis", href: "/ai-cost-calculator", icon: Calculator },
  { name: "Documentation", href: "#", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "MCP Studio": true, "ML Studio": true });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-full w-[280px] border-r border-slate-200 bg-slate-50 text-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900">ultFMT</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 px-4">
        <div className="mb-4">
          <h4 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3 px-2">
            CATEGORIES
          </h4>
          <p className="text-sm font-medium text-slate-700 px-2 mb-4">
            Developer Utilities
          </p>
          <nav className="grid gap-1">
            {categories.map((category) => {
              if (category.subItems) {
                const isAnyChildActive = category.subItems.some(sub => pathname === sub.href);
                return (
                  <div key={category.name} className="mb-1">
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [category.name]: !prev[category.name] }))}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors border-l-4",
                        isAnyChildActive ? "border-blue-600 bg-blue-50/50 text-blue-700" : "border-transparent text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </div>
                      {expanded[category.name] ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
                    </button>
                    {expanded[category.name] && (
                      <div className="flex flex-col gap-1 mt-1 ml-4 pl-3 border-l border-slate-200">
                        {category.subItems.map(sub => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={cn(
                                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isSubActive ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === category.href || (category.href !== "/" && pathname.startsWith(category.href as string));
              const isStrictActive = pathname === category.href;
              const activeCondition = category.href === "/" ? isStrictActive : isActive;

              return (
                <Link
                  key={category.name}
                  href={category.href as string}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    activeCondition 
                      ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600 rounded-l-none" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-4 border-transparent"
                  )}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-4 flex flex-col gap-2">
        <a href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full justify-center gap-2 rounded-none border-slate-300 text-slate-700">
            SUBMIT A TOOL
          </Button>
        </a>
        <nav className="mt-4 grid gap-1">
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <HelpCircle className="h-4 w-4" />
            Support
          </a>
        </nav>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
