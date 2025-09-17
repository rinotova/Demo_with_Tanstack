import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact')({ component: Contact })

function Contact() {
  return (
    <div className="h-full p-6 space-y-3">
      <h2 className="text-lg font-semibold">Contact</h2>
      <p className="text-sm text-gray-300">Let’s build something together.</p>
      <ul className="text-sm">
        <li>
          Email: <a className="text-[#4fc1ff] hover:underline" href="mailto:you@example.com">you@example.com</a>
        </li>
        <li>
          GitHub: <a className="text-[#4fc1ff] hover:underline" href="https://github.com/" target="_blank" rel="noreferrer">github.com/your-handle</a>
        </li>
        <li>
          LinkedIn: <a className="text-[#4fc1ff] hover:underline" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">linkedin.com/in/your-handle</a>
        </li>
      </ul>
      <p className="text-xs text-gray-500">You can also type <code>open contact</code> in the terminal.</p>
    </div>
  )
}

