import { Link, useRouterState } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import Terminal from './terminal/Terminal'
import { useEffect, useRef, useState } from 'react'

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
  const routerState = useRouterState({ select: (s) => s.location.pathname })
  const tabs = [
    { label: 'home.tsx', to: '/' },
    { label: 'projects.tsx', to: '/projects' },
    { label: 'about.tsx', to: '/about' },
    { label: 'contact.tsx', to: '/contact' },
  ] as const
  return (
    <div className="h-8 flex items-stretch bg-[#2d2d2d] border-b border-[#2a2a2a] select-none">
      {tabs.map((t) => {
        const active = routerState === t.to
        return (
          <Link
            key={t.to}
            to={t.to}
            className={[
              'px-3 text-sm flex items-center gap-2 border-r border-[#2a2a2a]',
              active ? 'bg-[#1e1e1e] text-white' : 'text-gray-300 hover:text-white hover:bg-[#3a3a3a]',
            ].join(' ')}
          >
            <span className="i-tab w-3 h-3" />
            <span>{t.label}</span>
            <span className="ml-2 text-gray-500">×</span>
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
