"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Activity, Clock, AlertTriangle, ArrowUpRight, Plus, GitBranch, Terminal, ShieldCheck, Zap } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [traces, setTraces] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard/stats').then(res => res.json()).then(setStats)
    fetch('/api/traces?limit=10').then(res => res.json()).then(setTraces)
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-void-muted text-sm font-mono animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-void-gold animate-ping"></div>
          Syncing Void MCP Telemetry...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Brand Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#08080e] via-[#050508] to-[#030305] p-6 sm:p-8">
        {/* Background radial accretion glow */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-96 h-96 bg-void-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 flex items-center justify-center rounded-2xl bg-black/40 border border-white/[0.1] shadow-[0_0_30px_rgba(201,168,76,0.2)]">
              <Image 
                src="/void-logo.png" 
                alt="Void Black Hole Logo" 
                width={80} 
                height={80} 
                priority
                loading="eager"
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                className="object-contain drop-shadow-[0_0_12px_rgba(201,168,76,0.6)] animate-subtle-pulse" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">Void Control Plane</h2>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-void-gold/10 border border-void-gold/30 text-void-gold">
                  LIVE MESH
                </span>
              </div>
              <p className="text-sm text-void-muted mt-1 max-w-xl">
                The high-performance infrastructure layer for AI agent MCP routing, server orchestration, and runtime telemetry.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              href="/servers/new"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-void-gold text-black px-4 py-2 rounded-lg font-medium text-xs hover:bg-[#d6b75a] transition-all duration-200 shadow-[0_0_15px_rgba(201,168,76,0.25)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Server
            </Link>
            <Link 
              href="/routing"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200"
            >
              <GitBranch className="h-3.5 w-3.5 text-void-gold" />
              Test Router
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Servers */}
        <Card className="card-void-glow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-void-muted">Total Clusters</span>
            <div className="h-7 w-7 rounded-lg bg-void-gold/10 border border-void-gold/20 flex items-center justify-center text-void-gold">
              <Server className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white tracking-tight">{stats.servers.total}</div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-void-success bg-void-success/10 px-1.5 py-0.5 rounded border border-void-success/20">
                ● {stats.servers.healthy} Healthy
              </span>
              <span className="text-void-warning bg-void-warning/10 px-1.5 py-0.5 rounded border border-void-warning/20">
                {stats.servers.degraded} Degraded
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Requests */}
        <Card className="card-void-glow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-void-muted">Requests (24h)</span>
            <div className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-void-gold">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white tracking-tight">{stats.requests.total24h.toLocaleString()}</div>
            <p className="text-xs text-void-muted mt-2 font-mono flex items-center gap-1">
              <span className={stats.requests.trend >= 0 ? "text-void-success font-medium" : "text-void-error font-medium"}>
                {stats.requests.trend >= 0 ? '↑ +' : '↓ '}{stats.requests.trend.toFixed(1)}%
              </span> 
              <span>vs prev 24h</span>
            </p>
          </CardContent>
        </Card>

        {/* Avg Latency */}
        <Card className="card-void-glow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-void-muted">p95 Latency</span>
            <div className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-void-gold">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-white tracking-tight flex items-baseline gap-1">
              {stats.latency.avgP95}
              <span className="text-sm font-mono text-void-muted font-normal">ms</span>
            </div>
            <p className="text-xs text-void-muted mt-2 font-mono flex items-center gap-1">
              <span className="text-void-success font-medium">↓ {stats.latency.trend}%</span>
              <span>opt. via score engine</span>
            </p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card className="card-void-glow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-void-muted">Error Margin</span>
            <div className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-void-gold">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-display font-bold tracking-tight ${stats.errors.rate < 1 ? 'text-void-success' : stats.errors.rate < 5 ? 'text-void-warning' : 'text-void-error'}`}>
              {stats.errors.rate.toFixed(2)}%
            </div>
            <p className="text-xs text-void-muted mt-2 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-void-success" />
              <span>99.98% SLA target</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests per minute Area Chart */}
        <Card className="card-void overflow-hidden">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white font-display text-base font-semibold">Throughput Volumetrics</CardTitle>
              <p className="text-xs text-void-muted mt-0.5">Real-time incoming agent requests/min</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/15 px-2.5 py-0.5 rounded-full border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Live Stream
            </span>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.charts.requestsPerMinute}>
                <defs>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#161622" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#09090e', borderColor: '#232336', borderRadius: '8px', color: '#e6e6e6', fontSize: '12px' }} 
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#redGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Server Latencies */}
        <Card className="card-void overflow-hidden">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white font-display text-base font-semibold">Server Response Benchmark</CardTitle>
              <p className="text-xs text-void-muted mt-0.5">p50, p95, and p99 percentiles across clusters (ms)</p>
            </div>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.latencyByServer}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161622" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#09090e', borderColor: '#232336', borderRadius: '8px', color: '#e6e6e6', fontSize: '12px' }} 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="p50" name="p50" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p95" name="p95" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p99" name="p99" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Live Traces Table */}
      <Card className="card-void overflow-hidden">
        <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white font-display text-base font-semibold">Recent Execution Traces</CardTitle>
            <p className="text-xs text-void-muted mt-0.5">Latest tool execution events routed across MCP servers</p>
          </div>
          <Link href="/traces" className="text-xs font-mono text-void-gold hover:underline flex items-center gap-1">
            View All Traces
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-void-muted font-mono uppercase bg-white/[0.02] border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Tool Execution</th>
                  <th className="px-6 py-3.5 font-medium">Server Target</th>
                  <th className="px-6 py-3.5 font-medium">Latency</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {traces.map((trace) => (
                  <tr key={trace.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-3.5 font-mono text-void-body font-medium flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-void-gold/80 group-hover:scale-125 transition-transform" />
                      {trace.toolName}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-void-muted group-hover:text-void-body transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full ${trace.server?.status === 'active' ? 'bg-void-success' : trace.server?.status === 'degraded' ? 'bg-void-warning' : 'bg-void-error'}`}></div>
                        {trace.server?.name || "Target Node"}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-void-body">
                      {trace.latencyMs}ms
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md ${
                        trace.status === 'success' ? 'border-void-success/30 bg-void-success/10 text-void-success' : 
                        trace.status === 'timeout' ? 'border-void-warning/30 bg-void-warning/10 text-void-warning' : 'border-void-error/30 bg-void-error/10 text-void-error'
                      }`}>
                        {trace.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-void-muted">
                      {new Date(trace.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
