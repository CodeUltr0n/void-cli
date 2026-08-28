import { NextResponse } from 'next/server'
import { getMetrics } from '@/lib/store'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metrics = getMetrics(id, 24).reverse()
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
