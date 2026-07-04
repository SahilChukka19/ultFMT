import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsProvider } from "@/contexts/SettingsContext";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ultFMT",
  description: "Developer Utilities for the AI Era",
  verification: {
    google: "PD3X0EY5HnodzAEHD-q7US3e2yBnC8JG1y2ig3cBWFc",
  },
  other: {
    "google-adsense-account": "ca-pub-5146600005266494",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5146600005266494"
          crossOrigin="anonymous"
        ></script>
      </head>
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
