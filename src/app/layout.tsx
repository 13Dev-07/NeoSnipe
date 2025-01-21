import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeoSnipe - Sacred Geometry Token Discovery',
  description: 'Discover tokens through sacred geometry',
  keywords: ['crypto', 'tokens', 'discovery', 'sacred geometry', 'defi'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'NeoSnipe - Sacred Geometry Token Discovery',
    description: 'Discover tokens through sacred geometry',
    type: 'website',
    siteName: 'NeoSnipe',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NeoSnipe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@neosnipe',
    title: 'NeoSnipe - Sacred Geometry Token Discovery',
    description: 'Discover tokens through sacred geometry',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipToContent />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}