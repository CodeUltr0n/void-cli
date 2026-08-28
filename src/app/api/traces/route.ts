import { NextResponse } from 'next/server'
import { getTraces } from '@/lib/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const serverId = searchParams.get('serverId')
    
    const filters: { limit?: number; status?: string; serverId?: string } = { limit }
    if (status && status !== 'all') filters.status = status
    if (serverId && serverId !== 'all') filters.serverId = serverId

    const traces = getTraces(filters)
    return NextResponse.json(traces)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch traces' }, { status: 500 })
  }
}
