import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let where = {}
    if (status && status !== 'All') {
      where = { status: status.toLowerCase() }
    }
    
    const servers = await db.mCPServer.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(servers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const server = await db.mCPServer.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type || 'mcp',
        endpointUrl: body.endpointUrl,
        config: body.config || '{}',
        tools: body.tools || '[]',
        status: 'active'
      }
    })
    
    return NextResponse.json(server)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
