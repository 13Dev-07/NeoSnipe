import type { NextPage } from 'next'
import Head from 'next/head'
import { NavigationBar } from '../components/navigation/NavigationBar'
import { HeroSection } from '../components/landing/HeroSection'
import { FeaturesGrid } from '../components/landing/FeaturesGrid'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>NeoSnipe - Sacred Geometry Token Discovery</title>
        <meta name="description" content="Discover tokens through sacred geometry" />
      </Head>
      <div className="min-h-screen bg-deep-space">
        <NavigationBar />
        <main>
          <HeroSection />
          <FeaturesGrid />
        </main>
      </div>
    </>
  )
}

export default Home