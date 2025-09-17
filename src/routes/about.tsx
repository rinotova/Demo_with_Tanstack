import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({ component: About })

function About() {
  return (
    <div className="h-full p-6">
      <h2 className="text-lg font-semibold mb-3">About</h2>
      <p className="text-sm text-gray-300 leading-relaxed max-w-prose">
        I design and build web apps with a focus on DX and performance.
        I enjoy modern React tooling, TypeScript, and clean UI systems.
        This portfolio emulates the VS Code UI to make navigation familiar
        and introduce a fun terminal for quick commands.
      </p>
    </div>
  )
}

