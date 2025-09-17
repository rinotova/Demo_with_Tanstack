export type Project = {
  slug: string
  name: string
  description: string
  url?: string
}

export const projects: Project[] = [
  {
    slug: 'vscode-portfolio',
    name: 'VSCode-like Portfolio',
    description: 'TanStack Start + Tailwind + shadcn/ui with terminal & tabs.',
    url: 'https://github.com/',
  },
  {
    slug: 'cli-playground',
    name: 'CLI Playground',
    description: 'Interactive terminal UI powered by React hooks.',
    url: 'https://github.com/',
  },
  {
    slug: 'data-viz-demos',
    name: 'Data Viz Demos',
    description: 'Charts with D3 + React in TypeScript.',
    url: 'https://github.com/',
  },
]

