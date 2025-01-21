import React from 'react';
import Head from 'next/head';
import { WebGLBackground } from '../sacred-geometry/WebGLBackground';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'NeoSnipe' }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <WebGLBackground />
      </div>
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
