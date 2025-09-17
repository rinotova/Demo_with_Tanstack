import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { projects } from '../data/projects'

type Item = { id: string; label: string; hint?: string; action: () => void }

function score(query: string, text: string): number {
  // Simple fuzzy: reward consecutive matches and prefixes
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let ti = 0
  let s = 0
  for (let i = 0; i < q.length; i++) {
    const ch = q[i]
    const idx = t.indexOf(ch, ti)
    if (idx === -1) return -1
    s += 1
    if (idx === ti) s += 1 // consecutive bonus
    if (idx === 0) s += 1 // prefix bonus
    ti = idx + 1
  }
  return s
}

export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const items = useMemo<Item[]>(() => {
    const jump = (label: string, to: string): Item => ({ id: to, label, hint: to, action: () => nav({ to: to as any }) })
    const list: Item[] = [
      jump('Home', '/'),
      jump('Projects', '/projects'),
      jump('About', '/about'),
      jump('Contact', '/contact'),
      ...projects.map((p) => ({
        id: `proj:${p.slug}`,
        label: `Preview ${p.name}`,
        hint: p.slug,
        action: () => {
          const ev = new CustomEvent('open-project-preview', { detail: { slug: p.slug } })
          window.dispatchEvent(ev)
        },
      })),
      {
        id: 'theme:dark',
        label: 'Theme: Dark',
        action: () => dispatchTheme('dark'),
      },
      {
        id: 'theme:light',
        label: 'Theme: Light',
        action: () => dispatchTheme('light'),
      },
    ]
    return list
  }, [nav])

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return items
    return items
      .map((it) => ({ it, s: score(q, it.label + ' ' + (it.hint || '')) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.it)
  }, [items, query])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
      setQuery('')
      setSel(0)
    }
  }, [open])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onOpenChange(false)
    else if (e.key === 'ArrowDown') setSel((s) => Math.min(s + 1, filtered.length - 1))
    else if (e.key === 'ArrowUp') setSel((s) => Math.max(s - 1, 0))
    else if (e.key === 'Enter') {
      filtered[sel]?.action()
      onOpenChange(false)
    }
  }

  return (
    <div className={[open ? 'fixed' : 'hidden', 'inset-0 z-50'].join(' ')}>
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[40rem] max-w-[92vw] rounded-md overflow-hidden shadow-2xl border border-[#2a2a2a] bg-[#1e1e1e]">
        <div className="px-3 py-2 border-b border-[#2a2a2a]">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-500"
            placeholder="Type to search… (Enter to run)"
          />
        </div>
        <ul className="max-h-[50vh] overflow-auto">
          {filtered.map((it, i) => (
            <li
              key={it.id}
              className={[
                'px-3 py-2 text-sm flex items-center gap-2 cursor-pointer',
                i === sel ? 'bg-[#2d2d2d] text-white' : 'text-gray-300 hover:bg-[#2a2a2a]',
              ].join(' ')}
              onMouseEnter={() => setSel(i)}
              onClick={() => {
                it.action()
                onOpenChange(false)
              }}
            >
              <span className="text-gray-400">⌘</span>
              <span className="flex-1">{it.label}</span>
              {it.hint ? <span className="text-gray-500">{it.hint}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function dispatchTheme(theme: 'dark' | 'light') {
  const ev = new CustomEvent('set-theme', { detail: { theme } })
  window.dispatchEvent(ev)
}

