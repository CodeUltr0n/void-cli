"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Book, Command, ShieldCheck, ChevronRight, AlertTriangle, Activity } from "lucide-react"

export function Header() {
  const pathname = usePathname() || "/"
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "SkyRoute Latency Elevated",
      description: "Cluster p95 latency increased to ~240ms in us-west-2 (Simulated demo).",
      time: "8m ago",
      type: "warning",
      unread: true,
      href: "/servers"
    },
    {
      id: "2",
      title: "Dynamic Routing Mesh Active",
      description: "6-layer multi-cluster scoring evaluated 3 server endpoints.",
      time: "24m ago",
      type: "info",
      unread: true,
      href: "/routing"
    },
    {
      id: "3",
      title: "Live Request Traces Online",
      description: "Audit trail stream capturing incoming Model Context Protocol payloads.",
      time: "1h ago",
      type: "success",
      unread: false,
      href: "/traces"
    }
  ])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [notificationsOpen])

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

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
        
        {/* Notifications Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setNotificationsOpen(prev => !prev)}
            aria-label="Toggle notifications"
            className="text-void-muted hover:text-white transition-colors relative p-1.5 rounded-md hover:bg-white/[0.06] focus:outline-none"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#050508] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-white/[0.1] bg-[#09090e]/95 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-xs text-white">System Alerts</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-void-muted bg-white/[0.04] px-1.5 py-0.2 rounded-full">
                      All read
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] font-mono text-void-gold hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markAsRead(item.id)
                      setNotificationsOpen(false)
                    }}
                    className={`flex items-start gap-3 p-3.5 hover:bg-white/[0.04] transition-colors group relative ${
                      item.unread ? "bg-white/[0.02]" : "opacity-80"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === "warning" && (
                        <div className="h-6 w-6 rounded-lg bg-void-warning/10 border border-void-warning/20 flex items-center justify-center text-void-warning">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                      )}
                      {item.type === "info" && (
                        <div className="h-6 w-6 rounded-lg bg-void-gold/10 border border-void-gold/20 flex items-center justify-center text-void-gold">
                          <Activity className="h-3 w-3" />
                        </div>
                      )}
                      {item.type === "success" && (
                        <div className="h-6 w-6 rounded-lg bg-void-success/10 border border-void-success/20 flex items-center justify-center text-void-success">
                          <ShieldCheck className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${item.unread ? "text-white" : "text-void-body"}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-void-muted shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-void-muted mt-0.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    {item.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2 border-t border-white/[0.08] bg-white/[0.01] text-center">
                <Link
                  href="/traces"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-mono text-void-muted hover:text-void-gold transition-colors inline-flex items-center gap-1 py-1"
                >
                  View full telemetry traces
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* User Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-void-gold/10 border border-void-gold/30 text-[11px] font-semibold text-void-gold shadow-[0_0_8px_rgba(201,168,76,0.15)]">
          KC
        </div>
      </div>
    </header>
  )
}
