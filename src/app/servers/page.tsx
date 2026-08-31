"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Server, Plus, Activity, AlertTriangle, XCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ServersPage() {
  const [servers, setServers] = useState<any[]>([])
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/servers?status=${filter}`)
      .then(res => res.json())
      .then(data => {
        setServers(data)
        setLoading(false)
      })
  }, [filter])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">MCP Server Registry</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-void-gold bg-void-gold/10 px-2 py-0.5 rounded border border-void-gold/20">
              Mesh Nodes
            </span>
            <span className="text-[10px] font-mono text-void-muted bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
              Simulated Demo Data
            </span>
          </div>
          <p className="text-xs text-void-muted mt-1">
            Registered Model Context Protocol endpoints, tool schemas, and health metrics.
          </p>
        </div>

        <Link 
          href="/servers/new" 
          className="flex items-center gap-2 bg-void-gold text-black px-4 py-2 rounded-lg font-medium text-xs hover:bg-[#d6b75a] transition-all duration-200 shadow-[0_0_15px_rgba(201,168,76,0.2)] w-fit"
        >
          <Plus className="h-3.5 w-3.5" />
          Deploy MCP Server
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        {["All", "Active", "Degraded", "Down"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
              filter === status 
                ? "bg-white/[0.08] text-void-gold border border-void-gold/30 shadow-[0_0_10px_rgba(201,168,76,0.1)]" 
                : "text-void-muted hover:text-white hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Servers Table Card */}
      <Card className="card-void overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-void-muted font-mono uppercase bg-white/[0.02] border-b border-white/[0.04]">
              <tr>
                <th className="px-6 py-4 font-medium">Cluster Name</th>
                <th className="px-6 py-4 font-medium">Protocol</th>
                <th className="px-6 py-4 font-medium">Health Status</th>
                <th className="px-6 py-4 font-medium">Exposed Tools</th>
                <th className="px-6 py-4 font-medium">Configuration</th>
                <th className="px-6 py-4 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-void-muted font-mono">Loading clusters...</td></tr>
              ) : servers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-void-muted font-mono">No servers registered under this filter.</td></tr>
              ) : servers.map(server => {
                const tools = JSON.parse(server.tools || "[]")
                const config = JSON.parse(server.config || "{}")
                return (
                  <tr 
                    key={server.id} 
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/servers/${server.id}`}
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{server.name}</span>
                      </div>
                      <div className="text-[11px] text-void-muted font-mono font-normal mt-0.5 truncate max-w-[280px]">
                        {server.endpointUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-white/[0.1] text-void-muted uppercase text-[10px] font-mono bg-white/[0.02]">
                        {server.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {server.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-void-success bg-void-success/10 border border-void-success/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-void-success animate-pulse" />
                            Active
                          </span>
                        )}
                        {server.status === 'degraded' && (
                          <span 
                            title="Simulated demo environment"
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-void-warning bg-void-warning/15 border border-void-warning/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-help"
                          >
                            <span className="relative flex h-2 w-2 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-void-warning opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-void-warning"></span>
                            </span>
                            Degraded
                          </span>
                        )}
                        {server.status === 'down' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-void-error bg-void-error/10 border border-void-error/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-void-error" />
                            Offline
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded text-white font-mono text-[11px]">
                        {tools.length} tools
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-[11px] font-mono text-void-muted">
                        {config.cost_per_request && <span>Cost: ${config.cost_per_request}/req</span>}
                        {config.max_concurrent && <span>Max: {config.max_concurrent} conc.</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/servers/${server.id}`} 
                        className="inline-flex items-center gap-1 text-void-gold hover:text-white text-xs font-mono transition-colors group-hover:translate-x-0.5 transition-transform"
                      >
                        Inspect
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
