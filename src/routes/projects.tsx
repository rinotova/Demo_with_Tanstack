import { createFileRoute, Link } from '@tanstack/react-router'
import { projects } from '../data/projects'

export const Route = createFileRoute('/projects')({ component: Projects })

// uses shared projects data

function Projects() {
  return (
    <div className="h-full p-6">
      <h2 className="text-lg font-semibold mb-4">Projects</h2>
      <ul className="space-y-3">
        {projects.map((p) => (
          <li key={p.name} className="rounded border border-[#2a2a2a] p-4">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-400">{p.description}</div>
            <div className="mt-2 text-sm">
              <Link to="/contact" className="text-[#4fc1ff] hover:underline">
                Get in touch
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
