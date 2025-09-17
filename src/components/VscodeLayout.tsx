import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import Terminal from './terminal/Terminal'
import { useEffect, useMemo, useRef, useState } from 'react'
import CommandPalette from './CommandPalette'
import ProjectPreviewDialog from './ProjectPreviewDialog'
import GlobalSearch from './GlobalSearch'
import { projects } from '../data/projects'
import { setTheme } from '../lib/theme'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu'

type Props = {
  children: React.ReactNode
}

function openPreview(slug: string | null) {
  const ev = new CustomEvent('open-project-preview', { detail: { slug } })
  window.dispatchEvent(ev)
}

export default function VscodeLayout({ children }: Props) {
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('panel:h') : null
    return saved ? Number(saved) : 192
  })
  const draggingRef = useRef(false)
  const [sidebarW, setSidebarW] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sidebar:w') : null
    return saved ? Number(saved) : 256
  })
  const sideDraggingRef = useRef(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSlug, setPreviewSlug] = useState<string | null>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('panel:h', String(panelHeight))
  }, [panelHeight])

  useEffect(() => {
    localStorage.setItem('sidebar:w', String(sidebarW))
  }, [sidebarW])

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

  // Sidebar resizer
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!sideDraggingRef.current) return
      const min = 160
      const max = Math.max(220, Math.min(560, window.innerWidth - 480))
      setSidebarW(Math.max(min, Math.min(max, e.clientX - 51))) // minus activity bar width + border
      e.preventDefault()
    }
    function onUp() {
      sideDraggingRef.current = false
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

  const onSideDragStart = (e: React.MouseEvent) => {
    sideDraggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }

  // Keyboard shortcuts: Cmd/Ctrl+P for palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const mod = e.metaKey || e.ctrlKey
      if (mod && key === 'p') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Track narrow viewport (mobile)
  useEffect(() => {
    const q = window.matchMedia('(max-width: 767px)')
    const set = () => setIsNarrow(q.matches)
    set()
    q.addEventListener('change', set)
    return () => q.removeEventListener('change', set)
  }, [])

  // Listen for preview/theme events from palette/search
  useEffect(() => {
    const onOpenPreview = (e: any) => {
      setPreviewSlug(e?.detail?.slug || null)
      setPreviewOpen(true)
    }
    const onSetTheme = (e: any) => {
      const t = e?.detail?.theme
      if (t === 'dark' || t === 'light') setTheme(t)
    }
    window.addEventListener('open-project-preview', onOpenPreview as any)
    window.addEventListener('set-theme', onSetTheme as any)
    return () => {
      window.removeEventListener('open-project-preview', onOpenPreview as any)
      window.removeEventListener('set-theme', onSetTheme as any)
    }
  }, [])

  return (
    <div
      className="h-screen w-screen"
      style={{ display: 'grid', gridTemplateRows: `1fr ${panelHeight}px 24px` }}
    >
      <div
        className="overflow-hidden relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `3.2rem ${isNarrow ? 0 : sidebarW}px 1fr`,
        }}
      >
        <ActivityBar />
        <SideNav onResizeStart={onSideDragStart} overlay={false} />
        <main className="relative bg-[#1e1e1e] border-l border-[#2a2a2a] overflow-auto flex flex-col">
          <EditorTabs isNarrow={isNarrow} onToggleMenu={() => setDrawerOpen(true)} />
          <div className="flex-1 overflow-auto">{children}</div>
          {/* vertical resize handle overlay for accessibility */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-[#2a2a2a]"
            aria-hidden
          />
        </main>

        {/* Mobile drawer overlay for sidebar */}
        {isNarrow && drawerOpen ? (
          <div className="absolute inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <div
              className="absolute top-0 bottom-0 left-[3.2rem] w-[80vw] max-w-[20rem] bg-[#252526] border-r border-[#2a2a2a] shadow-xl"
              role="dialog"
              aria-label="Sidebar menu"
            >
              <SideNav overlay />
            </div>
          </div>
        ) : null}
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
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ProjectPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} slug={previewSlug ?? undefined} />
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
    </aside>
  )
}

function SideNav({ onResizeStart, overlay = false }: { onResizeStart?: (e: React.MouseEvent) => void; overlay?: boolean }) {
  return (
    <aside className="relative bg-[#252526] text-gray-200 border-r border-[#2a2a2a] flex flex-col h-full">
      <div className="px-3 py-2 text-xs tracking-wide text-gray-400">EXPLORER</div>
      <Separator className="bg-[#2a2a2a]" />
      <GlobalSearch />
      <ScrollArea className="flex-1">
        <Explorer />
      </ScrollArea>
      {/* vertical resizer */}
      {!overlay && onResizeStart ? (
        <div
          onMouseDown={onResizeStart}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize"
          aria-label="Resize sidebar"
          title="Drag to resize"
        />
      ) : null}
    </aside>
  )
}

