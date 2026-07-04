import React from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ToolLayout({ title, description, children, actions }: ToolLayoutProps) {
  return (
    <div className="flex flex-col min-h-full lg:h-full bg-background text-foreground overflow-visible lg:overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 lg:px-8 py-4 lg:py-6 pb-4 border-b border-border bg-card flex-shrink-0 gap-4 lg:gap-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 font-medium">{description}</p>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-visible lg:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
