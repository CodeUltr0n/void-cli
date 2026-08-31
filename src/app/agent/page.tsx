"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Bot, Send, User, ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, Activity, Server, Sparkles, Terminal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const QUICK_PROMPTS = [
  "Find me 5-star hotels in Goa for 2 people under ₹20,000",
  "Search flights from DEL to BOM for tomorrow",
  "Check seat availability and create booking for Mumbai"
]

export default function AgentPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [traces, setTraces] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, traces])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMsg = { role: "user", content: textToSend }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setTraces([])

    try {
      const chatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      })
      
      const data = await res.json()
      
      if (!res.ok || data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error || "Failed to connect to agent"}` }])
        setLoading(false)
        return
      }
      
      if (data.type === 'tool_calls') {
        if (data.demoMode) {
          for (let i = 0; i < data.traces.length; i++) {
            await new Promise(r => setTimeout(r, 600))
            setTraces(prev => [...prev, data.traces[i]])
          }
          
          await new Promise(r => setTimeout(r, 800))
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: "I've searched for flights and hotels based on your request. I found verified inventory on SkyRoute and HotelHub Pro. Would you like me to book them?" 
          }])
        } else {
          data.traces.forEach((t: any, i: number) => {
            setTimeout(() => {
              setTraces(prev => [...prev, t])
            }, i * 300)
          })
          
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: data.finalReply || `Successfully executed ${data.traces.length} tool calls through Void MCP.`
            }])
          }, data.traces.length * 300 + 400)
        }
      } else {
        setMessages(prev => [...prev, data.message])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to connect to the agent." }])
    }
    
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-[calc(100vh-125px)] flex flex-col pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Agent Playground</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-void-gold bg-void-gold/10 px-2 py-0.5 rounded border border-void-gold/20">
              Interactive Runtime
            </span>
          </div>
          <p className="text-xs text-void-muted mt-0.5">
            Interact with AI agents and observe real-time tool execution routing across your MCP mesh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-void-muted bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-void-success animate-pulse" />
            LLaMA / Qwen + Void Engine
          </span>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Chat Panel (6 cols) */}
        <Card className="card-void-glow lg:col-span-6 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-3 px-4 flex flex-row items-center justify-between shrink-0">
            <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-void-gold" />
              Agent Dialogue
            </CardTitle>
            <span className="text-[10px] font-mono text-void-muted">Session Active</span>
          </CardHeader>

          {/* Messages Scroll Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                <div className="relative h-14 w-14 rounded-2xl bg-black/40 border border-white/[0.1] flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                  <Image 
                    src="/void-logo.png" 
                    alt="Void Logo" 
                    width={48} 
                    height={48} 
                    priority
                    loading="eager"
                    style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                    className="object-contain drop-shadow-[0_0_10px_rgba(201,168,76,0.6)]" 
                  />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-semibold text-white">Ask the Void Agent</h3>
                  <p className="text-xs text-void-muted">
                    Test how external MCP tools are selected and executed in real-time.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="w-full space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-void-muted block text-left px-1">Suggested Scenarios:</span>
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left text-xs font-mono text-void-body bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-void-gold/40 p-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="truncate">{prompt}</span>
                      <Sparkles className="h-3 w-3 text-void-muted group-hover:text-void-gold shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono ${
                  msg.role === 'user' 
                    ? 'bg-white/[0.08] text-white border border-white/[0.12]' 
                    : 'bg-void-gold/10 text-void-gold border border-void-gold/30 shadow-[0_0_10px_rgba(201,168,76,0.2)]'
                }`}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : (
                    <Image src="/void-logo.png" alt="Void" width={18} height={18} style={{ width: 'auto', height: 'auto' }} className="object-contain" />
                  )}
                </div>
                <div className={`px-3.5 py-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white/[0.06] border border-white/[0.1] text-white' 
                    : 'bg-[#09090e] border border-void-gold/20 text-void-body shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                }`}>
                  {msg.content || (msg.tool_calls ? "Executing requested tools via Void MCP..." : "")}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 animate-in fade-in duration-200">
                <div className="h-7 w-7 rounded-lg bg-void-gold/10 border border-void-gold/30 flex items-center justify-center text-void-gold shrink-0">
                  <Image src="/void-logo.png" alt="Void" width={18} height={18} style={{ width: 'auto', height: 'auto' }} className="object-contain animate-spin" />
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-[#09090e] border border-white/[0.08] text-void-muted text-xs flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-void-gold animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-void-gold animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-void-gold animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="font-mono text-[11px]">Evaluating MCP route...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Prompt Input Form */}
          <div className="p-3 border-t border-white/[0.06] bg-[#050508]/80 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Ask travel assistant (e.g. Find hotels in Goa)..."
                className="bg-[#08080d] border-white/[0.08] focus:border-void-gold text-white text-xs h-9 font-mono"
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()} 
                className="bg-void-gold text-black hover:bg-[#d6b75a] h-9 px-3 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Live Trace Stream Panel (6 cols) */}
        <Card className="card-void-glow lg:col-span-6 flex flex-col min-h-0 bg-[#06060a] overflow-hidden">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.01] py-3 px-4 flex flex-row items-center justify-between shrink-0">
            <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-void-gold" />
              Live MCP Tool Telemetry
            </CardTitle>
            <span className="text-[10px] font-mono text-void-gold bg-void-gold/10 px-2 py-0.5 rounded border border-void-gold/20">
              Sub-second Engine
            </span>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {traces.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-void-muted text-xs text-center px-8 space-y-2 font-mono">
                <Terminal className="h-8 w-8 text-void-muted/40" />
                <p>Waiting for agent tool invocation...</p>
                <p className="text-[11px] text-void-muted/60">
                  Every tool call made by the LLM is captured, routed, and displayed here.
                </p>
              </div>
            )}

            {traces.map((trace, index) => (
              <div key={index} className="border border-white/[0.08] rounded-xl bg-[#08090e]/90 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 transition-all hover:border-void-gold/30">
                <button 
                  className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                >
                  <div className="flex items-center gap-2.5">
                    {trace.status === 'success' ? 
                      <CheckCircle2 className="h-4 w-4 text-void-success shrink-0" /> : 
                      <XCircle className="h-4 w-4 text-void-error shrink-0" />
                    }
                    <span className="font-mono text-xs font-semibold text-white">{trace.toolName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-void-muted font-mono text-[11px] flex items-center gap-1">
                      <Server className="h-3 w-3 text-void-gold" />
                      {trace.serverName}
                    </span>
                    <span className="text-void-gold font-mono text-[11px] bg-void-gold/10 px-1.5 py-0.5 rounded border border-void-gold/20 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {trace.latencyMs}ms
                    </span>
                    {expandedTrace === trace.id ? <ChevronDown className="h-3.5 w-3.5 text-void-muted" /> : <ChevronRight className="h-3.5 w-3.5 text-void-muted" />}
                  </div>
                </button>
                
                {expandedTrace === trace.id && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-white/[0.06] bg-[#050509]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-void-muted font-semibold mb-1">Input Payload</div>
                        <pre className="text-[11px] font-mono text-[#93c5fd] bg-[#07070b] p-2.5 rounded-lg border border-white/[0.06] overflow-x-auto max-h-36">
                          {JSON.stringify(trace.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-void-muted font-semibold mb-1">Response Payload</div>
                        <pre className={`text-[11px] font-mono bg-[#07070b] p-2.5 rounded-lg border border-white/[0.06] overflow-x-auto max-h-36 ${trace.status === 'success' ? 'text-[#86efac]' : 'text-[#fca5a5]'}`}>
                          {JSON.stringify(trace.output || trace.errorMessage, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
