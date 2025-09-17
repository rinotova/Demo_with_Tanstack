import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import VscodeLayout from '../components/VscodeLayout'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            try {
              var t = localStorage.getItem('theme');
              var d = document.documentElement.classList;
              if (t === 'light') { d.remove('dark'); } else { d.add('dark'); }
            } catch {}
          `,
          }}
        />
      </head>
      <body className="bg-[#1e1e1e] text-gray-200">
        <VscodeLayout>{children}</VscodeLayout>
        <Scripts />
      </body>
    </html>
  )
}
