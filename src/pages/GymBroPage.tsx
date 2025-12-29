import React, { useState } from 'react';
import GymHeader from '../components/gymbro/GymHeader';
import FeedView from '../components/gymbro/FeedView';
import ProfileHero from '../components/gymbro/ProfileHero';

export const GymBroPage: React.FC = () => {
  const [tab, setTab] = useState<'feed'|'profile'>('feed');

  return (
    <div className="min-h-screen gym-gradient text-foreground">
      <GymHeader onToggle={() => setTab(tab==='feed'?'profile':'feed')} active={tab} />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {tab === 'feed' ? <FeedView /> : <ProfileHero />}
      </main>
    </div>
  );
};

export default GymBroPage;
