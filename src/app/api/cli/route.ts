import { NextResponse } from 'next/server'
import { parseCommand } from '@/components/terminal/command-parser'

export async function POST(request: Request) {
  try {
    const { command } = await request.json()
    
    if (!command) {
      return NextResponse.json({ output: '', type: 'text' })
    }

    const result = await parseCommand(command)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("CLI API Error:", error)
    return NextResponse.json({ output: error.message || 'CLI execution failed', type: 'error' })
  }
}
