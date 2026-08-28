import Image from "next/image"
import { Boxes, Server, Shield, Activity, Zap, Database, CheckCircle2, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ArchitecturePage() {
  const layers = [
    {
      num: "01",
      title: "Control Plane",
      tech: "Python / FastAPI + PostgreSQL",
      desc: "Handles orchestration state, database connections, and metadata governance across multi-tenant agent fleets.",
      icon: Database,
      implemented: false
    },
    {
      num: "02",
      title: "Data Plane",
      tech: "Node.js / TypeScript + Redis",
      desc: "Delivers sub-10ms request routing, token caching, and high-frequency state synchronization for MCP payloads.",
      icon: Zap,
      implemented: true
    },
    {
      num: "03",
      title: "MCP Runtime Sandbox",
      tech: "AWS ECS Fargate + Docker",
      desc: "Isolated container execution ensuring zero-trust multi-tenant isolation and automated cluster lifecycle management.",
      icon: Server,
      implemented: false
    },
    {
      num: "04",
      title: "6-Layer Scoring Engine",
      tech: "TypeScript Routing Engine",
      desc: "Intelligent router evaluating cluster health, historical p95 latency percentiles, and semantic tool relevance.",
      icon: Boxes,
      implemented: true
    },
    {
      num: "05",
      title: "Enterprise Guardrails",
      tech: "Kong API Gateway",
      desc: "SOC2-ready security with fine-grained API key scoping, rate limiting, and auditable cryptographic traces.",
      icon: Shield,
      implemented: false
    },
    {
      num: "06",
      title: "Real-Time Observability",
      tech: "OpenTelemetry + Recharts",
      desc: "Live streaming request volumetrics, error rate percentiles, and latency metrics directly to the operator dashboard.",
      icon: Activity,
      implemented: true
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4 relative">
        <div className="flex justify-center mb-3">
          <div className="relative h-16 w-16 rounded-2xl bg-black/50 border border-white/[0.1] flex items-center justify-center shadow-[0_0_25px_rgba(201,168,76,0.25)]">
            <Image 
              src="/void-logo.png" 
              alt="Void Logo" 
              width={56} 
              height={56} 
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              className="object-contain drop-shadow-[0_0_10px_rgba(201,168,76,0.6)]" 
            />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-gold/10 border border-void-gold/20 text-void-gold text-xs font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-void-gold animate-pulse" />
          SYSTEM TOPOLOGY
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Void Architecture
        </h1>
        <p className="text-xs sm:text-sm text-void-muted leading-relaxed">
          Void is engineered as a high-performance, fault-tolerant infrastructure layer connecting autonomous AI agents to Model Context Protocol servers globally.
        </p>
      </div>

      {/* Layer Stack Diagram */}
      <div className="relative pt-4">
        {/* Vertical Center Spine */}
        <div className="absolute top-8 bottom-8 left-8 sm:left-12 w-px bg-gradient-to-b from-void-gold/40 via-white/[0.08] to-transparent z-0 hidden md:block" />
        
        <div className="space-y-4 relative z-10">
          {layers.map((layer, index) => (
            <div 
              key={layer.num} 
              className={`rounded-2xl border transition-all duration-300 ${
                layer.implemented 
                  ? 'card-void-glow bg-[#08090f]/90 border-void-gold/30 shadow-[0_0_20px_rgba(201,168,76,0.06)]' 
                  : 'card-void bg-[#050508]/60 opacity-60'
              } p-5 sm:p-6`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Number Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`text-2xl sm:text-3xl font-mono font-bold ${layer.implemented ? 'text-void-gold' : 'text-void-muted/40'}`}>
                    {layer.num}
                  </div>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    layer.implemented 
                      ? 'bg-void-gold/10 border-void-gold/30 text-void-gold shadow-[0_0_12px_rgba(201,168,76,0.2)]' 
                      : 'bg-white/[0.03] border-white/[0.06] text-void-muted'
                  }`}>
                    <layer.icon className="h-5 w-5" />
                  </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-semibold text-white tracking-wide">{layer.title}</h3>
                    {layer.implemented ? (
                      <span className="inline-flex items-center gap-1 bg-void-success/10 text-void-success text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-void-success/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Live in MVP
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-void-muted bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                        Planned Phase
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-void-gold/90 mt-1 mb-1.5">{layer.tech}</div>
                  <p className="text-xs text-void-muted leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Capabilities Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-void-gold" />
            Sub-10ms Latency
          </div>
          <p className="text-[11px] text-void-muted">Ultra-fast protocol proxying with intelligent connection pooling.</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5 text-void-gold" />
            6-Layer Routing
          </div>
          <p className="text-[11px] text-void-muted">Multi-strategy scoring engine optimizing for cost, latency, and SLA.</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-void-gold" />
            SOC2 Compliance
          </div>
          <p className="text-[11px] text-void-muted">Auditable cryptographic traces and policy-driven sandbox isolation.</p>
        </div>
      </div>
    </div>
  )
}
