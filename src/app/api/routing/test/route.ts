import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { routeRequest } from '@/lib/mcp/router'
import { HotelHub, SkyRoute, BookEase } from '@/lib/mcp/mock-servers'
import { subDays } from 'date-fns'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { toolName, query, strategy = 'latency' } = body

    if (!toolName) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 })
    }

    // Get healthy servers
    const servers = await db.mCPServer.findMany({
      where: { status: { not: 'down' } }
    })

    // Get recent metrics for routing decisions
    const yesterday = subDays(new Date(), 1)
    const recentMetrics = await db.serverMetric.findMany({
      where: { timestamp: { gte: yesterday } }
    })

    // 1. Run routing engine
    const decision = routeRequest({
      toolName,
      query,
      servers,
      recentMetrics
    }, strategy)

    // 2. Simulate the actual execution with mock latency
    const start = Date.now()
    let status = 'success'
    let errorMessage = null
    let output = null

    try {
      // Map server ID to mock implementation
      // In a real app this would proxy to the actual MCP endpoint
      let mockServer;
      if (decision.server.name === 'HotelHub Pro') mockServer = HotelHub
      else if (decision.server.name === 'SkyRoute') mockServer = SkyRoute
      else mockServer = BookEase

      // Find the tool function
      const toolFn = (mockServer as any)[toolName]
      if (toolFn) {
        output = await toolFn({ query })
      } else {
        // Fallback for tools not perfectly mapped in mock
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300))
        output = { result: "Mock execution successful", tool: toolName }
      }
    } catch (e: any) {
      status = 'error'
      errorMessage = e.message || 'Execution failed'
      output = { error: errorMessage }
    }
    
    const latencyMs = Date.now() - start

    // 3. Record trace in background (don't await to keep response fast)
    db.requestTrace.create({
      data: {
        serverId: decision.server.id,
        toolName,
        input: JSON.stringify({ query }),
        output: JSON.stringify(output),
        status,
        latencyMs,
        routedVia: strategy,
      }
    }).catch(console.error)

    return NextResponse.json({
      decision,
      execution: {
        latencyMs,
        status,
        output,
        errorMessage
      }
    })
  } catch (error: any) {
    console.error("Routing API Error:", error)
    return NextResponse.json({ error: error.message || 'Routing failed' }, { status: 500 })
  }
}
