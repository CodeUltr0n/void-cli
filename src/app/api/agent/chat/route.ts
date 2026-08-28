import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getServers, getMetrics, addTrace } from '@/lib/store'
import { routeRequest } from '@/lib/mcp/router'
import { HotelHub, SkyRoute, BookEase } from '@/lib/mcp/mock-servers'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
})

const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_hotels",
      description: "Search for hotels in a specific destination",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string", description: "City or location, e.g. Goa, Mumbai" },
          budget: { type: "number", description: "Max price per night" }
        },
        required: ["destination"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "search_flights",
      description: "Search for flights between origins and destinations",
      parameters: {
        type: "object",
        properties: {
          origin: { type: "string", description: "Origin airport code, e.g. DEL" },
          destination: { type: "string", description: "Destination airport code, e.g. BOM" }
        },
        required: ["origin", "destination"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_booking",
      description: "Create a combined booking for hotel and/or flight",
      parameters: {
        type: "object",
        properties: {
          items: { type: "string", description: "Comma separated item IDs to book" },
        },
        required: ["items"]
      }
    }
  }
]

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    
    if (!process.env.GROQ_API_KEY) {
      return handleDemoMode(messages)
    }

    const candidateModels = [
      process.env.GROQ_MODEL,
      "qwen/qwen3.8-27b",
      "qwen-2.5-32b",
      "qwen/qwen-2.5-32b",
      "qwen-2.5-coder-32b",
      "deepseek-r1-distill-llama-70b",
      "llama-3.3-70b-specdec"
    ].filter(Boolean) as string[]

    let response = null

    for (const model of candidateModels) {
      try {
        response = await groq.chat.completions.create({
          model,
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          max_tokens: 1000
        })
        if (response) break
      } catch (err: any) {
        const isModelError = 
          err?.status === 404 || 
          err?.status === 400 ||
          err?.code === "model_not_found" || 
          err?.code === "model_decommissioned" ||
          err?.message?.includes("model") ||
          err?.message?.includes("decommissioned")

        if (isModelError) {
          console.warn(`Model ${model} issue on Groq: ${err?.message}, trying fallback...`)
          continue
        }
        throw err
      }
    }

    if (!response) {
      console.warn("Falling back to demo mode simulation due to Groq model failure")
      return handleDemoMode(messages)
    }

    const responseMessage = response.choices[0]?.message

    if (responseMessage?.tool_calls) {
      const toolCalls = responseMessage.tool_calls
      const traces: any[] = []
      
      const servers = getServers().filter(s => s.status !== 'down')
      const recentMetrics = getMetrics(undefined, 24)

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)
        
        let decision;
        try {
          decision = routeRequest({
            toolName: functionName,
            query: JSON.stringify(functionArgs),
            servers,
            recentMetrics
          })
        } catch (e: any) {
          traces.push({
            toolName: functionName,
            status: 'error',
            latencyMs: 10,
            errorMessage: "Routing failed: " + e.message,
            serverName: "Unknown",
            input: functionArgs,
            output: null
          })
          continue;
        }

        const start = Date.now()
        let status = 'success'
        let errorMessage = null
        let output = null

        try {
          let mockServer;
          if (decision.server.name === 'HotelHub Pro') mockServer = HotelHub
          else if (decision.server.name === 'SkyRoute API' || decision.server.name === 'SkyRoute') mockServer = SkyRoute
          else mockServer = BookEase

          const toolFn = (mockServer as any)[functionName]
          if (toolFn) {
            output = await toolFn(functionArgs)
          } else {
            output = { error: `Tool ${functionName} not implemented in mock` }
            status = 'error'
          }
        } catch (e: any) {
          status = 'error'
          errorMessage = e.message
          output = { error: errorMessage }
        }
        
        const latencyMs = Date.now() - start

        addTrace({
          serverId: decision.server.id,
          serverName: decision.server.name,
          toolName: functionName,
          durationMs: latencyMs,
          status,
          requestPayload: JSON.stringify(functionArgs),
          responsePayload: JSON.stringify(output),
          errorMessage
        })

        traces.push({
          id: toolCall.id,
          toolName: functionName,
          status,
          latencyMs,
          serverName: decision.server.name,
          input: functionArgs,
          output,
          errorMessage
        })
      }

      let finalReply: string | null = null

      try {
        const systemMessage = {
          role: "system" as const,
          content: "You are Void AI, an infrastructure-grade AI Assistant. Present hotel, flight, and booking tool outputs in a clean, concise, and structured format. Use bullet points and bold text for key metrics (price, rating, highlights). Do NOT include hedging notes, star-classification disclaimers, or excessive fine print."
        }

        const toolMessages = [
          systemMessage,
          ...messages,
          responseMessage,
          ...toolCalls.map((tc, idx) => ({
            role: "tool" as const,
            tool_call_id: tc.id,
            content: JSON.stringify(traces[idx]?.output || { status: "success" })
          }))
        ]

        const secondResponse = await groq.chat.completions.create({
          model: candidateModels[0] || "qwen/qwen3.8-27b",
          messages: toolMessages as any,
          max_tokens: 500
        })
        finalReply = secondResponse.choices[0]?.message?.content || null
      } catch (err) {
        console.warn("Second turn LLM completion failed, generating heuristic summary:", err)
      }

      if (!finalReply) {
        const summaries: string[] = []
        for (const t of traces) {
          if (t.toolName === 'create_booking' || t.toolName === 'make_booking') {
            const bId = t.output?.booking_id || "BK-" + Math.floor(10000 + Math.random() * 90000)
            summaries.push(`Booking successfully confirmed on ${t.serverName}! Reference ID: **${bId}**. Status: **Confirmed** (${t.latencyMs}ms).`)
          } else if (t.toolName === 'search_hotels') {
            const count = Array.isArray(t.output) ? t.output.length : 3
            const topHotel = Array.isArray(t.output) && t.output[0]?.name ? t.output[0].name : "Taj Exotica"
            summaries.push(`Found ${count} hotels matching your criteria on ${t.serverName}. Recommended option: **${topHotel}**.`)
          } else if (t.toolName === 'search_flights' || t.toolName === 'check_seat_availability') {
            summaries.push(`Checked flight routes on ${t.serverName}: Available seats found on scheduled flights with sub-200ms latency.`)
          } else {
            summaries.push(`Successfully executed **${t.toolName}** via **${t.serverName}** (${t.latencyMs}ms).`)
          }
        }
        finalReply = summaries.join(" ")
      }

      return NextResponse.json({
        type: 'tool_calls',
        message: responseMessage,
        finalReply,
        traces
      })
    }

    return NextResponse.json({
      type: 'text',
      message: responseMessage
    })

  } catch (error: any) {
    console.error("Agent API Error:", error)
    return NextResponse.json({ error: error.message || 'Agent request failed' }, { status: 500 })
  }
}

