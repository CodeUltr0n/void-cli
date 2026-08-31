"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Server, Activity, AlertTriangle, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

export default function ServerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [server, setServer] = useState<any>(null)
  const [metrics, setMetrics] = useState<any[]>([])
  const [traces, setTraces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return

    Promise.all([
      fetch(`/api/servers?status=All`).then(res => res.json()),
      fetch(`/api/servers/${params.id}/metrics`).then(res => res.json()),
      fetch(`/api/servers/${params.id}/traces?limit=10`).then(res => res.json())
    ]).then(([serversData, metricsData, tracesData]) => {
      const currentServer = serversData.find((s: any) => s.id === params.id)
      setServer(currentServer)
      
      // Format metrics for chart
      const formattedMetrics = metricsData.map((m: any) => ({
        ...m,
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        errorRatePct: (m.errorRate * 100).toFixed(2)
      }))
      
      setMetrics(formattedMetrics)
      setTraces(tracesData)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <div className="p-8 text-void-muted">Loading server details...</div>
  if (!server) return <div className="p-8 text-void-error">Server not found</div>

  const tools = JSON.parse(server.tools || "[]")
  const config = JSON.parse(server.config || "{}")
  const latestMetric = metrics[metrics.length - 1]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full text-void-muted hover:text-void-body transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-semibold text-void-body flex items-center gap-2">
              <Server className="h-6 w-6 text-void-gold" />
              {server.name}
            </h1>
            <Badge variant="outline" className={`capitalize font-mono text-xs px-2.5 py-0.5 rounded-full ${
              server.status === 'active' ? 'border-void-success/40 text-void-success bg-void-success/10 shadow-[0_0_12px_rgba(74,222,128,0.2)]' : 
                server.status === 'degraded' ? 'border-void-warning/50 text-void-warning bg-void-warning/15 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-semibold' : 'border-void-error/40 text-void-error bg-void-error/10'
            }`}>
              {server.status}
            </Badge>
          </div>
          <p className="text-sm text-void-muted mt-1">{server.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="card-void lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-void-body">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-void-muted uppercase font-semibold">Endpoint</label>
              <div className="font-mono text-sm text-void-body mt-1 bg-[#0d1117] p-2 rounded border border-void-border overflow-x-auto">
                {server.endpointUrl}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-void-muted uppercase font-semibold">Type</label>
                <div className="text-sm font-medium uppercase mt-1">{server.type}</div>
              </div>
              <div>
                <label className="text-xs text-void-muted uppercase font-semibold">Created</label>
                <div className="text-sm font-medium mt-1">{format(new Date(server.createdAt || Date.now()), 'MMM d, yyyy')}</div>
              </div>
              <div>
                <label className="text-xs text-void-muted uppercase font-semibold">Cost/Req</label>
                <div className="text-sm font-medium mt-1">${config.cost_per_request || '0.00'}</div>
              </div>
              <div>
                <label className="text-xs text-void-muted uppercase font-semibold">Uptime (24h)</label>
                <div className="text-sm font-medium mt-1 text-void-success">{latestMetric?.uptime?.toFixed(2) || '100'}%</div>
              </div>
            </div>

            <div className="pt-4 border-t border-void-border">
              <label className="text-xs text-void-muted uppercase font-semibold mb-2 block">Exposed Tools ({tools.length})</label>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool: string) => (
                  <Badge key={tool} variant="secondary" className="bg-white/5 text-void-body font-mono text-xs border-void-border font-normal">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-void">
            <CardHeader>
              <CardTitle className="text-void-body font-display text-lg">Latency Profile (24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#1a1a2e', color: '#e6e6e6' }} />
                  <Legend />
                  <Line type="monotone" dataKey="latencyP50" name="p50 (ms)" stroke="#4ade80" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="latencyP95" name="p95 (ms)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="latencyP99" name="p99 (ms)" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="card-void">
            <CardHeader>
              <CardTitle className="text-void-body font-display text-lg">Error Rate (24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#1a1a2e', color: '#e6e6e6' }} />
                  <Line type="stepAfter" dataKey="errorRatePct" name="Error Rate %" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Traces for this server */}
      <Card className="card-void">
        <CardHeader>
          <CardTitle className="text-void-body font-display text-lg">Recent Traces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-void-muted uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {traces.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-void-muted">No recent traces</td></tr>
                ) : traces.map((trace) => (
                  <tr key={trace.id} className="border-b border-void-border hover:bg-white/5 transition-colors cursor-pointer" onClick={() => window.location.href = `/traces`}>
                    <td className="px-4 py-3 font-mono text-void-muted text-xs">{trace.id.substring(0,8)}</td>
                    <td className="px-4 py-3 font-mono text-void-body">{trace.toolName}</td>
                    <td className="px-4 py-3 font-mono">{trace.durationMs ?? trace.latencyMs ?? 0}ms</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={
                        trace.status === 'success' ? 'border-void-success text-void-success' : 
                        trace.status === 'timeout' ? 'border-void-warning text-void-warning' : 'border-void-error text-void-error'
                      }>
                        {trace.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-void-muted">
                      {format(new Date(trace.timestamp || trace.createdAt || Date.now()), 'MMM d, HH:mm:ss')}
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
