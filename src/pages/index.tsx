import React from 'react';
import Head from 'next/head';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';
import { TokenDiscoveryPreview } from '../components/landing/TokenDiscoveryPreview';
import Layout from '../components/layout/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>NeoSnipe - Sacred Geometry Token Discovery</title>
        <meta name="description" content="Discover tokens through sacred geometry and advanced market analysis. NeoSnipe combines ancient wisdom with cutting-edge technology." />
        <meta name="keywords" content="crypto, token discovery, sacred geometry, market analysis, golden ratio, fibonacci, trading" />
      </Head>

      <div className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Feature Section */}
        <FeatureSection />

        {/* Token Discovery Preview */}
        <TokenDiscoveryPreview />
      </div>
    </Layout>
  );
}
