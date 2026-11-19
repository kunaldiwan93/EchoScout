'use client';

import CoverHeader from '../components/cover/CoverHeader';
import CoverHero from '../components/cover/CoverHero';
import CoverExample from '../components/cover/CoverExample';
import CoverHowItWorks from '../components/cover/CoverHowItWorks';
import CoverGoodToKnow from '../components/cover/CoverGoodToKnow';
import CoverFooter from '../components/cover/CoverFooter';

export default function CoverPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-buoy selection:text-ink">
      <CoverHeader />
      <main className="flex-1">
        <CoverHero />
        <CoverExample />
        <CoverHowItWorks />
        <CoverGoodToKnow />
      </main>
      <CoverFooter />
    </div>
  );
}
