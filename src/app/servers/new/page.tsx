"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Server, ArrowLeft } from "lucide-react"

export default function NewServerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "mcp",
    endpointUrl: "",
    tools: '["custom_tool_1"]',
    config: '{\n  "cost_per_request": 0.1,\n  "max_concurrent": 50\n}'
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate JSON
      JSON.parse(formData.tools)
      JSON.parse(formData.config)
      
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        const data = await res.json()
        router.push(`/servers/${data.id}`)
      } else {
        alert("Failed to create server")
        setLoading(false)
      }
    } catch (err) {
      alert("Invalid JSON in Tools or Config fields")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full text-void-muted hover:text-void-body transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-display font-semibold text-void-body flex items-center gap-2">
          <Server className="h-6 w-6 text-void-gold" />
          Register MCP Server
        </h1>
      </div>

      <Card className="card-void">
        <CardHeader>
          <CardTitle className="text-lg text-void-body">Server Configuration</CardTitle>
          <CardDescription className="text-void-muted">Connect an external MCP server to the Void routing engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-void-body">Server Name</label>
                <Input 
                  name="name"
                  required
                  placeholder="e.g. SalesData API" 
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#0d1117] border-void-border focus:border-void-gold text-void-body" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-void-body">Protocol Type</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-void-border bg-[#0d1117] px-3 py-2 text-sm text-void-body focus:outline-none focus:ring-1 focus:ring-void-gold"
                >
                  <option value="mcp">Model Context Protocol (MCP)</option>
                  <option value="rest">REST API (Legacy)</option>
                  <option value="graphql">GraphQL (Legacy)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-void-body">Description</label>
              <Textarea 
                name="description"
                placeholder="What does this server do?"
                value={formData.description}
                onChange={handleChange}
                className="bg-[#0d1117] border-void-border focus:border-void-gold text-void-body resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-void-body">Endpoint URL</label>
              <Input 
                name="endpointUrl"
                required
                type="url"
                placeholder="https://api.example.com/mcp"
                value={formData.endpointUrl}
                onChange={handleChange}
                className="bg-[#0d1117] border-void-border focus:border-void-gold text-void-body font-mono text-sm" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-void-body">Exposed Tools (JSON Array)</label>
                <Textarea 
                  name="tools"
                  required
                  value={formData.tools}
                  onChange={handleChange}
                  className="bg-[#0d1117] border-void-border focus:border-void-gold text-void-body font-mono text-sm h-32"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-void-body">Routing Config (JSON)</label>
                <Textarea 
                  name="config"
                  required
                  value={formData.config}
                  onChange={handleChange}
                  className="bg-[#0d1117] border-void-border focus:border-void-gold text-void-body font-mono text-sm h-32"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-void-border">
              <Button type="button" variant="ghost" onClick={() => router.back()} className="text-void-muted hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-void-gold text-black hover:bg-yellow-500 font-medium">
                {loading ? "Simulating Connection..." : "Deploy Server"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
