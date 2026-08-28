export interface MCPServer {
  id: string
  name: string
  url: string
  status: 'active' | 'degraded' | 'down' | string
  cluster: string
  tools: string // JSON array string
  config: string // JSON object string
  createdAt: Date
  updatedAt: Date
}

export interface RequestTrace {
  id: string
  serverId: string
  serverName: string
  toolName: string
  durationMs: number
  status: 'success' | 'error' | 'timeout' | string
  requestPayload?: string | null
  responsePayload?: string | null
  errorMessage?: string | null
  timestamp: Date
}

export interface ServerMetric {
  id: string
  serverId: string
  serverName: string
  timestamp: Date
  latencyP50: number
  latencyP95: number
  latencyP99: number
  errorRate: number
  throughput: number
  uptime: number
}

const NOW = new Date()

export const mockServers: MCPServer[] = [
  {
    id: 'server-hotelhub-pro',
    name: 'HotelHub Pro',
    url: 'https://hotelhub-mcp.void.dev/v1',
    status: 'active',
    cluster: 'us-east-1',
    tools: JSON.stringify(['search_hotels', 'book_hotel', 'check_availability', 'cancel_reservation']),
    config: JSON.stringify({ cost_per_request: 0.04, priority: 1, max_connections: 500 }),
    createdAt: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: NOW,
  },
  {
    id: 'server-skyroute-api',
    name: 'SkyRoute API',
    url: 'https://skyroute-mcp.void.dev/v1',
    status: 'degraded',
    cluster: 'eu-central-1',
    tools: JSON.stringify(['search_flights', 'book_flight', 'check_flight_status', 'seat_map']),
    config: JSON.stringify({ cost_per_request: 0.08, priority: 2, max_connections: 300 }),
    createdAt: new Date(NOW.getTime() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: NOW,
  },
  {
    id: 'server-bookease-hub',
    name: 'BookEase Hub',
    url: 'https://bookease-mcp.void.dev/v1',
    status: 'active',
    cluster: 'ap-south-1',
    tools: JSON.stringify(['create_booking', 'get_booking_details', 'search_inventory', 'modify_booking']),
    config: JSON.stringify({ cost_per_request: 0.03, priority: 1, max_connections: 1000 }),
    createdAt: new Date(NOW.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: NOW,
  },
]

// Generate 500+ Request Traces over the last 7 days
export const mockTraces: RequestTrace[] = []
const toolsByServer: Record<string, { id: string; name: string; tools: string[] }> = {
  'server-hotelhub-pro': { id: 'server-hotelhub-pro', name: 'HotelHub Pro', tools: ['search_hotels', 'book_hotel', 'check_availability'] },
  'server-skyroute-api': { id: 'server-skyroute-api', name: 'SkyRoute API', tools: ['search_flights', 'book_flight', 'check_flight_status'] },
  'server-bookease-hub': { id: 'server-bookease-hub', name: 'BookEase Hub', tools: ['create_booking', 'get_booking_details', 'search_inventory'] },
}

const serverKeys = Object.keys(toolsByServer)

for (let i = 0; i < 520; i++) {
  const serverKey = serverKeys[i % serverKeys.length]
  const serverInfo = toolsByServer[serverKey]
  const toolName = serverInfo.tools[i % serverInfo.tools.length]

  // Distribute over 7 days (7 * 24 * 60 * 60 * 1000 ms)
  const timeOffsetMs = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
  const timestamp = new Date(NOW.getTime() - timeOffsetMs)

  // Status distribution: ~92% success, ~5% error, ~3% timeout
  const randStatus = Math.random()
  let status: 'success' | 'error' | 'timeout' = 'success'
  let errorMessage: string | null = null

  if (randStatus > 0.95) {
    status = 'timeout'
    errorMessage = 'Gateway timeout after 5000ms'
  } else if (randStatus > 0.90) {
    status = 'error'
    errorMessage = 'Upstream provider connection refused (503 Service Unavailable)'
  }

  const baseDuration = serverInfo.id === 'server-skyroute-api' ? 240 : 110
  const durationMs = status === 'timeout' 
    ? 5000 
    : Math.floor(baseDuration + Math.random() * 80 + (status === 'error' ? 300 : 0))

  mockTraces.push({
    id: `trace-${1000 + i}`,
    serverId: serverInfo.id,
    serverName: serverInfo.name,
    toolName,
    durationMs,
    status,
    requestPayload: JSON.stringify({ action: toolName, query: 'Mumbai', timestamp: timestamp.toISOString() }),
    responsePayload: status === 'success' 
      ? JSON.stringify({ status: 'ok', tool: toolName, result_count: Math.floor(Math.random() * 5) + 1 }) 
      : null,
    errorMessage,
    timestamp,
  })
}

// Sort traces newest first
mockTraces.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

// Generate 500+ Server Metrics (one per server per hour over 7 days = 3 * 24 * 7 = 504)
export const mockMetrics: ServerMetric[] = []
let metricCounter = 1

for (let hour = 0; hour < 168; hour++) {
  const timestamp = new Date(NOW.getTime() - hour * 60 * 60 * 1000)
  
  mockServers.forEach(server => {
    const isDegraded = server.status === 'degraded'
    const baseLatency = isDegraded ? 230 : (server.name === 'HotelHub Pro' ? 95 : 120)
    const errorRate = isDegraded ? 0.08 : 0.01

    mockMetrics.push({
      id: `metric-${metricCounter++}`,
      serverId: server.id,
      serverName: server.name,
      timestamp,
      latencyP50: Math.floor(baseLatency + (Math.random() * 20 - 10)),
      latencyP95: Math.floor(baseLatency * 1.4 + (Math.random() * 30 - 15)),
      latencyP99: Math.floor(baseLatency * 1.9 + (Math.random() * 50 - 25)),
      errorRate: Number((errorRate + (Math.random() * 0.02 - 0.01)).toFixed(3)),
      throughput: Math.floor((isDegraded ? 120 : 350) + Math.random() * 100 - 50),
      uptime: isDegraded ? 98.4 : 99.98,
    })
  })
}

// Sort metrics newest first
mockMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
