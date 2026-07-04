import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsProvider } from "@/contexts/SettingsContext";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ultFMT",
  description: "Developer Utilities for the AI Era",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} min-h-full flex flex-col font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <SettingsProvider>
            <AppLayout>{children}</AppLayout>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
