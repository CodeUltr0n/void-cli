import { mockServers, mockTraces, mockMetrics, MCPServer, RequestTrace, ServerMetric } from './mock-data'

export type { MCPServer, RequestTrace, ServerMetric }

// In-memory arrays initialized from mock data
let serversStore: MCPServer[] = [...mockServers]
let tracesStore: RequestTrace[] = [...mockTraces]
let metricsStore: ServerMetric[] = [...mockMetrics]

export function getServers(): MCPServer[] {
  return serversStore
}

export function getServerById(id: string): MCPServer | undefined {
  return serversStore.find(s => s.id === id)
}

export function addServer(serverData: Partial<MCPServer> & { name: string; url: string; cluster: string }): MCPServer {
  const newServer: MCPServer = {
    id: serverData.id || `server-${Date.now()}`,
    name: serverData.name,
    url: serverData.url,
    status: serverData.status || 'active',
    cluster: serverData.cluster,
    tools: serverData.tools || JSON.stringify(['search', 'execute']),
    config: serverData.config || JSON.stringify({ cost_per_request: 0.05, priority: 1 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  serversStore.unshift(newServer)
  return newServer
}

export function updateServerStatus(id: string, status: string): MCPServer | undefined {
  const server = serversStore.find(s => s.id === id)
  if (server) {
    server.status = status
    server.updatedAt = new Date()
  }
  return server
}

export function getTraces(filters?: { limit?: number; status?: string; serverId?: string }): RequestTrace[] {
  let result = [...tracesStore]
  if (filters?.serverId) {
    result = result.filter(t => t.serverId === filters.serverId)
  }
  if (filters?.status) {
    result = result.filter(t => t.status === filters.status)
  }
  if (filters?.limit) {
    result = result.slice(0, filters.limit)
  }
  return result
}

export function addTrace(traceData: Partial<RequestTrace> & { serverId: string; toolName: string; durationMs: number; status: string }): RequestTrace {
  const server = getServerById(traceData.serverId)
  const newTrace: RequestTrace = {
    id: traceData.id || `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    serverId: traceData.serverId,
    serverName: traceData.serverName || server?.name || 'Unknown Server',
    toolName: traceData.toolName,
    durationMs: traceData.durationMs,
    status: traceData.status,
    requestPayload: traceData.requestPayload || null,
    responsePayload: traceData.responsePayload || null,
    errorMessage: traceData.errorMessage || null,
    timestamp: new Date(),
  }
  tracesStore.unshift(newTrace)
  return newTrace
}

export function getMetrics(serverId?: string, hours: number = 24): ServerMetric[] {
  const now = new Date().getTime()
  const cutoff = now - hours * 60 * 60 * 1000
  let result = metricsStore.filter(m => m.timestamp.getTime() >= cutoff)
  if (serverId) {
    result = result.filter(m => m.serverId === serverId)
  }
  return result
}

export function getDashboardStats() {
  const servers = getServers()
  const activeCount = servers.filter(s => s.status === 'active').length
  const degradedCount = servers.filter(s => s.status === 'degraded').length
  const downCount = servers.filter(s => s.status === 'down').length

  const now = new Date().getTime()
  const last24h = now - 24 * 60 * 60 * 1000
  const prev24h = now - 48 * 60 * 60 * 1000

  const traces24h = tracesStore.filter(t => t.timestamp.getTime() >= last24h)
  const tracesPrev24h = tracesStore.filter(t => t.timestamp.getTime() >= prev24h && t.timestamp.getTime() < last24h)

  const requestCount24h = traces24h.length
  const requestCountPrev24h = tracesPrev24h.length
  const requestsTrend = requestCountPrev24h === 0 
    ? 12.5 
    : Number((((requestCount24h - requestCountPrev24h) / requestCountPrev24h) * 100).toFixed(1))

  const metrics24h = getMetrics(undefined, 24)
  const avgLatency = metrics24h.length > 0 
    ? Math.round(metrics24h.reduce((acc, curr) => acc + curr.latencyP95, 0) / metrics24h.length)
    : 142

  const errorRate = traces24h.length > 0
    ? Number(((traces24h.filter(t => t.status === 'error' || t.status === 'timeout').length / traces24h.length) * 100).toFixed(2))
    : 0.85

  // 7-day volume chart
  const last7DaysChart: { date: string; requests: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now - i * 24 * 60 * 60 * 1000)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const count = tracesStore.filter(t => t.timestamp.getTime() >= dayStart.getTime() && t.timestamp.getTime() < dayEnd.getTime()).length
    last7DaysChart.push({
      date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      requests: count,
    })
  }

  return {
    totalServers: servers.length,
    activeServers: activeCount,
    degradedServers: degradedCount,
    downServers: downCount,
    requestCount24h,
    requestsTrend,
    avgLatencyP95: avgLatency,
    errorRate,
    last7DaysChart,
    recentTraces: tracesStore.slice(0, 10),
  }
}
