import React from 'react'
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material'

export const ColorModeContext = React.createContext({ mode: 'dark', toggle: () => {} })

function getInitialMode() {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('mdva-color-mode')
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = React.useState(getInitialMode)

  React.useEffect(() => {
    localStorage.setItem('mdva-color-mode', mode)
    const root = document.documentElement
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [mode])

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#7c9cff' : '#3f51b5' },
      background: {
        default: mode === 'dark' ? '#0b1220' : '#f7f8fb',
        paper: mode === 'dark' ? '#121a2b' : '#ffffff'
      }
    },
    shape: { borderRadius: 12 },
  }), [mode])

  const value = React.useMemo(() => ({ mode, toggle: () => setMode(m => (m === 'dark' ? 'light' : 'dark')) }), [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ColorModeContext.Provider>
  )
}


