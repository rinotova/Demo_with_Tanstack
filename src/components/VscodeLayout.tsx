import { Link } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import Terminal from './terminal/Terminal'

type Props = {
  children: React.ReactNode
}

export default function VscodeLayout({ children }: Props) {
  return (
    <div className="h-screen w-screen grid grid-rows-[1fr_12rem]">
      <div className="grid grid-cols-[3.2rem_16rem_1fr] overflow-hidden">
        <ActivityBar />
        <SideNav />
        <main className="bg-[#1e1e1e] border-l border-[#2a2a2a] overflow-auto">
          {children}
        </main>
      </div>
      <div className="border-t border-[#2a2a2a] bg-[#1e1e1e]">
        <Terminal />
      </div>
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

