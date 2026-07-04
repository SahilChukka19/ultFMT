"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Search, Command, LayoutGrid, FileText, Code2, PenTool, Calculator, BookOpen, Send, Settings, Sparkles, Database, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";

const searchItems = [
  { name: "Visual Builder", href: "/mcp-studio", icon: Sparkles, category: "MCP Studio" },
  { name: "MCP Validator", href: "/mcp-config-validator", icon: Settings, category: "MCP Studio" },
  { name: "Token Estimator", href: "/token-estimator", icon: PenTool, category: "Prompt Tools" },
  { name: "Prompt Diff", href: "/prompt-diff", icon: PenTool, category: "Prompt Tools" },
  { name: "Context Checker", href: "/context-window-checker", icon: PenTool, category: "Prompt Tools" },
  { name: "Dataset Health", href: "/dataset-health", icon: Activity, category: "ML Studio" },
  { name: "Feature Intelligence", href: "/feature-intelligence", icon: Activity, category: "ML Studio" },
  { name: "Learning Curve Plotter", href: "/learning-curve-plotter", icon: Activity, category: "ML Studio" },
  { name: "RAG Playground", href: "/rag-playground", icon: Database, category: "Data Tools" },
  { name: "Cost Analysis", href: "/ai-cost-calculator", icon: Calculator, category: "Developer Utilities" },
];

export function TopNav() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close mobile sheet on route change
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = query === "" 
    ? searchItems 
    : searchItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <header className="h-16 border-b bg-slate-50 px-4 md:px-8 flex items-center justify-between relative z-40">
      <div className="flex items-center gap-4 md:gap-12 flex-1">
        
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-slate-100 hover:text-slate-900 h-9 w-9 -ml-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-slate-50">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative group max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-600" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md leading-5 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-1 focus:ring-slate-300 sm:text-sm transition-colors"
            placeholder="Search tools, docs..."
          />

          {/* Search Dropdown */}
          {isOpen && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {filteredItems.length > 0 ? (
                <ul className="py-2">
                  {filteredItems.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                          router.push(item.href);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div className="bg-indigo-50 p-2 rounded-md">
                          <item.icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.category}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-sm text-slate-500 text-center flex flex-col items-center">
                  <Search className="w-6 h-6 text-slate-300 mb-2" />
                  No tools found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link href="/" className={`transition-colors hover:text-slate-900 pb-5 pt-5 ${pathname === "/" ? "border-b-2 border-slate-900 text-slate-900" : ""}`}>Tools</Link>
          <Link href="/docs" className={`transition-colors hover:text-slate-900 pb-5 pt-5 ${pathname === "/docs" ? "border-b-2 border-slate-900 text-slate-900" : ""}`}>Docs</Link>
          <a href="https://tools.ultfmt.com/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900 flex items-center gap-1.5 pb-5 pt-5">
            More Tools <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