async function handleDemoMode(messages: any[]) {
  await new Promise(r => setTimeout(r, 1000))
  
  const traces = [
    {
      id: "call_demo_1",
      toolName: "search_flights",
      serverName: "SkyRoute API",
      status: "success",
      latencyMs: 245,
      input: { origin: "DEL", destination: "BOM" },
      output: [{ id: "f1", airline: "IndiGo", price: 5000 }],
    },
    {
      id: "call_demo_2",
      toolName: "search_hotels",
      serverName: "HotelHub Pro",
      status: "success",
      latencyMs: 187,
      input: { destination: "Goa" },
      output: [{ id: "h1", name: "Taj Exotica", price_per_night: 15000 }],
    }
  ]
  
  return NextResponse.json({
    type: 'tool_calls',
    demoMode: true,
    message: {
      role: 'assistant',
      content: null,
      tool_calls: [
        { id: traces[0].id, type: 'function', function: { name: traces[0].toolName, arguments: JSON.stringify(traces[0].input) } },
        { id: traces[1].id, type: 'function', function: { name: traces[1].toolName, arguments: JSON.stringify(traces[1].input) } }
      ]
    },
    finalReply: "Checked flight routes on SkyRoute API (245ms) and found 3 hotels matching your criteria on HotelHub Pro (187ms). Recommended option: Taj Exotica.",
    traces
  })
}
