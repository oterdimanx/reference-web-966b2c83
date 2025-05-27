
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { DashboardView } from '@/components/Dashboard/DashboardView';
import { WelcomeAnimation } from '@/components/Layout/WelcomeAnimation';
import { useFirstVisit } from '@/hooks/useFirstVisit';

const Index = () => {
  const { isFirstVisit, isLoading } = useFirstVisit();
  const [showAnimation, setShowAnimation] = useState(false);

  // Set showAnimation after loading check is complete
  useEffect(() => {
    if (!isLoading && isFirstVisit) {
      setShowAnimation(true);
    }
  }, [isLoading, isFirstVisit]);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  if (isLoading) {
    return null; // Or a simple loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence>
        {showAnimation && (
          <WelcomeAnimation onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>
      
      <Header />
      <main className="flex-grow">
        <DashboardView />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
