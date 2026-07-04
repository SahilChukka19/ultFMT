"use client";

import React, { useEffect, useState } from "react";
import { X, Moon, Sun, Monitor, AlignLeft, Type, Maximize } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { uiDensity, setUIDensity, tabSize, setTabSize, wordWrap, setWordWrap, fontSize, setFontSize } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Preferences</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-200/50 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          
          {/* Theme & Appearance */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Appearance</h3>
            <div className="grid gap-4">
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="font-medium text-slate-800">Theme</div>
                  <div className="text-sm text-slate-500 mt-1">Select your preferred color scheme</div>
                </div>
                {mounted && (
                  <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    <button 
                      onClick={() => setTheme("light")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button 
                      onClick={() => setTheme("dark")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button 
                      onClick={() => setTheme("system")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'system' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Monitor className="w-4 h-4" /> System
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="font-medium text-slate-800">UI Density</div>
                  <div className="text-sm text-slate-500 mt-1">Adjust the spacing of tables and lists</div>
                </div>
                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setUIDensity("comfortable")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${uiDensity === 'comfortable' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Comfortable
                  </button>
                  <button 
                    onClick={() => setUIDensity("compact")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${uiDensity === 'compact' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Compact
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Editor Preferences */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Editor Preferences</h3>
            <div className="grid gap-4">
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg h-fit text-indigo-600">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Tab Size</div>
                    <div className="text-sm text-slate-500 mt-1">Number of spaces per indentation level</div>
                  </div>
                </div>
                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                  {[2, 4].map(size => (
                    <button 
                      key={size}
                      onClick={() => setTabSize(size)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tabSize === size ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg h-fit text-indigo-600">
                    <AlignLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Word Wrap</div>
                    <div className="text-sm text-slate-500 mt-1">Wrap long lines of code in the editor</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={wordWrap} onChange={(e) => setWordWrap(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg h-fit text-indigo-600">
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Font Size</div>
                    <div className="text-sm text-slate-500 mt-1">Size of the text in the code editors</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="10" 
                    max="24" 
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-24 accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-slate-700 w-6">{fontSize}px</span>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
