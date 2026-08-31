"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Server, GitBranch, Bot, Activity, Boxes, Terminal, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Servers", href: "/servers", icon: Server },
  { name: "Routing", href: "/routing", icon: GitBranch },
  { name: "Agent", href: "/agent", icon: Bot },
  { name: "Traces", href: "/traces", icon: Activity },
  { name: "Architecture", href: "/architecture", icon: Boxes },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "flex flex-col border-r border-white/[0.08] bg-[#050508]/90 backdrop-blur-xl transition-all duration-300 z-30 select-none",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-3.5 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="relative h-8 w-8 shrink-0 flex items-center justify-center">
            {/* Glow backdrop for black hole logo */}
            <div className="absolute inset-0 bg-void-gold/20 rounded-full blur-md group-hover:bg-void-gold/40 transition-all duration-300"></div>
            <Image 
              src="/void-logo.png" 
              alt="Void Logo" 
              width={32} 
              height={32} 
              priority
              loading="eager"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              className="relative z-10 object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.5)] transition-transform duration-300 group-hover:scale-110" 
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-display font-bold text-xs tracking-wider text-white truncate">VOID INTERNATIONAL</span>
              <span className="text-[9px] font-mono font-semibold tracking-widest text-void-gold bg-void-gold/10 px-1.5 py-0.5 rounded border border-void-gold/20 w-fit mt-0.5">
                MVP
              </span>
            </div>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 text-void-muted hover:text-void-body rounded-lg hover:bg-white/[0.06] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto py-4 px-2">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => window.dispatchEvent(new CustomEvent('close-terminal'))}
                className={cn(
                  "group relative flex items-center gap-x-3 rounded-lg px-2.5 py-2 text-xs font-medium tracking-wide transition-all duration-200",
                  isActive
                    ? "bg-white/[0.06] text-void-gold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] border border-void-gold/30"
                    : "text-void-muted hover:bg-white/[0.04] hover:text-void-body border border-transparent"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105", 
                  isActive ? "text-void-gold drop-shadow-[0_0_6px_rgba(201,168,76,0.5)]" : "text-void-muted group-hover:text-void-body"
                )} />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-void-gold shadow-[0_0_6px_#C9A84C]" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* System Status & Terminal Footer */}
      <div className="p-2 space-y-2 border-t border-white/[0.08] bg-[#030305]/50">
        {!collapsed && (
          <div className="px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[11px]">
            <span className="text-void-muted font-mono flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-void-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-void-success"></span>
              </span>
              Mesh Online
            </span>
            <span className="text-void-gold font-mono text-[10px]">v0.1.0</span>
          </div>
        )}
        
        <button 
          className={cn(
            "w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-void-body transition-all duration-200 hover:border-void-gold/40 group",
            collapsed && "px-0"
          )}
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-terminal'))}
          title={collapsed ? "Open Terminal" : undefined}
        >
          <Terminal className="h-4 w-4 text-void-gold group-hover:drop-shadow-[0_0_6px_rgba(201,168,76,0.5)]" />
          {!collapsed && <span className="text-xs font-mono font-medium">void-cli</span>}
        </button>
      </div>
    </aside>
  )
}
