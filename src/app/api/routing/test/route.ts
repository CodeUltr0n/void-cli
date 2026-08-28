import { NextResponse } from 'next/server'
import { getServers, getMetrics, addTrace } from '@/lib/store'
import { routeRequest } from '@/lib/mcp/router'
import { HotelHub, SkyRoute, BookEase } from '@/lib/mcp/mock-servers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { toolName, query, strategy = 'latency' } = body

    if (!toolName) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 })
    }

    // Get healthy servers
    const servers = getServers().filter(s => s.status !== 'down')
    const recentMetrics = getMetrics(undefined, 24)

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
      let mockServer;
      if (decision.server.name === 'HotelHub Pro') mockServer = HotelHub
      else if (decision.server.name === 'SkyRoute API' || decision.server.name === 'SkyRoute') mockServer = SkyRoute
      else mockServer = BookEase

      const toolFn = (mockServer as any)[toolName]
      if (toolFn) {
        output = await toolFn({ query })
      } else {
        await new Promise(r => setTimeout(r, 120 + Math.random() * 80))
        output = { result: "Mock execution successful", tool: toolName }
      }
    } catch (e: any) {
      status = 'error'
      errorMessage = e.message || 'Execution failed'
      output = { error: errorMessage }
    }
    
    const latencyMs = Date.now() - start

    // 3. Record trace in memory store
    addTrace({
      serverId: decision.server.id,
      serverName: decision.server.name,
      toolName,
      durationMs: latencyMs,
      status,
      requestPayload: JSON.stringify({ query }),
      responsePayload: JSON.stringify(output),
      errorMessage,
    })

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
