import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Void International | Infrastructure Layer for MCP",
  description: "The Infrastructure Layer for Model Context Protocol (MCP)",
};

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TerminalWrapper } from "@/components/terminal/terminal-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex h-full bg-void-bg overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 relative h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-void-bg p-6">
            {children}
          </main>
          <TerminalWrapper />
        </div>
      </body>
    </html>
  );
}
