import Editor, { EditorProps } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts/SettingsContext";

interface CodeEditorProps extends Omit<EditorProps, "theme"> {
  language?: string;
  value: string;
  onChange?: (value: string | undefined) => void;
}

export function CodeEditor({ language = "json", value, onChange, ...props }: CodeEditorProps) {
  const { theme } = useTheme();
  const { tabSize, wordWrap, fontSize } = useSettings();

  return (
    <div className="border rounded-md overflow-hidden bg-background h-full flex-1">
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
  );
}
