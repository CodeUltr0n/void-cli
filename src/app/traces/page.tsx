"use client"

import React, { useEffect, useState } from "react"
import { Activity, Clock, Server, CheckCircle2, XCircle, Search, Filter, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

export default function TracesPage() {
  const [traces, setTraces] = useState<any[]>([])
  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [serverFilter, setServerFilter] = useState("all")
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/servers').then(res => res.json()).then(setServers)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/traces?status=${statusFilter}&serverId=${serverFilter}&limit=100`)
      .then(res => res.json())
      .then(data => {
        setTraces(data)
        setLoading(false)
      })
  }, [statusFilter, serverFilter])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Request Traces</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-void-gold bg-void-gold/10 px-2 py-0.5 rounded border border-void-gold/20">
              Audit Stream
            </span>
          </div>
          <p className="text-xs text-void-muted mt-1">
            Complete cryptographic execution logs of all tool calls routed through the Void mesh.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="card-void bg-[#07070b]/60">
        <CardContent className="p-3.5 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-void-muted ml-1" />
            <Input 
              placeholder="Filter by trace ID, tool, or session..." 
              className="bg-[#050508] border-white/[0.08] h-8 text-xs font-mono focus:border-void-gold text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-void-muted">Status:</span>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-white/[0.08] bg-[#050508] px-2.5 text-xs font-mono text-white outline-none focus:border-void-gold"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-void-muted">Cluster:</span>
            <select 
              value={serverFilter}
              onChange={e => setServerFilter(e.target.value)}
              className="h-8 rounded-lg border border-white/[0.08] bg-[#050508] px-2.5 text-xs font-mono text-white outline-none focus:border-void-gold w-44"
            >
              <option value="all">All Clusters</option>
              {servers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Traces Table */}
      <Card className="card-void overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-void-muted font-mono uppercase bg-white/[0.02] border-b border-white/[0.04]">
              <tr>
                <th className="px-6 py-4 font-medium">Trace Identifier</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Tool Function</th>
                <th className="px-6 py-4 font-medium">Routed Node</th>
                <th className="px-6 py-4 font-medium">Strategy</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-void-muted font-mono">Streaming traces...</td></tr>
              ) : traces.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-void-muted font-mono">No traces found for the active filter set.</td></tr>
              ) : traces.map(trace => (
                <React.Fragment key={trace.id}>
                  <tr 
                    className={`hover:bg-white/[0.03] transition-colors cursor-pointer group ${expandedTrace === trace.id ? 'bg-white/[0.04]' : ''}`}
                    onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                  >
                    <td className="px-6 py-4 font-mono text-void-muted text-[11px] group-hover:text-void-gold transition-colors">
                      {trace.id.substring(0,12)}...
                    </td>
                    <td className="px-6 py-4 text-void-muted font-mono text-[11px] whitespace-nowrap">
                      {format(new Date(trace.timestamp || trace.createdAt || Date.now()), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 font-mono text-white font-medium">
                      {trace.toolName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-void-muted group-hover:text-white transition-colors">
                        <Server className="h-3 w-3 text-void-gold" />
                        {trace.serverName || trace.server?.name || "Unknown Target"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-white/[0.08] text-[10px] font-mono uppercase bg-white/[0.02]">
                        {trace.routedVia || 'latency'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {trace.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-void-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Success
                          </span>
                        ) : trace.status === 'timeout' ? (
                          <span className="inline-flex items-center gap-1 text-void-warning">
                            <Clock className="h-3.5 w-3.5" />
                            Timeout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-void-error">
                            <XCircle className="h-3.5 w-3.5" />
                            Error
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-white">
                      {trace.durationMs ?? trace.latencyMs ?? 0}ms
                    </td>
                  </tr>
                  
                  {expandedTrace === trace.id && (
                    <tr className="bg-[#050508] border-b border-white/[0.06] animate-in fade-in duration-200">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-[10px] uppercase font-mono font-semibold text-void-muted mb-2 tracking-wider">Input Payload</h4>
                            <div className="bg-[#07070b] rounded-lg p-3 border border-white/[0.06] h-44 overflow-y-auto">
                              <pre className="text-[11px] font-mono text-[#93c5fd]">
                                {(() => {
                                  try {
                                    const raw = trace.requestPayload || trace.input || '{}'
                                    return JSON.stringify(typeof raw === 'string' ? JSON.parse(raw) : raw, null, 2)
                                  } catch {
                                    return String(trace.requestPayload || trace.input || '{}')
                                  }
                                })()}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] uppercase font-mono font-semibold text-void-muted mb-2 tracking-wider">Output Response / Error</h4>
                            <div className="bg-[#07070b] rounded-lg p-3 border border-white/[0.06] h-44 overflow-y-auto">
                              <pre className={`text-[11px] font-mono ${trace.status === 'success' ? 'text-[#86efac]' : 'text-[#fca5a5]'}`}>
                                {trace.errorMessage ? 
                                  JSON.stringify({ error: trace.errorMessage }, null, 2) : 
                                  (() => {
                                    try {
                                      const raw = trace.responsePayload || trace.output || '{}'
                                      return JSON.stringify(typeof raw === 'string' ? JSON.parse(raw) : raw, null, 2)
                                    } catch {
                                      return String(trace.responsePayload || trace.output || '{}')
                                    }
                                  })()
                                }
                              </pre>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
