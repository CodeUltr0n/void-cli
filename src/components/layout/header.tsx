"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Book, ExternalLink, Command, ShieldCheck, ChevronRight } from "lucide-react"

export function Header() {
  const pathname = usePathname() || "/"

  // Generate dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return (
        <Link href="/" className="font-semibold text-white tracking-wide hover:text-void-gold transition-colors">
          Overview
        </Link>
      )
    }

    if (pathname === "/servers") {
      return (
        <Link href="/servers" className="font-semibold text-white tracking-wide hover:text-void-gold transition-colors">
          MCP Servers
        </Link>
      )
    }

    if (pathname === "/servers/new") {
      return (
        <div className="flex items-center gap-2">
          <Link href="/servers" className="text-void-muted hover:text-white transition-colors">
            MCP Servers
          </Link>
          <ChevronRight className="h-3 w-3 text-void-muted/50" />
          <span className="font-semibold text-white tracking-wide">Add New</span>
        </div>
      )
    }

    if (pathname.startsWith("/servers/")) {
      return (
        <div className="flex items-center gap-2">
          <Link href="/servers" className="text-void-muted hover:text-white transition-colors">
            MCP Servers
          </Link>
          <ChevronRight className="h-3 w-3 text-void-muted/50" />
          <span className="font-semibold text-white tracking-wide">Server Inspection</span>
        </div>
      )
    }

    if (pathname === "/routing") {
      return (
        <Link href="/routing" className="font-semibold text-white tracking-wide hover:text-void-gold transition-colors">
          Routing Engine
        </Link>
      )
    }

    if (pathname === "/agent") {
      return (
        <Link href="/agent" className="font-semibold text-white tracking-wide hover:text-void-gold transition-colors">
          Agent Playground
        </Link>
      )
    }

    if (pathname === "/traces") {
      return (
        <Link href="/traces" className="font-semibold text-white tracking-wide hover:text-void-gold transition-colors">
          Request Traces
        </Link>
      )
    }

    if (pathname === "/architecture") {
      return (
        <Link href="/architecture" className="font-semibold text-white tracking-wide hover:text-void-gold transition-colors">
          System Architecture
        </Link>
      )
    }

    return <span className="font-semibold text-white tracking-wide">Dashboard</span>
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#050508]/80 backdrop-blur-md px-6 z-20">
      {/* Clickable Interactive Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link 
          href="/" 
          className="text-void-muted font-medium hover:text-void-gold transition-colors flex items-center gap-1.5"
        >
          Void Cloud
        </Link>
        <ChevronRight className="h-3 w-3 text-void-muted/50" />
        {getBreadcrumbs()}
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs">
          <div className="h-1.5 w-1.5 rounded-full bg-void-success animate-pulse"></div>
          <span className="text-void-muted text-[11px] font-mono">Routing Active</span>
          <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-1.5 py-0.2 rounded uppercase">Mesh 100%</span>
        </div>

        {/* Command shortcut */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-terminal'))}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-void-muted hover:text-void-body hover:border-void-gold/30 text-xs font-mono transition-colors"
        >
          <Command className="h-3 w-3" />
          <span>CLI</span>
          <kbd className="text-[10px] bg-white/[0.06] px-1 py-0.2 rounded border border-white/[0.1]">`</kbd>
        </button>

        <div className="h-4 w-px bg-white/[0.08]"></div>

        <a 
          href="/architecture" 
          className="flex items-center gap-1.5 text-xs font-medium text-void-muted hover:text-void-body transition-colors"
        >
          <Book className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </a>
        
        <button className="text-void-muted hover:text-void-body transition-colors relative p-1.5 rounded-md hover:bg-white/[0.04]">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#050508] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
        </button>
        
        {/* User Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-void-gold/10 border border-void-gold/30 text-[11px] font-semibold text-void-gold shadow-[0_0_8px_rgba(201,168,76,0.15)]">
          KC
        </div>
      </div>
    </header>
  )
}
