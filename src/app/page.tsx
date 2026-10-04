import React from 'react';
import HomeHero from './home-page/components/HomeHero';
import StatsBar from './home-page/components/StatsBar';
import FeatureCards from './home-page/components/FeatureCards';
import BloodGroupGrid from './home-page/components/BloodGroupGrid';
import QuickSearch from './home-page/components/QuickSearch';
import InfoStrip from './home-page/components/InfoStrip';
import PublicNav from './home-page/components/PublicNav';
import PublicFooter from './home-page/components/PublicFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main>
        <HomeHero />
        <StatsBar />
        <FeatureCards />
        <BloodGroupGrid />
        <QuickSearch />
        <InfoStrip />
      </main>
      <PublicFooter />
    </div>
  );
}