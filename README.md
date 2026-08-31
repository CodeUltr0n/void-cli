<div align="center">

# Void International

### The Infrastructure Layer for Model Context Protocol (MCP)

[![License: MIT](https://img.shields.io/badge/License-MIT-C9A84C?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Architecture](https://img.shields.io/badge/Architecture-MCP_Mesh-C9A84C?style=for-the-badge)](https://modelcontextprotocol.io)

**Intelligent multi-cluster routing, real-time telemetry, and operational infrastructure for autonomous AI agent tool execution.**

[Live Control Plane](https://void-cli.vercel.app) • [Product Overview](https://void-alpha-umber.vercel.app) • [GitHub Repository](https://github.com/void-international/void)

</div>

---

## Why Void?

The Model Context Protocol (MCP) has rapidly emerged as the open standard for connecting language models to external tools, databases, and APIs. As enterprises move from conversational prototypes to production autonomous agents that execute real-world operations—such as inventory reservation, flight scheduling, database queries, and transaction processing—the volume and criticality of tool invocations expand exponentially.

However, the current agent ecosystem lacks operational infrastructure. Today, developers manually configure brittle, static connections between agents and tool servers. Tool invocations fail without distributed tracing, latencies fluctuate across regions without intelligent load balancing, and organizations lack centralized visibility into execution health and cost metrics.

Existing infrastructure solutions fall short because they are protocol-agnostic. Traditional API gateways and reverse proxies understand generic HTTP and TCP traffic, but they cannot parse MCP semantics: semantic tool schemas, function call argument payloads, multi-turn agent execution loops, or token usage costs. Conversely, agent frameworks provide orchestration abstractions for prompts and memory, but leave the underlying server topology, routing policies, and reliability engineering entirely unmanaged.

**Void provides the missing operational and routing layer for MCP.** Sitting between AI agents and distributed tool clusters, Void dynamically routes tool calls based on live performance metrics, records immutable execution traces, and offers complete telemetry to ensure mission-critical agent workflows execute reliably.

---

## Core Features

### 1. Multi-Cluster MCP Server Registry
- **Centralized Mesh Inventory**: Register, categorize, and inspect distributed MCP tool server clusters across geographical regions.
- **Automated Health Tracking**: Continuous status classification (*Active*, *Degraded*, *Offline*) based on heartbeat responses and error thresholds.
- **Tool Schema Reflection**: Inspect exposed function signatures, parameter schemas, and cost-per-request configurations for each node.
- **Cluster Diagnostics**: Detailed telemetry views with latency distribution graphs (p50, p95, p99) and cluster-specific trace histories.

[screenshot: MCP Server Registry table displaying cluster health, region, exposed tools count, and status badges]

### 2. Intelligent Routing Engine
- **Multi-Factor Decision Matrix**: Dynamically evaluate candidate clusters using four configurable strategies: *Latency-based*, *Cost-based*, *Error Rate-based*, and *Smart Weighted* scoring.
- **Interactive Routing Visualizer**: Live visual topology graph illustrating the dynamic request path from client agent through the router engine to the winning cluster.
- **Transparent Scoring Breakdown**: Full visibility into candidate evaluation scores, normalization math, and decision rationales.

[screenshot: Interactive Routing Visualizer showing animated request flow and scoring breakdown]

### 3. AI Agent Chat Sandbox
- **Natural Language Tool Orchestration**: Test end-to-end agent dialogue and automated tool invocation against registered MCP mesh clusters.
- **Autonomous Tool Selection**: The agent identifies required functions from natural language instructions, generates structured parameter arguments, and dispatches them via Void.
- **Live Trace Stream**: Real-time execution cards display alongside conversation messages, showcasing latency, winning server attribution, and input/output payloads.

[screenshot: Agent Playground showing split-screen conversation and live execution trace cards]

### 4. Request Trace Audit Stream
- **Comprehensive Execution History**: Chronological, immutable audit logging of every tool call dispatched across the network.
- **Granular Multi-Filter**: Filter traces by execution status (*Success*, *Error*), target server cluster, or specific tool function.
- **Deep Payload Inspection**: Expandable trace rows displaying complete JSON input arguments, response payloads, duration measurements, and timestamp metadata.

[screenshot: Request Traces audit view with expanded JSON payload inspection drawer]

### 5. Embedded Developer CLI (`void-cli`)
- **In-Browser Terminal Emulation**: Integrated xterm.js-powered terminal accessible via keyboard shortcut (`` ` ``), header button, or sidebar.
- **Operational Command Suite**: Execute commands including `void status`, `void server list`, `void server inspect`, `void route test`, and `void deploy`.
- **Keyboard-Driven Workflow**: Fast navigation, command autocompletion, and formatted tabular outputs.

[screenshot: Embedded CLI drawer open with server inspection output]

### 6. Executive Telemetry Dashboard
- **High-Level KPI Metrics**: Immediate overview of active clusters, 24-hour request volumetrics, aggregate p95 response times, and overall mesh availability.
- **Time-Series Telemetry Visualizations**: Real-time charts tracking latency percentiles and error rates across rolling operational windows.
- **Recent Invocations Stream**: Real-time audit feed capturing recent tool dispatches with live latency metrics.

[screenshot: Executive Dashboard overview showing metric cards and time-series telemetry charts]

### 7. System Architecture Blueprint
- **Interactive Topology Map**: Visual blueprint mapping the 6 infrastructure layers spanning client connectivity down to execution sandboxes.
- **Layered Technical Specifications**: In-depth explanations of data plane proxying, multi-factor scoring algorithms, and governance guardrails.

[screenshot: System Architecture page mapping the 6-layer infrastructure stack]

---

## Architecture

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    AI Agent / Client                        │
  │        (LangChain, LLaMA, OpenAI, Anthropic, Custom)        │
  └──────────────────────────────┬──────────────────────────────┘
                                 │  MCP Request / Tool Call
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    VOID CONTROL PLANE                       │
  │                                                             │
  │   ┌───────────────────────────┐ ┌───────────────────────┐   │
  │   │  Intelligent Router       │ │  MCP Server Registry  │   │
  │   │  (Multi-Factor Scoring)   │ │  (Health & Schemas)   │   │
  │   └─────────────┬─────────────┘ └───────────────────────┘   │
  │                 │                                           │
  │   ┌─────────────▼─────────────┐ ┌───────────────────────┐   │
  │   │  Execution Trace Logger   │ │  Telemetry Analytics  │   │
  │   │  (Audit Streams & Logs)   │ │  (p50/p95/p99 Metrics)│   │
  │   └───────────────────────────┘ └───────────────────────┘   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │ Dispatched    │ Tool          │ Invocations
                 ▼               ▼               ▼
         ┌───────────────┐┌───────────────┐┌───────────────┐
         │  MCP Cluster  ││  MCP Cluster  ││  MCP Cluster  │
         │   (Region A)  ││   (Region B)  ││   (Region C)  │
         │  [HotelHub]   ││  [SkyRoute]   ││  [BookEase]   │
         └───────────────┘└───────────────┘└───────────────┘
```

### Data Flow Overview
1. **Agent Tool Invocation**: An AI agent issues a structured tool call conforming to the Model Context Protocol.
2. **Dynamic Evaluation & Routing**: Void's routing engine identifies all healthy clusters exposing the required tool schema, normalizes operational metrics, and dispatches the payload to the highest-scoring node.
3. **Trace & Telemetry Ingestion**: The execution output, duration, and status are captured in real-time, feeding both the immutable trace audit stream and time-series performance dashboards.

### The 6-Layer Stack

| Layer | Component | Core Responsibilities |
|:---|:---|:---|
| **01** | **Client / Agent Layer** | Integration surface for LLM runtimes, agent frameworks, and application frontends via MCP interfaces. |
| **02** | **Data Plane Proxy** | High-throughput routing proxy, connection pooling, and payload validation. |
| **03** | **Router Engine** | 6-layer scoring engine evaluating latency percentiles, compute cost, and server availability. |
| **04** | **Execution Mesh** | Distributed target clusters hosting domain-specific MCP tool endpoints. |
| **05** | **Enterprise Guardrails** | Authentication, rate limiting, token access controls, and policy sandboxing. |
| **06** | **Real-Time Observability**| Streaming telemetry, p50/p95/p99 latency tracking, and execution audit logging. |

---

## Routing Engine Deep-Dive

Void’s routing engine replaces static endpoint bindings with dynamic, multi-factor load dispatching.

### Routing Strategies

- **Latency-based**: Routes traffic to the cluster exhibiting the lowest rolling p95 latency for the requested tool.
- **Cost-based**: Prioritizes clusters with the lowest cost-per-request while verifying minimum latency threshold constraints.
- **Error Rate-based**: Prioritizes nodes with the lowest recent error rate percentage over rolling windows.
- **Smart Weighted**: Composite scoring model evaluating weighted parameters:
  $$\text{Score} = (\text{Latency Score} \times 0.40) + (\text{Error Rate Score} \times 0.40) + (\text{Cost Score} \times 0.20)$$

### Scoring Pipeline
1. **Candidate Discovery**: Identify all active server nodes registered in the mesh that expose the requested tool signature.
2. **Metric Extraction**: Retrieve current operational metrics (p50/p95 latencies, rolling error rates, cost-per-request, health status).
3. **Normalization**: Normalize disparate units (milliseconds, percentages, dollar costs) to a unified $0.0 - 1.0$ efficiency scale.
4. **Strategy Weighting**: Apply strategy-specific weighting vectors to compute composite cluster scores.
5. **Dispatch & Logging**: Route the execution payload to the highest-scoring node and log the full decision matrix for auditing.

---

## Tech Stack

| Layer | Technology | Function |
|:---|:---|:---|
| **Framework** | Next.js (App Router) | High-performance full-stack web framework and API routes |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety and structured data contracts |
| **Styling & UI** | Tailwind CSS + shadcn/ui | Dark-mode design system with accessible component primitives |
| **Visualizations** | Recharts | Interactive time-series performance graphs and telemetry charts |
| **Terminal** | xterm.js | In-browser command-line interface emulation |
| **Agent Layer** | LLM Function Calling | Structured tool identification and parameter extraction |
| **Runtime** | Serverless Edge Architecture | Distributed low-latency execution and API handling |

---

## Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/void-international/void.git
cd void

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local development)
cp .env.example .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the control plane.

### Environment Variables

| Variable | Description |
|:---|:---|
| `PORT` | Local web server port (Default: `3000`) |
| `NODE_ENV` | Application environment mode (`development` / `production`) |

---

## Project Structure

```
.
├── src/
│   ├── app/                 # Next.js App Router pages, layouts, and API routes
│   │   ├── agent/           # AI Agent interactive chat playground
│   │   ├── api/             # Backend API routes for routing, telemetry, and servers
│   │   ├── architecture/    # Interactive system architecture blueprint
│   │   ├── routing/         # Intelligent routing engine visualizer and testbed
│   │   ├── servers/         # MCP server registry and deep inspection pages
│   │   ├── traces/          # Request trace audit stream
│   │   └── page.tsx         # Executive dashboard overview
│   ├── components/          # Reusable UI component library and layouts
│   │   ├── layout/          # Header, collapsible sidebar, and breadcrumbs
│   │   ├── terminal/        # xterm.js terminal integration and command parser
│   │   └── ui/              # Base UI design system components
│   └── lib/                 # Core domain logic, routing algorithms, and data stores
│       ├── mcp/             # MCP routing engine, scoring formulas, and mock nodes
│       └── store.ts         # Centralized registry and telemetry state management
├── public/                  # Static assets, branding logos, and icons
├── void-cli/                # Standalone CLI package distribution
├── OPERATIONS_GUIDE.md      # Technical operational runbook
├── USER_MANUAL.md           # Non-technical end-user manual
└── README.md                # Project documentation
```

---

## CLI Reference

The Void CLI allows operators to inspect and manage the MCP mesh directly from any terminal.

### Usage via npx
```bash
npx @void/cli <command>
```

### Core Commands

| Command | Description |
|:---|:---|
| `void status` | Displays aggregate mesh health, active node counts, and average latency. |
| `void server list` | Lists all registered MCP servers, health statuses, and tool counts. |
| `void server inspect <name>` | Fetches detailed cluster metrics, p50/p95/p99 latency, and recent traces. |
| `void route test --tool <name>` | Simulates a routing evaluation for a specific tool and outputs winning scores. |
| `void trace <trace-id>` | Inspects the input arguments and response payload of a specific trace. |
| `void deploy --server <name>` | Registers and provisions a new MCP server endpoint into the mesh. |
| `help` | Prints complete command usage instructions. |

#### Example: Checking Mesh Status
```bash
$ void status

System Status:
Servers:     3 Healthy | 1 Degraded | 0 Down
Requests:    520 (last 24h)
Avg Latency: 142ms (p95)
Mesh Health: 99.8% Available
```

#### Example: Simulating a Routing Test
```bash
$ void route test --tool search_hotels --query '{"destination":"Goa"}'

Routing Test Result for tool 'search_hotels':
Winner: HotelHub Pro
Reason: Lowest p95 latency (130ms)

Scores:
- HotelHub Pro    : 772 pts (Lowest p95 latency)
- BookEase Hub    : 598 pts (Active fallback)
- SkyRoute API    : 312 pts (Degraded latency)
```

---

## Roadmap

### Phase 1: Core Control Plane *(Current)*
- Executive monitoring dashboard with real-time telemetry visualizations
- 6-layer intelligent routing engine with interactive visualizer
- Natural language agent playground with real-time tool execution routing
- Searchable request trace audit stream with deep payload inspection
- In-browser and standalone CLI tool suite (`void-cli`)

### Phase 2: Native Protocol Transports
- Native SSE (Server-Sent Events) and stdio MCP transport adapters
- Persistent distributed telemetry database integration
- Automated health check probes and cluster failover triggers

### Phase 3: Enterprise Workspaces & Governance
- Multi-tenant organization accounts with Role-Based Access Control (RBAC)
- Fine-grained API key provisioning and per-tool authorization policies
- Cryptographic request signing and tamper-evident audit logs

### Phase 4: Mesh Ecosystem & Extensibility
- MCP Server Registry marketplace for public and private tool discovery
- Out-of-the-box webhooks and alerting integrations (PagerDuty, Slack, Datadog)
- Native Python and TypeScript SDKs for agent runtime integration

---

## Contributing

We welcome contributions from the developer community. To contribute:

1. **Fork the repository** to your personal GitHub account.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/improved-routing-algorithm
   ```
3. **Commit your changes** following clear commit message conventions:
   ```bash
   git commit -m "feat(router): add geographic proximity scoring weight"
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/improved-routing-algorithm
   ```
5. **Open a Pull Request** against the `main` branch with a comprehensive description of changes.

Please ensure your code passes type checking (`npx tsc --noEmit`) and conforms to the project's code quality standards.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
Copyright (c) Void International
```

---

## Contact & Support

- **Email**: [hello@voidinternational.dev](mailto:hello@voidinternational.dev)
- **GitHub Issues**: [Open an issue](https://github.com/void-international/void/issues) for bug reports and feature requests.
- **Documentation**: Refer to the [Operations Guide](OPERATIONS_GUIDE.md) and [User Manual](USER_MANUAL.md) for detailed workflows.

---

<div align="center">

**Void International** • *Building the infrastructure layer for the Model Context Protocol.*

</div>
