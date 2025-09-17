import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import Terminal from './terminal/Terminal'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
}

export default function VscodeLayout({ children }: Props) {
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('panel:h') : null
    return saved ? Number(saved) : 192
  })
  const draggingRef = useRef(false)

  useEffect(() => {
    localStorage.setItem('panel:h', String(panelHeight))
  }, [panelHeight])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return
      const vh = window.innerHeight
      const min = 120
      const max = Math.max(160, Math.min(600, Math.round(vh * 0.8)))
      const y = e.clientY
      const newH = Math.max(min, Math.min(max, vh - y - 24)) // 24px status bar
      setPanelHeight(newH)
      e.preventDefault()
    }
    function onUp() {
      draggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onDragStart = (e: React.MouseEvent) => {
    draggingRef.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }

  return (
    <div
      className="h-screen w-screen"
      style={{
        display: 'grid',
        gridTemplateRows: `1fr ${panelHeight}px 24px`,
      }}
    >
      <div className="grid grid-cols-[3.2rem_16rem_1fr] overflow-hidden">
        <ActivityBar />
        <SideNav />
        <main className="bg-[#1e1e1e] border-l border-[#2a2a2a] overflow-auto flex flex-col">
          <EditorTabs />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
      <div className="relative border-t border-[#2a2a2a] bg-[#1e1e1e]">
        <div
          onMouseDown={onDragStart}
          className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize bg-transparent"
          aria-label="Resize panel"
          title="Drag to resize"
        />
        <Terminal />
      </div>
      <StatusBar />
    </div>
  )
}

function ActivityBar() {
  const iconCls =
    'h-6 w-6 text-gray-400 hover:text-white transition-colors cursor-pointer'
  return (
    <aside className="bg-[#252526] border-r border-[#2a2a2a] flex flex-col items-center gap-4 py-4">
      <Link to="/" className="p-1" title="Home">
        <span className={iconCls}>🏠</span>
      </Link>
      <Link to="/projects" className="p-1" title="Projects">
        <span className={iconCls}>🗂️</span>
      </Link>
      <Link to="/about" className="p-1" title="About">
        <span className={iconCls}>👤</span>
      </Link>
      <Link to="/contact" className="p-1" title="Contact">
        <span className={iconCls}>✉️</span>
      </Link>
      <div className="mt-auto pb-2 text-xs text-gray-500">VS Code</div>
    </aside>
  )
}

function SideNav() {
  return (
    <aside className="bg-[#252526] text-gray-200 border-r border-[#2a2a2a] flex flex-col">
      <div className="px-3 py-2 text-xs tracking-wide text-gray-400">PORTFOLIO</div>
      <Separator className="bg-[#2a2a2a]" />
      <ScrollArea className="flex-1">
        <nav className="px-2 py-2 space-y-1">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/projects">Projects</NavItem>
          <NavItem to="/about">About</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>
      </ScrollArea>
    </aside>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block rounded-sm px-2 py-1 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
      activeProps={{ className: 'bg-[#373737] text-white' }}
    >
      {children}
    </Link>
  )
}

function EditorTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const labelFor = useMemo(() => {
    const map: Record<string, string> = {
      '/': 'home.tsx',
      '/projects': 'projects.tsx',
      '/about': 'about.tsx',
      '/contact': 'contact.tsx',
    }
    return (p: string) => {
      if (map[p]) return map[p]
      const seg = p.split('/').filter(Boolean).pop() || 'home'
      return `${seg}.tsx`
    }
  }, [])

  type Tab = { to: string; label: string }

  const [openTabs, setOpenTabs] = useState<Tab[]>(() => {
    if (typeof window === 'undefined') return [{ to: pathname, label: 'home.tsx' }]
    try {
      const raw = localStorage.getItem('tabs:open')
      const parsed: Tab[] | null = raw ? JSON.parse(raw) : null
      if (parsed && parsed.length) return parsed
    } catch {}
    return [{ to: pathname, label: labelFor(pathname) }]
  })

  // Persist tabs
  useEffect(() => {
    try {
      localStorage.setItem('tabs:open', JSON.stringify(openTabs))
    } catch {}
  }, [openTabs])

  // Ensure current route is opened as a tab
  useEffect(() => {
    setOpenTabs((tabs) => {
      if (tabs.some((t) => t.to === pathname)) return tabs
      return [...tabs, { to: pathname, label: labelFor(pathname) }]
    })
  }, [pathname, labelFor])

  const navigate = useNavigate()

  function closeTab(e: React.MouseEvent, to: string) {
    e.preventDefault()
    e.stopPropagation()
    setOpenTabs((tabs) => {
      const idx = tabs.findIndex((t) => t.to === to)
      if (idx === -1) return tabs
      const nextTabs = [...tabs.slice(0, idx), ...tabs.slice(idx + 1)]
      // If closing the active tab, navigate to neighbor or home
      if (to === pathname) {
        const neighbor = nextTabs[idx]?.to || nextTabs[idx - 1]?.to || '/'
        window.queueMicrotask(() => {
          navigate({ to: neighbor as any })
        })
      }
      return nextTabs.length ? nextTabs : [{ to: '/', label: labelFor('/') }]
    })
  }

  return (
    <div className="h-8 flex items-stretch bg-[#2d2d2d] border-b border-[#2a2a2a] select-none">
      {openTabs.map((t) => {
        const active = pathname === t.to
        return (
          <Link
            key={t.to}
            to={t.to as any}
            className={[
              'pl-3 pr-2 text-sm flex items-center gap-2 border-r border-[#2a2a2a] group',
              active ? 'bg-[#1e1e1e] text-white' : 'text-gray-300 hover:text-white hover:bg-[#3a3a3a]',
            ].join(' ')}
          >
            <span aria-hidden className="text-gray-400">📄</span>
            <span>{t.label}</span>
            <button
              onClick={(e) => closeTab(e, t.to)}
              title="Close"
              className={[
                'ml-2 rounded px-1 text-gray-500',
                active ? 'hover:bg-[#4b4b4b] hover:text-white' : 'group-hover:bg-[#4b4b4b] group-hover:text-white',
              ].join(' ')}
              aria-label={`Close ${t.label}`}
            >
              ×
            </button>
          </Link>
        )
      })}
      <div className="flex-1" />
    </div>
  )
}

function StatusBar() {
  return (
    <div className="h-6 bg-[#0e639c] text-white text-xs flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <span>Rinot Portfolio</span>
        <span>main</span>
        <span>TS React</span>
      </div>
      <div className="flex items-center gap-3">
        <span>Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>TypeScript</span>
      </div>
    </div>
  )
}
