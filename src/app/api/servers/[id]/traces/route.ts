import { NextResponse } from 'next/server'
import { getTraces } from '@/lib/store'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const traces = getTraces({ serverId: id, limit })
    return NextResponse.json(traces)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch traces' }, { status: 500 })
  }
}
