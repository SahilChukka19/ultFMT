import Editor, { EditorProps } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts/SettingsContext";

interface CodeEditorProps extends Omit<EditorProps, "theme"> {
  language?: string;
  value: string;
  onChange?: (value: string | undefined) => void;
}

// Suppress harmless Monaco Editor internal cancellation errors
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    try {
      const argStr = args.map(a => String(a?.message || a?.name || a)).join(' ');
      if (argStr.includes('Canceled') || argStr.includes('Cancel')) {
        return;
      }
    } catch(e) {}
    originalError.apply(console, args);
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.name === 'Canceled' || event.reason.message === 'Canceled' || String(event.reason).includes('Canceled'))) {
      event.preventDefault();
    }
  });
}

export function CodeEditor({ language = "json", value, onChange, ...props }: CodeEditorProps) {
  const { theme } = useTheme();
  const { tabSize, wordWrap, fontSize } = useSettings();

  return (
    <div className="border rounded-md overflow-hidden bg-background h-full w-full flex-1 relative flex flex-col">
      {/* Desktop Monaco Editor */}
      <div className="hidden md:block flex-1 w-full relative">
        <Editor
          height="100%"
          language={language}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            wordWrap: wordWrap ? "on" : "off",
            tabSize: tabSize,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
          }}
          {...props}
        />
      </div>
      
      {/* Mobile Native Textarea Fallback */}
      <div className="md:hidden flex-1 w-full relative">
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={props.options?.readOnly}
          className="absolute inset-0 w-full h-full p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Paste or type your code here..."
        />
      </div>
    </div>
  );
}
