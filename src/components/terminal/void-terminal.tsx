"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'

export function VoidTerminal() {
  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const bufferRef = useRef('')
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)

  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(300)
  const [customWidth, setCustomWidth] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const preMaximizeState = useRef<{ height: number, width: number | null }>({ height: 300, width: null })

  const AUTOCOMPLETE_COMMANDS = [
    'help',
    'void status',
    'void server list',
    'void deploy --server my-mcp',
    'void route test --tool search_hotels',
    'void agent ask "find flights to mumbai"',
    'clear',
    'void --version'
  ]

  // Global toggle and close listener
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => {
        const next = !prev
        if (next) {
          setIsMinimized(false)
          setTimeout(() => {
            fitAddonRef.current?.fit()
            xtermRef.current?.focus()
          }, 100)
        }
        return next
      })
    }

    const handleClose = () => {
      setIsOpen(false)
    }

    window.addEventListener('toggle-terminal', handleToggle)
    window.addEventListener('close-terminal', handleClose)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
      if (e.key === '`' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        handleToggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('toggle-terminal', handleToggle)
      window.removeEventListener('close-terminal', handleClose)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Drag-to-resize handler
  const handleStartResize = useCallback((direction: 'top' | 'left' | 'corner') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsMinimized(false)
    setIsMaximized(false)

    const startX = e.clientX
    const startY = e.clientY
    const startHeight = height
    const currentContainerWidth = terminalContainerRef.current?.parentElement?.parentElement?.clientWidth || window.innerWidth - 240
    const startWidth = customWidth ?? currentContainerWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'top' || direction === 'corner') {
        const deltaY = startY - moveEvent.clientY
        const newHeight = Math.min(Math.max(startHeight + deltaY, 180), window.innerHeight * 0.85)
        setHeight(newHeight)
      }

      if (direction === 'left' || direction === 'corner') {
        const deltaX = startX - moveEvent.clientX
        const maxAvailableWidth = window.innerWidth - 64
        const newWidth = Math.min(Math.max(startWidth + deltaX, 380), maxAvailableWidth)
        setCustomWidth(newWidth >= maxAvailableWidth - 20 ? null : newWidth)
      }

      fitAddonRef.current?.fit()
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setTimeout(() => fitAddonRef.current?.fit(), 50)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [height, customWidth])

  const executeCommand = async (cmd: string) => {
    if (!xtermRef.current) return
    const term = xtermRef.current

    if (cmd) {
      historyRef.current.push(cmd)
      historyIndexRef.current = historyRef.current.length
    }

    if (cmd === 'clear') {
      term.clear()
    } else if (cmd) {
      try {
        const res = await fetch('/api/cli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd })
        })
        const data = await res.json()

        if (data.output) {
          // Normalize line breaks for xterm
          const formatted = data.output.replace(/\r?\n/g, '\r\n')
          term.writeln(formatted)
        }
      } catch (error) {
        term.writeln('\x1b[31mError executing command\x1b[0m')
      }
    }

    bufferRef.current = ''
    term.write('\x1b[32mvoid\x1b[0m@\x1b[33mmcp-infra\x1b[0m:~$ ')
    term.scrollToBottom()
  }

  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false)
      setHeight(preMaximizeState.current.height)
      setCustomWidth(preMaximizeState.current.width)
    } else {
      preMaximizeState.current = { height, width: customWidth }
      setIsMaximized(true)
      setIsMinimized(false)
      setCustomWidth(null)
      setHeight(Math.round(window.innerHeight * 0.75))
    }
    setTimeout(() => fitAddonRef.current?.fit(), 60)
  }

  // Mount xterm on component mount
  useEffect(() => {
    if (!terminalContainerRef.current) return

    // If not already instantiated
    if (!xtermRef.current) {
      const term = new XTerm({
        theme: {
          background: '#050508',
          foreground: '#f1f1f1',
          cursor: '#C9A84C',
          black: '#000000',
          red: '#ef4444',
          green: '#4ade80',
          yellow: '#f59e0b',
          blue: '#3b82f6',
          magenta: '#d946ef',
          cyan: '#06b6d4',
          white: '#ffffff',
        },
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        lineHeight: 1.25,
        cursorBlink: true,
        convertEol: true, // Automatically converts \n to \r\n
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      term.open(terminalContainerRef.current)
      
      xtermRef.current = term
      fitAddonRef.current = fitAddon

      term.writeln('\x1b[33m  __   _____ ___ ___    ___ _  _ _____ ___ ___ _  _   _ _____ ___ ___  _  _   _   _\x1b[0m')
      term.writeln('\x1b[33m  \\ \\ / / _ \\_ _|   \\  |_ _| \\| |_   _| __| _ \\ \\| | /_\\_   _|_ _/ _ \\| \\| | /_\\ | |\x1b[0m')
      term.writeln('\x1b[33m   \\ V / (_) | || |) |  | || .` | | | | _||   / .` |/ _ \\| |  | | (_) | .` |/ _ \\| |__\x1b[0m')
      term.writeln('\x1b[33m    \\_/ \\___/___|___/  |___|_|\\_| |_| |___|_|_\\_|\\_/_/ \\_\\_| |___\\___/|_|\\_/_/ \\_\\____|\x1b[0m')
      term.writeln('\x1b[90m───────────────────────────────────────────────────────────────────────────────────\x1b[0m')
      term.writeln('\x1b[1mVoid International\x1b[0m v0.1.0-beta \x1b[32m[Connected]\x1b[0m')
      term.writeln('Type \x1b[32mhelp\x1b[0m or \x1b[33mvoid deploy --server my-mcp\x1b[0m to test commands.\r\n')
      term.write('\x1b[32mvoid\x1b[0m@\x1b[33mmcp-infra\x1b[0m:~$ ')

      term.onData((e) => {
        if (e === '\r') { // Enter
          const cmd = bufferRef.current.trim()
          term.write('\r\n')
          executeCommand(cmd)
        } else if (e === '\x7F' || e === '\b') { // Backspace
          if (bufferRef.current.length > 0) {
            bufferRef.current = bufferRef.current.slice(0, -1)
            term.write('\b \b')
          }
        } else if (e === '\t') { // Tab autocompletion
          const current = bufferRef.current.trim()
          if (current) {
            const match = AUTOCOMPLETE_COMMANDS.find(c => c.startsWith(current))
            if (match) {
              const remainder = match.slice(current.length)
              bufferRef.current = match
              term.write(remainder)
            }
          }
        } else if (e === '\u001b[A') { // Arrow Up (History)
          if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
            historyIndexRef.current -= 1
            const pastCmd = historyRef.current[historyIndexRef.current] || ''
            term.write('\r\x1b[K\x1b[32mvoid\x1b[0m@\x1b[33mmcp-infra\x1b[0m:~$ ' + pastCmd)
            bufferRef.current = pastCmd
          }
        } else if (e === '\u001b[B') { // Arrow Down (History)
          if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1
            const pastCmd = historyRef.current[historyIndexRef.current] || ''
            term.write('\r\x1b[K\x1b[32mvoid\x1b[0m@\x1b[33mmcp-infra\x1b[0m:~$ ' + pastCmd)
            bufferRef.current = pastCmd
          } else {
            historyIndexRef.current = historyRef.current.length
            term.write('\r\x1b[K\x1b[32mvoid\x1b[0m@\x1b[33mmcp-infra\x1b[0m:~$ ')
            bufferRef.current = ''
          }
        } else if (e >= ' ') {
          bufferRef.current += e
          term.write(e)
        }
      })

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit()
      })
      resizeObserver.observe(terminalContainerRef.current)
    }

    // Fit and focus whenever open state or dimensions update
    setTimeout(() => {
      fitAddonRef.current?.fit()
      xtermRef.current?.focus()
    }, 100)
  }, [isOpen, height, customWidth, isMinimized, isMaximized])

  return (
    <div 
      className={`absolute bottom-0 right-0 z-50 select-none bg-[#050508] border-t border-l border-white/[0.12] shadow-[0_-15px_50px_rgba(0,0,0,0.95)] ${
        isOpen ? 'translate-y-0' : 'hidden translate-y-full pointer-events-none'
      } ${
        customWidth ? '' : 'left-0'
      }`}
      style={{ 
        display: isOpen ? 'block' : 'none',
        height: isMinimized ? '38px' : `${height}px`,
        width: customWidth ? `${customWidth}px` : '100%',
        transition: isDragging 
          ? 'none' 
          : 'height 0.15s ease, transform 0.25s ease, width 0.15s ease'
      }}
    >
      {/* 2D Resize Handles */}
      {!isMinimized && (
        <>
          {/* Top Edge (Height) */}
          <div 
            onMouseDown={handleStartResize('top')}
            className="absolute top-0 left-0 right-0 h-2 -translate-y-1 cursor-ns-resize z-50 flex items-center justify-center group"
            title="Drag up/down to resize"
          >
            <div className="w-12 h-1 rounded-full bg-white/20 group-hover:bg-void-gold transition-colors"></div>
          </div>

          {/* Left Edge (Width) */}
          <div 
            onMouseDown={handleStartResize('left')}
            className="absolute top-0 bottom-0 left-0 w-2 -translate-x-1 cursor-ew-resize z-50 flex flex-col items-center justify-center group"
            title="Drag left/right to resize"
          >
            <div className="h-10 w-1 rounded-full bg-white/20 group-hover:bg-void-gold transition-colors"></div>
          </div>

          {/* Top-Left Corner (Both) */}
          <div 
            onMouseDown={handleStartResize('corner')}
            className="absolute top-0 left-0 w-4 h-4 -translate-x-1.5 -translate-y-1.5 cursor-nwse-resize z-50 flex items-center justify-center group"
            title="Drag corner to resize"
          >
            <div className="w-2 h-2 rounded-full bg-void-gold/60 group-hover:bg-void-gold transition-all"></div>
          </div>
        </>
      )}

      {/* Clean macOS Header Bar */}
      <div 
        onDoubleClick={toggleMaximize}
        className="flex items-center justify-between px-3.5 h-9 bg-[#07070b] border-b border-white/[0.06] cursor-default"
      >
        <div className="flex items-center gap-3">
          {/* macOS Traffic Lights */}
          <div className="flex gap-1.5 items-center">
            <button 
              title="Close Terminal (Esc)"
              className="w-3 h-3 rounded-full bg-[#ef4444] hover:opacity-80 transition-opacity" 
              onClick={() => setIsOpen(false)}
            />
            <button 
              title={isMinimized ? "Restore" : "Minimize"}
              className="w-3 h-3 rounded-full bg-[#f59e0b] hover:opacity-80 transition-opacity" 
              onClick={() => setIsMinimized(!isMinimized)}
            />
            <button 
              title={isMaximized ? "Restore Size" : "Maximize"}
              className="w-3 h-3 rounded-full bg-[#4ade80] hover:opacity-80 transition-opacity" 
              onClick={toggleMaximize}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-white">void-cli</span>
            <span className="text-[10px] font-mono text-void-gold bg-void-gold/10 px-1.5 py-0.2 rounded border border-void-gold/20">
              v0.1.0
            </span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-void-muted">
          {customWidth && (
            <button 
              onClick={() => setCustomWidth(null)}
              className="text-void-gold hover:underline mr-1"
            >
              Reset Full Width
            </button>
          )}
          <span>Press <kbd className="bg-white/[0.08] px-1 py-0.2 rounded text-white text-[9px]">Esc</kbd> to close</span>
        </div>
      </div>

      {/* Terminal Canvas Container - Permanently mounted */}
      <div 
        className="p-2.5 h-[calc(100%-36px)] w-full overflow-hidden"
        style={{ display: isMinimized ? 'none' : 'block' }}
      >
        <div ref={terminalContainerRef} className="h-full w-full"></div>
      </div>
    </div>
  )
}
