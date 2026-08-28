import { NextResponse } from 'next/server'
import { getServers, addServer } from '@/lib/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let servers = getServers()
    if (status && status !== 'All') {
      servers = servers.filter(s => s.status.toLowerCase() === status.toLowerCase())
    }
    
    return NextResponse.json(servers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const server = addServer({
      name: body.name,
      url: body.endpointUrl || body.url || 'https://mcp.void.dev/v1',
      cluster: body.cluster || 'us-east-1',
      tools: body.tools || JSON.stringify(['search', 'execute']),
      config: body.config || JSON.stringify({ cost_per_request: 0.05, priority: 1 }),
      status: 'active',
    })
    
    return NextResponse.json(server)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
