import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="h-full p-6 text-sm">
      <h1 className="text-xl font-semibold mb-2">Hi, I’m Rinot – Software Engineer</h1>
      <p className="text-gray-300 mb-4">
        Browse the sections on the left or type commands in the terminal
        below (try <code>help</code>, <code>ls</code>, or <code>open projects</code>).
      </p>
      <div className="flex gap-3 text-sm">
        <Link to="/projects" className="text-[#4fc1ff] hover:underline">
          View Projects
        </Link>
        <Link to="/contact" className="text-[#4fc1ff] hover:underline">
          Contact Me
        </Link>
      </div>
    </div>
  )
}
