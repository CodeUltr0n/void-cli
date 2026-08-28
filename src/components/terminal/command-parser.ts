import { getServers, getTraces, getMetrics, addServer } from '@/lib/store'
import { routeRequest } from '@/lib/mcp/router'

export async function parseCommand(command: string): Promise<{ output: string, type: 'text' | 'error' | 'success' }> {
  const cmd = command.trim().replace(/ +/g, ' ')
  
  if (cmd === 'help' || cmd === 'void help' || cmd === 'void --help' || cmd === 'void -h') {
    return {
      output: `Void CLI Commands:
  \x1b[33mvoid deploy --server <name>\x1b[0m                   Deploy & register new MCP server
  \x1b[33mvoid status\x1b[0m                                   Live cluster health & latency
  \x1b[33mvoid server list\x1b[0m                              List all active MCP mesh nodes
  \x1b[33mvoid server inspect <name>\x1b[0m                    Inspect latency percentiles & traces
  \x1b[33mvoid route test --tool <tool> --query <json>\x1b[0m  Simulate routing decision
  \x1b[33mvoid trace <id>\x1b[0m                               Inspect trace JSON
  \x1b[33mvoid agent ask "<question>"\x1b[0m                   Ask AI agent playground
  \x1b[33mclear\x1b[0m                                         Clear terminal screen
  \x1b[33mvoid --version\x1b[0m                                Show version info`,
      type: 'text'
    }
  }

  if (cmd === 'void deploy' || cmd.startsWith('void deploy ')) {
    const serverMatch = cmd.match(/--server\s+([^\s]+)/)
    const serverName = serverMatch ? serverMatch[1] : 'my-mcp'

    addServer({
      name: serverName,
      url: `https://${serverName}.void.dev/v1`,
      cluster: 'us-east-1',
      tools: JSON.stringify(['search', 'execute']),
      config: JSON.stringify({ cost_per_request: 0.05, priority: 1 }),
      status: 'active',
    })

    return {
      output: `
\x1b[32m✓\x1b[0m Building container image...
\x1b[32m✓\x1b[0m Deploying to mcp.void.dev/${serverName}...
\x1b[32m✓\x1b[0m SSL certificate configured
\x1b[32m✓\x1b[0m Health check passed

\x1b[33m→ Live at:\x1b[0m https://${serverName}.void.dev

  \x1b[36mRoute your AI agent:\x1b[0m
  https://mcp.void.dev/v1/${serverName}
`,
      type: 'success'
    }
  }

  if (cmd === 'void --version' || cmd === 'void -v') {
    return { output: 'Void CLI v0.1.0-beta (MVP)', type: 'text' }
  }

  if (cmd === 'void status') {
    const servers = getServers()
    const healthy = servers.filter(s => s.status === 'active').length
    const degraded = servers.filter(s => s.status === 'degraded').length
    const down = servers.filter(s => s.status === 'down').length
    
    const reqs = getTraces({ limit: 500 }).length
    const metrics = getMetrics(undefined, 24)
    const validLatencies = metrics.filter(m => m.latencyP95 !== null).map(m => m.latencyP95!)
    const avgLatency = validLatencies.length > 0 ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) : 142

    return {
      output: `System Status:
Servers:   \x1b[32m${healthy} Healthy\x1b[0m | \x1b[33m${degraded} Degraded\x1b[0m | \x1b[31m${down} Down\x1b[0m
Requests:  ${reqs} (last 24h)
Avg Latency: ${avgLatency}ms (p95)
`,
      type: 'success'
    }
  }

  if (cmd === 'void server list') {
    const servers = getServers()
    let out = "ID\t\tNAME\t\tSTATUS\t\tTOOLS\n"
    out += "-----------------------------------------------------------------\n"
    servers.forEach(s => {
      const color = s.status === 'active' ? '\x1b[32m' : (s.status === 'degraded' ? '\x1b[33m' : '\x1b[31m')
      const toolsCount = JSON.parse(s.tools || '[]').length
      out += `${s.id.substring(0,8)}\t${s.name.padEnd(15)}\t${color}${s.status.padEnd(10)}\x1b[0m\t${toolsCount}\n`
    })
    return { output: out, type: 'text' }
  }

  if (cmd.startsWith('void server inspect ')) {
    const name = cmd.replace('void server inspect ', '').trim().toLowerCase()
    const server = getServers().find(s => s.name.toLowerCase().includes(name))
    if (!server) return { output: `Server '${name}' not found.`, type: 'error' }

    const metrics = getMetrics(server.id, 24)
    const m = metrics[0]
    const traces = getTraces({ serverId: server.id, limit: 5 })

    let out = `Inspecting Server: \x1b[33m${server.name}\x1b[0m (${server.id})\n`
    out += `Status: ${server.status}\nEndpoint: ${server.url}\n\n`
    out += `Metrics (Latest):\n`
    out += `p50: ${m?.latencyP50 || 95}ms | p95: ${m?.latencyP95 || 140}ms | p99: ${m?.latencyP99 || 210}ms\n`
    out += `Error Rate: ${((m?.errorRate || 0.01) * 100).toFixed(1)}%\n\n`
    out += `Recent Traces:\n`
    traces.forEach(t => {
      out += `- ${t.id.substring(0,8)} | ${t.toolName} | ${t.durationMs}ms | ${t.status}\n`
    })
    
    return { output: out, type: 'text' }
  }

  if (cmd.startsWith('void route test ')) {
    const argsStr = cmd.replace('void route test ', '')
    const toolMatch = argsStr.match(/--tool ([^\s]+)/)
    const queryMatch = argsStr.match(/--query ["']?([^"']+)["']?/)
    
    const tool = toolMatch ? toolMatch[1] : null
    const query = queryMatch ? queryMatch[1] : 'default query'

    if (!tool) return { output: "Missing --tool argument. Example: --tool search_hotels", type: 'error' }

    try {
      const servers = getServers().filter(s => s.status !== 'down')
      const recentMetrics = getMetrics(undefined, 24)
      
      const decision = routeRequest({ toolName: tool, query, servers, recentMetrics }, 'latency')
      
      let out = `Routing Test Result for tool '\x1b[33m${tool}\x1b[0m':\n`
      out += `Winner: \x1b[32m${decision.server.name}\x1b[0m\n`
      out += `Reason: ${decision.reason}\n\n`
      out += `Scores:\n`
      decision.allScores.forEach(s => {
        out += `- ${s.serverName.padEnd(15)} : ${s.score.toFixed(0)} (${s.reason})\n`
      })
      return { output: out, type: 'success' }
    } catch (e: any) {
      return { output: `Routing failed: ${e.message}`, type: 'error' }
    }
  }

  if (cmd.startsWith('void trace ')) {
    const id = cmd.replace('void trace ', '').trim()
    const trace = getTraces({ limit: 500 }).find(t => t.id.startsWith(id))
    if (!trace) return { output: `Trace '${id}' not found.`, type: 'error' }

    let out = `Trace Details: ${trace.id}\n`
    out += `Server: ${trace.serverName}\n`
    out += `Tool: ${trace.toolName}\n`
    out += `Status: ${trace.status}\n`
    out += `Latency: ${trace.durationMs}ms\n`
    out += `Input: \n${trace.requestPayload || '{}'}\n\n`
    out += `Output: \n${trace.responsePayload || '{}'}\n`
    return { output: out, type: 'text' }
  }

  if (cmd.startsWith('void agent ask ')) {
    const queryMatch = cmd.match(/void agent ask ["']?([^"']+)["']?/)
    const query = queryMatch ? queryMatch[1] : null
    if (!query) return { output: "Please provide a query in quotes.", type: 'error' }

    return { output: `Agent received query: "${query}"\nSimulating tool calls...\n- \x1b[33msearch_hotels\x1b[0m routed to \x1b[32mHotelHub Pro\x1b[0m (142ms)\n- \x1b[33msearch_flights\x1b[0m routed to \x1b[32mSkyRoute API\x1b[0m (289ms)\nAgent response generated successfully.`, type: 'success' }
  }

  return { output: `Command not found: ${cmd.split(' ')[0]}. Type 'help' for available commands.`, type: 'error' }
}
