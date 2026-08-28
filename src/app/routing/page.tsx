"use client"

import { useState } from "react"
import { GitBranch, Play, Server, Zap, Globe, Cpu, CheckCircle2, ArrowDown, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RoutingPage() {
  const [strategy, setStrategy] = useState("latency")
  const [toolName, setToolName] = useState("search_hotels")
  const [query, setQuery] = useState('{"destination":"Goa"}')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/routing/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, query, strategy })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      alert("Routing test failed")
    }
    setLoading(false)
  }

  const winnerId = result?.decision?.server?.id

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Routing Engine</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-void-gold bg-void-gold/10 px-2 py-0.5 rounded border border-void-gold/20">
              6-Layer Scoring
            </span>
          </div>
          <p className="text-xs text-void-muted mt-1">
            Simulate and inspect intelligent multi-cluster routing decisions with real-time scoring telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="card-void-glow overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-void-gold/5 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-white font-display text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-void-gold" />
                Live Topology & Mesh Dispatch
              </CardTitle>
              {result && (
                <span className="text-[10px] font-mono text-void-success bg-void-success/10 px-2 py-0.5 rounded border border-void-success/20 animate-pulse">
                  Route Evaluated
                </span>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-6">
                {/* Agent Request Box */}
                <div className="w-72 bg-[#09090e]/90 border border-white/[0.1] rounded-xl p-4 text-center shadow-xl relative z-10 transition-all duration-300 hover:border-white/[0.2]">
                  <div className="flex justify-center mb-1.5">
                    <div className="h-7 w-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-void-muted">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="font-semibold text-white text-xs tracking-wide">AI Agent Request</div>
                  <div className="text-[11px] text-void-gold font-mono mt-0.5 bg-void-gold/10 px-2 py-0.5 rounded inline-block">
                    {toolName}()
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="h-10 w-px bg-white/[0.1] my-1 relative">
                  <div className={`absolute top-0 left-0 w-px h-full ${result ? 'bg-void-gold animate-pulse shadow-[0_0_8px_#C9A84C]' : 'bg-transparent'}`}></div>
                </div>

                {/* Void Router Core Box */}
                <div className={`w-80 bg-[#07070c] border rounded-2xl p-5 text-center shadow-2xl relative z-10 transition-all duration-500 ${result ? 'border-void-gold shadow-[0_0_30px_rgba(201,168,76,0.15)] ring-1 ring-void-gold/30' : 'border-white/[0.1]'}`}>
                  <div className="flex justify-center mb-2">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${result ? 'bg-void-gold text-black shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'bg-white/[0.05] text-void-gold'}`}>
                      <GitBranch className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="font-display font-bold text-white text-base tracking-tight">Void Router Engine</div>
                  <div className="text-[10px] text-void-muted font-mono uppercase tracking-wider mt-1">
                    Strategy: <span className="text-void-gold font-semibold">{strategy}</span>
                  </div>
                </div>

                {/* Branching Lines */}
                <div className="flex justify-center w-full max-w-md mt-2 relative h-10">
                  <div className="absolute top-0 w-3/4 border-t border-white/[0.08]"></div>
                  <div className="absolute top-0 left-[12.5%] h-10 w-px border-l border-white/[0.08]"></div>
                  <div className="absolute top-0 left-[50%] h-10 w-px border-l border-white/[0.08]"></div>
                  <div className="absolute top-0 left-[87.5%] h-10 w-px border-l border-white/[0.08]"></div>
                </div>

                {/* 3 Target Servers */}
                <div className="flex justify-between w-full max-w-md gap-3 relative z-10">
                  {['HotelHub Pro', 'SkyRoute', 'BookEase'].map((name, i) => {
                    const isWinner = result?.decision?.server?.name === name
                    return (
                      <div 
                        key={name} 
                        className={`flex-1 bg-[#09090e]/90 border rounded-xl p-3.5 text-center transition-all duration-300 ${
                          isWinner 
                            ? 'border-void-success bg-void-success/[0.04] shadow-[0_0_20px_rgba(74,222,128,0.2)] scale-105 ring-1 ring-void-success/30' 
                            : 'border-white/[0.06] opacity-60'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">
                          <Server className={`h-4 w-4 ${isWinner ? 'text-void-success drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'text-void-muted'}`} />
                        </div>
                        <div className="font-semibold text-white text-xs truncate">{name}</div>
                        <div className="flex items-center justify-center gap-1.5 mt-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-void-warning' : 'bg-void-success'}`}></div>
                          <span className="text-[10px] font-mono text-void-muted capitalize">{i === 1 ? 'Degraded' : 'Active'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Arrow to Response */}
                {result && (
                  <>
                    <div className="h-10 w-px bg-void-success my-1 relative animate-pulse shadow-[0_0_8px_#4ade80]"></div>
                    <div className="w-72 bg-[#09090e]/90 border border-void-success/40 rounded-xl p-3.5 text-center shadow-[0_0_25px_rgba(74,222,128,0.15)] relative z-10 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-void-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Response Delivered
                      </div>
                      <div className="text-[11px] text-white font-mono mt-1">
                        Execution Latency: <span className="text-void-gold font-bold">{result.execution.latencyMs}ms</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="card-void overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-4">
              <CardTitle className="text-white font-display text-sm font-semibold">Routing Policy & Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-void-muted mb-2.5 block">Routing Algorithm</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'latency', label: 'Latency-based', desc: 'Routes to fastest p95 node' },
                    { id: 'cost', label: 'Cost-based', desc: 'Minimizes tool compute cost' },
                    { id: 'round_robin', label: 'Round-robin', desc: 'Uniform load distribution' },
                    { id: 'manual', label: 'Manual Priority', desc: 'Custom priority rules' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStrategy(s.id)}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                        strategy === s.id 
                          ? 'border-void-gold bg-void-gold/10 shadow-[0_0_12px_rgba(201,168,76,0.15)]' 
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className={`text-xs font-semibold ${strategy === s.id ? 'text-void-gold' : 'text-white'}`}>{s.label}</div>
                      <div className="text-[10px] text-void-muted mt-0.5 leading-tight">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-void-muted">Tool Function Target</label>
                  <select 
                    value={toolName} 
                    onChange={e => setToolName(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-white/[0.08] bg-[#07070b] px-3 py-1.5 text-xs text-white mt-1.5 outline-none focus:border-void-gold transition-colors font-mono"
                  >
                    <option value="search_hotels">search_hotels</option>
                    <option value="search_flights">search_flights</option>
                    <option value="create_booking">create_booking</option>
                    <option value="get_hotel_details">get_hotel_details</option>
                    <option value="unknown_tool">unknown_tool (Triggers Failover)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-void-muted">Payload Arguments</label>
                  <Input 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="bg-[#07070b] border-white/[0.08] text-white font-mono text-xs mt-1.5 h-9 focus:border-void-gold"
                  />
                </div>

                <Button 
                  onClick={handleTest} 
                  disabled={loading}
                  className="w-full bg-void-gold text-black hover:bg-[#d6b75a] font-medium text-xs h-9 transition-all duration-200 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-black" />
                  {loading ? 'Evaluating Scores...' : 'Dispatch Test Route'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Evaluation Box */}
          {result && (
            <Card className="card-void-glow border-void-success/40 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader className="bg-void-success/[0.04] border-b border-void-success/20 py-3.5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-void-success flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    Selected: {result.decision.server.name}
                  </CardTitle>
                  <span className="text-[10px] font-mono text-void-success bg-void-success/10 px-2 py-0.5 rounded border border-void-success/20">
                    Highest Score
                  </span>
                </div>
                <p className="text-[11px] text-void-muted mt-1 font-mono">{result.decision.reason}</p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-void-muted block mb-2">Evaluated Cluster Scores</span>
                  <div className="space-y-1.5">
                    {result.decision.allScores.map((score: any) => (
                      <div 
                        key={score.serverName} 
                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono border ${
                          score.serverName === result.decision.server.name 
                            ? 'bg-void-gold/[0.06] border-void-gold/30 text-void-gold' 
                            : 'bg-white/[0.02] border-white/[0.04] text-void-muted'
                        }`}
                      >
                        <span className="font-semibold">{score.serverName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] opacity-75 truncate max-w-[120px]">{score.reason}</span>
                          <span className="bg-white/[0.06] px-1.5 py-0.5 rounded font-bold">{score.score.toFixed(0)} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
