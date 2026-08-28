import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const traces = await db.requestTrace.findMany({
      where: {
        serverId: id,
      },
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
