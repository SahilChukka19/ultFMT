"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

type UI_Density = "comfortable" | "compact";

interface SettingsState {
  uiDensity: UI_Density;
  tabSize: number;
  wordWrap: boolean;
  fontSize: number;
}

interface SettingsContextType extends SettingsState {
  setUIDensity: (density: UI_Density) => void;
  setTabSize: (size: number) => void;
  setWordWrap: (wrap: boolean) => void;
  setFontSize: (size: number) => void;
}

const defaultSettings: SettingsState = {
  uiDensity: "comfortable",
  tabSize: 2,
  wordWrap: true,
  fontSize: 14,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("ultfmt_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ultfmt_settings", JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const value: SettingsContextType = {
    ...settings,
    setUIDensity: (val) => updateSetting("uiDensity", val),
    setTabSize: (val) => updateSetting("tabSize", val),
    setWordWrap: (val) => updateSetting("wordWrap", val),
    setFontSize: (val) => updateSetting("fontSize", val),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
