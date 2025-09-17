export type Theme = 'dark' | 'light'

const KEY = 'theme'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const t = localStorage.getItem(KEY)
  return (t === 'light' || t === 'dark') ? t : 'dark'
}

export function setTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  if (theme === 'dark') {
    el.classList.add('dark')
  } else {
    el.classList.remove('dark')
  }
  try {
    localStorage.setItem(KEY, theme)
  } catch {}
}

export function ensureInitialTheme() {
  if (typeof document === 'undefined') return
  const theme = getTheme()
  setTheme(theme)
}

