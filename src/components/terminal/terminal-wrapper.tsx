"use client";

import dynamic from "next/dynamic";

export const TerminalWrapper = dynamic(
  () => import("@/components/terminal/void-terminal").then((mod) => mod.VoidTerminal),
  { ssr: false }
);
