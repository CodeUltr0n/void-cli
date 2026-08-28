import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Get metrics for the last 24 hours
    const metrics = await db.serverMetric.findMany({
      where: {
        serverId: id,
      },
      orderBy: {
        timestamp: 'asc'
      },
      take: 24
    })
    
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