function Explorer() {
  return (
    <div className="px-2 py-2 text-sm">
      <div className="text-xs text-gray-400 px-1 py-1">PAGES</div>
      <TreeLink to="/" label="home.tsx" />
      <TreeLink to="/projects" label="projects.tsx" />
      <TreeLink to="/about" label="about.tsx" />
      <TreeLink to="/contact" label="contact.tsx" />
      <div className="text-xs text-gray-400 px-1 py-1 mt-2">PROJECTS</div>
      <div className="space-y-1">
        {projects.map((p) => (
          <div key={p.slug} className="flex items-center justify-between group">
            <TreeItem label={`${p.slug}.md`} onClick={() => openPreview(p.slug)} />
            <button
              onClick={() => openPreview(p.slug)}
              title="Preview"
              className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-white px-1"
            >
              Preview
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function TreeLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block rounded-sm px-2 py-1 text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
      activeProps={{ className: 'bg-[#373737] text-white' }}
    >
      <span className="mr-2">📄</span>
      {label}
    </Link>
  )
}

function TreeItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-sm px-2 py-1 text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
    >
      <span className="mr-2">📄</span>
      {label}
    </button>
  )
}

function EditorTabs({ isNarrow, onToggleMenu }: { isNarrow: boolean; onToggleMenu: () => void }) {
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

  type Tab = { to: string; label: string; pinned?: boolean }

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

  // Drag-to-reorder tabs
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  useEffect(() => {
    const onUp = () => setDragIdx(null)
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  function onTabMouseDown(e: React.MouseEvent, i: number) {
    if (e.button === 1) {
      // middle click close
      closeTab(e, openTabs[i].to)
      return
    }
    if (e.button === 0) setDragIdx(i)
  }

  function onTabEnter(i: number) {
    setOpenTabs((tabs) => {
      if (dragIdx == null || dragIdx === i) return tabs
      const next = tabs.slice()
      const [moved] = next.splice(dragIdx, 1)
      next.splice(i, 0, moved)
      setDragIdx(i)
      return next
    })
  }

  function closeOthers(target: string) {
    setOpenTabs((tabs) => tabs.filter((t) => t.to === target || t.pinned))
  }

  function closeRightOf(target: string) {
    setOpenTabs((tabs) => {
      const idx = tabs.findIndex((t) => t.to === target)
      if (idx === -1) return tabs
      return tabs.filter((_, i) => i <= idx || tabs[i].pinned)
    })
  }

  function togglePin(target: string) {
    setOpenTabs((tabs) => {
      const next = tabs.map((t) => (t.to === target ? { ...t, pinned: !t.pinned } : t))
      // keep pinned to the left
      next.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      return next
    })
  }

  return (
    <div className="h-8 flex items-stretch bg-[#2d2d2d] border-b border-[#2a2a2a] select-none">
      {isNarrow ? (
        <button
          onClick={onToggleMenu}
          className="px-3 text-sm text-gray-200 hover:text-white"
          title="Open menu"
          aria-label="Open menu"
        >
          ☰
        </button>
      ) : null}
      {openTabs.map((t, i) => {
        const active = pathname === t.to
        return (
          <ContextMenu key={t.to}>
            <ContextMenuTrigger asChild>
              <Link
                to={t.to as any}
                onMouseDown={(e) => onTabMouseDown(e, i)}
                onMouseEnter={() => onTabEnter(i)}
                className={[
                  'pl-3 pr-2 text-sm flex items-center gap-2 border-r border-[#2a2a2a] group',
                  active ? 'bg-[#1e1e1e] text-white' : 'text-gray-300 hover:text-white hover:bg-[#3a3a3a]',
                ].join(' ')}
              >
                <span aria-hidden className="text-gray-400">📄</span>
                <span>{t.label}</span>
                {t.pinned ? <span className="text-xs">📌</span> : null}
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
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={(e) => closeTab(e as any, t.to)}>Close</ContextMenuItem>
              <ContextMenuItem onClick={() => closeOthers(t.to)}>Close Others</ContextMenuItem>
              <ContextMenuItem onClick={() => closeRightOf(t.to)}>Close to the Right</ContextMenuItem>
              <ContextMenuItem onClick={() => togglePin(t.to)}>{t.pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>
              {t.to === '/projects' ? (
                <ContextMenuItem onClick={() => openPreview(null)}>Preview Projects…</ContextMenuItem>
              ) : null}
            </ContextMenuContent>
          </ContextMenu>
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
