import type { MCPServer, ServerMetric } from '@prisma/client'

export interface RoutingContext {
  toolName: string;
  query?: string;
  servers: MCPServer[]; // healthy servers
  recentMetrics: ServerMetric[]; // last 24h per server
}

export interface RoutingDecision {
  server: MCPServer;
  strategy: string;
  score: number;
  reason: string; // human-readable explanation
  allScores: { serverName: string; score: number; reason: string }[];
}

// In-memory counter for round-robin
const requestCounters: Record<string, number> = {}

export function routeRequest(context: RoutingContext, strategy: string = 'latency'): RoutingDecision {
  const { servers, recentMetrics } = context

  if (!servers || servers.length === 0) {
    throw new Error("No healthy servers available for routing")
  }

  // Find servers that actually have the requested tool
  const capableServers = servers.filter(s => {
    try {
      const tools = JSON.parse(s.tools)
      return tools.includes(context.toolName)
    } catch {
      return false
    }
  })

  // If no specific capable server, fallback to all (for testing generic routing)
  const candidateServers = capableServers.length > 0 ? capableServers : servers

  const allScores = candidateServers.map(server => {
    const config = JSON.parse(server.config || "{}")
    const serverMetrics = recentMetrics.filter(m => m.serverId === server.id)
    
    // Average p95 latency for this server
    const avgP95 = serverMetrics.length > 0 
      ? serverMetrics.reduce((sum, m) => sum + (m.latencyP95 || 0), 0) / serverMetrics.length 
      : null

    let score = 0
    let reason = ""

    switch (strategy) {
      case 'latency':
        if (avgP95) {
          score = 100000 / avgP95 // lower latency = higher score
          reason = `Lowest p95 latency (${avgP95.toFixed(0)}ms)`
        } else {
          score = 500 + Math.random() * 100
          reason = "No historical data (randomized)"
        }
        break
      case 'cost':
        const cost = config.cost_per_request || 0.1
        score = 100 / cost
        reason = `Lowest cost ($${cost}/req)`
        break
      case 'round_robin':
        if (!requestCounters[server.id]) requestCounters[server.id] = 0
        // Lower count gets higher score. This is a simplified RR for stateless simulation.
        score = 1000 - (requestCounters[server.id] * 10)
        reason = "Round-robin rotation"
        break
      case 'manual':
        const priority = config.priority || 1
        score = 1000 - (priority * 100)
        reason = `Manual priority rule (${priority})`
        break
      default:
        score = 500
        reason = "Default fallback"
    }

    return { server, score, reason }
  })

  // Sort descending by score
  allScores.sort((a, b) => b.score - a.score)

  const winner = allScores[0]
  
  // Increment counter for round robin
  if (!requestCounters[winner.server.id]) requestCounters[winner.server.id] = 0
  requestCounters[winner.server.id]++

  return {
    server: winner.server,
    strategy,
    score: winner.score,
    reason: winner.reason,
    allScores: allScores.map(s => ({
      serverName: s.server.name,
      score: s.score,
      reason: s.reason
    }))
  }
}
