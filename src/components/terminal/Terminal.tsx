import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ScrollArea } from '../ui/scroll-area'

type Line = { type: 'in' | 'out'; text: string }

const PROMPT = 'portfolio@guest:~$'

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([{
    type: 'out',
    text: 'Welcome to the portfolio terminal. Type "help" to get started.'
  }])
  const [value, setValue] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()

  const aliases = useMemo(
    () => ({
      home: '/',
      '/': '/',
      projects: '/projects',
      about: '/about',
      contact: '/contact',
    }),
    [],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  function run(cmd: string) {
    const trimmed = cmd.trim()
    const [name, ...rest] = trimmed.split(/\s+/)
    const arg = rest.join(' ')

    const emit = (text: string) =>
      setLines((s) => [...s, { type: 'out', text }])

    // Log the input line
    setLines((s) => [...s, { type: 'in', text: `${PROMPT} ${trimmed}` }])

    if (!name) return

    switch (name.toLowerCase()) {
      case 'help': {
        emit('Available commands:')
        emit('  help               Show this help')
        emit('  ls                 List pages')
        emit('  open <page>        Open a page (home, projects, about, contact)')
        emit('  goto <page>        Same as open')
        emit('  cd <page>          Same as open')
        emit('  clear              Clear the terminal')
        break
      }
      case 'clear': {
        setLines([])
        break
      }
      case 'ls': {
        emit(Object.keys(aliases).filter((k) => k !== '/').join('  '))
        break
      }
      case 'open':
      case 'goto':
      case 'cd': {
        const target = (arg || 'home').toLowerCase()
        const path = (aliases[target as keyof typeof aliases] || target) as
          | '/'
          | '/projects'
          | '/about'
          | '/contact'
        navigate({ to: path })
        emit(`Opened ${path}`)
        break
      }
      default: {
        emit(`Command not found: ${name}`)
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const v = value
      setValue('')
      run(v)
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      setValue('')
      setLines((s) => [...s, { type: 'out', text: '^C' }])
    }
  }

  return (
    <div
      className="h-full grid grid-rows-[1.75rem_1fr_2.5rem]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-4 px-3 text-xs bg-[#2d2d2d] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <span className="text-white">TERMINAL</span>
          <span className="text-gray-400">OUTPUT</span>
          <span className="text-gray-400">PROBLEMS</span>
          <span className="text-gray-400">DEBUG CONSOLE</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-gray-400">
          <span title="New Terminal">+</span>
          <span title="Kill">✕</span>
        </div>
      </div>
      <ScrollArea className="bg-[#1e1e1e] px-3 py-2 text-sm">
        <div className="space-y-1">
          {lines.map((l, i) => (
            <div key={i} className={l.type === 'in' ? 'text-gray-400' : ''}>
              {l.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 px-3 bg-[#1e1e1e] border-t border-[#2a2a2a]">
        <span className="text-green-500 text-sm">{PROMPT}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-500"
          placeholder="Type a command, e.g. `help`"
          aria-label="Terminal input"
        />
      </div>
    </div>
  )
}
