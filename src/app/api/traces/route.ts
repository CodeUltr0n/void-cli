import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const serverId = searchParams.get('serverId')
    
    let where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (serverId && serverId !== 'all') {
      where.serverId = serverId
    }

    const traces = await db.requestTrace.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        server: {
          select: { name: true, status: true }
        }
      }
    })
    
    return NextResponse.json(traces)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch traces' }, { status: 500 })
  }
}
