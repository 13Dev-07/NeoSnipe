import React from 'react';
import Head from 'next/head';
import { WebGLBackground } from '../sacred-geometry/WebGLBackground';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'NeoSnipe' }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-cosmic-black">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <WebGLBackground />
        <div className="absolute inset-0 sacred-pattern opacity-20" />
      </div>
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen w-full">
        <div className="sacred-container">
          <div className="sacred-glass p-golden mt-golden rounded-lg">
            {children}
          </div>
        </div>
      </main>

      {/* Navigation Controls (if needed) */}
      <nav className="fixed bottom-golden right-golden z-20">
        <div className="sacred-glass sacred-border p-4 rounded-full">
          {/* Add navigation controls here */}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
