import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { projects } from '../data/projects'

type Res = { id: string; label: string; to?: string; run?: () => void }

function score(q: string, t: string): number {
  q = q.toLowerCase().trim()
  t = t.toLowerCase()
  if (!q) return 0
  let ti = 0, s = 0
  for (let i = 0; i < q.length; i++) {
    const idx = t.indexOf(q[i], ti)
    if (idx === -1) return -1
    s += 1
    if (idx === ti) s += 1
    ti = idx + 1
  }
  return s
}

export default function GlobalSearch() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const items = useMemo<Res[]>(() => {
    const basics: Res[] = [
      { id: '/', label: 'Home', to: '/' },
      { id: '/projects', label: 'Projects', to: '/projects' },
      { id: '/about', label: 'About', to: '/about' },
      { id: '/contact', label: 'Contact', to: '/contact' },
    ]
    const proj: Res[] = projects.map((p) => ({ id: 'p:' + p.slug, label: `Preview ${p.name}`, run: () => openPreview(p.slug) }))
    return basics.concat(proj)
  }, [])

  const filtered = useMemo(() => {
    if (!q.trim()) return [] as Res[]
    return items
      .map((it) => ({ it, s: score(q, it.label) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.it)
  }, [items, q])

  return (
    <div className="px-2 py-2">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setSel(0)
        }}
        onKeyDown={(e) => {
          if (!filtered.length) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSel((s) => Math.min(s + 1, filtered.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSel((s) => Math.max(s - 1, 0))
          } else if (e.key === 'Enter') {
            const r = filtered[sel]
            if (r) {
              if (r.to) nav({ to: r.to as any })
              else r.run?.()
              setQ('')
            }
          } else if (e.key === 'Escape') {
            setQ('')
          }
        }}
        placeholder="Search…"
        className="w-full rounded bg-[#1e1e1e] border border-[#2a2a2a] px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[#4fc1ff]"
      />
      {filtered.length ? (
        <ul className="mt-2 space-y-1">
          {filtered.map((r, i) => (
            <li key={r.id}>
              <button
                onClick={() => {
                  if (r.to) nav({ to: r.to as any })
                  else r.run?.()
                  setQ('')
                }}
                onMouseEnter={() => setSel(i)}
                className={["w-full text-left text-xs px-2 py-1 rounded hover:bg-[#2a2a2a]", sel === i ? 'bg-[#2a2a2a]' : ''].join(' ')}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function openPreview(slug: string) {
  const ev = new CustomEvent('open-project-preview', { detail: { slug } })
  window.dispatchEvent(ev)
}
