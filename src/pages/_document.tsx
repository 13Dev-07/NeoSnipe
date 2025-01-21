import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#06071b" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        
        {/* PWA Settings */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Security Headers */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={`default-src 'self'; 
          script-src 'self' 'unsafe-eval' 'unsafe-inline'; 
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
          img-src 'self' blob: data:; 
          font-src 'self' https://fonts.gstatic.com; 
          connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || ''}; 
          frame-ancestors 'none'; 
          form-action 'self';`}
        />
        
        {/* Preconnect to Required Origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload Critical Assets */}
        <link
          rel="preload"
          href="/fonts/SpaceGrotesk-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </Head>
      <body className="bg-deep-space">
        <Main />
        <NextScript />
        <div id="portal-root" /> {/* For modals and popovers */}
      </body>
    </Html>
  )
}
