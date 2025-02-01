import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { inter, orbitron, spaceGrotesk } from '../styles/fonts'
import { theme } from '../styles/theme'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-orbitron: ${orbitron.variable};
          --font-space-grotesk: ${spaceGrotesk.variable};
        }
      `}</style>
      <div className={`${orbitron.variable} ${spaceGrotesk.variable} bg-cosmic-black min-h-screen`}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}