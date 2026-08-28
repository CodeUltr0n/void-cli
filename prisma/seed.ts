import { PrismaClient } from '@prisma/client'
import { subDays, subHours, subMinutes, addMinutes } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.requestTrace.deleteMany()
  await prisma.serverMetric.deleteMany()
  await prisma.mCPServer.deleteMany()

  // Create Servers
  const hotelHub = await prisma.mCPServer.create({
    data: {
      name: "HotelHub Pro",
      description: "Global hotel and accommodation API",
      type: "mcp",
      endpointUrl: "https://mcp.void.dev/v1/hotelhub",
      status: "active",
      tools: JSON.stringify(["search_hotels", "get_hotel_details", "check_availability", "make_booking"]),
      config: JSON.stringify({ cost_per_request: 0.05, max_concurrent: 100 }),
    }
  })

  const skyRoute = await prisma.mCPServer.create({
    data: {
      name: "SkyRoute",
      description: "Airline ticketing and flight status",
      type: "mcp",
      endpointUrl: "https://mcp.void.dev/v1/skyroute",
      status: "degraded",
      tools: JSON.stringify(["search_flights", "get_flight_details", "check_seat_availability"]),
      config: JSON.stringify({ cost_per_request: 0.12, max_concurrent: 50 }),
    }
  })

  const bookEase = await prisma.mCPServer.create({
    data: {
      name: "BookEase",
      description: "Unified booking and payment processing",
      type: "mcp",
      endpointUrl: "https://mcp.void.dev/v1/bookease",
      status: "active",
      tools: JSON.stringify(["create_booking", "get_booking_status", "process_payment", "send_confirmation"]),
      config: JSON.stringify({ cost_per_request: 0.08, max_concurrent: 200 }),
    }
  })

  const servers = [hotelHub, skyRoute, bookEase]

  console.log("Seeding metrics...")
  // Seed Metrics (Last 7 days, every hour)
  for (let i = 0; i < 24 * 7; i++) {
    const timestamp = subHours(new Date(), i)
    
    for (const server of servers) {
      let p50, p95, p99, errRate, tput, uptime
      
      if (server.id === hotelHub.id) {
        p50 = 100 + Math.random() * 50
        p95 = p50 + 50 + Math.random() * 100
        p99 = p95 + 50 + Math.random() * 100
        errRate = 0.03 + Math.random() * 0.04
        tput = 20 + Math.random() * 60
        uptime = 98 + Math.random() * 1.5
      } else if (server.id === skyRoute.id) {
        p50 = 150 + Math.random() * 100
        p95 = p50 + 100 + Math.random() * 150
        p99 = p95 + 100 + Math.random() * 200
        errRate = 0.05 + Math.random() * 0.07 // Higher error rate, degraded
        tput = 10 + Math.random() * 40
        uptime = 95 + Math.random() * 4
      } else {
        p50 = 200 + Math.random() * 100
        p95 = p50 + 100 + Math.random() * 100
        p99 = p95 + 50 + Math.random() * 100
        errRate = 0.01 + Math.random() * 0.04
        tput = 30 + Math.random() * 50
        uptime = 99 + Math.random() * 0.8
      }

      await prisma.serverMetric.create({
        data: {
          serverId: server.id,
          timestamp,
          latencyP50: p50,
          latencyP95: p95,
          latencyP99: p99,
          errorRate: errRate,
          throughput: tput,
          uptime
        }
      })
    }
  }

  console.log("Seeding traces...")
  // Seed 500+ Request Traces
  const strategies = ["latency", "round_robin", "cost", "manual"]
  
  for (let i = 0; i < 550; i++) {
    const server = servers[Math.floor(Math.random() * servers.length)]
    const tools = JSON.parse(server.tools)
    const toolName = tools[Math.floor(Math.random() * tools.length)]
    
    // Randomize time over last 7 days
    const createdAt = subMinutes(new Date(), Math.floor(Math.random() * 7 * 24 * 60))
    
    // Determine status and latency based on server
    let status = "success"
    let latencyMs = 150
    let rand = Math.random()
    
    if (server.id === hotelHub.id) {
      latencyMs = Math.floor(100 + Math.random() * 200)
      if (rand > 0.95) status = "error"
    } else if (server.id === skyRoute.id) {
      latencyMs = Math.floor(150 + Math.random() * 250)
      if (rand > 0.92) status = "error"
      if (rand > 0.97) { status = "timeout"; latencyMs = 2000 }
    } else {
      latencyMs = Math.floor(200 + Math.random() * 300)
      if (rand > 0.97) status = "error"
    }

    // Strategy distribution: 60% latency, 20% round_robin, 10% cost, 10% manual
    let routedVia = "latency"
    const stratRand = Math.random()
    if (stratRand > 0.6 && stratRand <= 0.8) routedVia = "round_robin"
    else if (stratRand > 0.8 && stratRand <= 0.9) routedVia = "cost"
    else if (stratRand > 0.9) routedVia = "manual"

    await prisma.requestTrace.create({
      data: {
        serverId: server.id,
        toolName,
        input: JSON.stringify({ query: "Test payload", timestamp: createdAt.toISOString() }),
        output: status === "success" ? JSON.stringify({ result: "ok", data: [] }) : JSON.stringify({ error: "Service unavailable" }),
        status,
        latencyMs,
        routedVia,
        agentSession: "sess_" + Math.random().toString(36).substring(7),
        createdAt,
        errorMessage: status !== "success" ? "Simulated error/timeout" : null
      }
    })
  }

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
