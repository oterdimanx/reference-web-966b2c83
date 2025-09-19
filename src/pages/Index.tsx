
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { DashboardView } from '@/components/Dashboard/DashboardView';
import { WelcomeAnimation } from '@/components/Layout/WelcomeAnimation';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { DynamicHead } from '@/components/SEO/DynamicHead';

const Index = () => {
  const { isFirstVisit, isLoading } = useFirstVisit();
  const [showAnimation, setShowAnimation] = useState(false);

  console.log('Index: isLoading:', isLoading, 'isFirstVisit:', isFirstVisit, 'showAnimation:', showAnimation);

  // Set showAnimation after loading check is complete
  useEffect(() => {
    console.log('Index useEffect: isLoading:', isLoading, 'isFirstVisit:', isFirstVisit);
    if (!isLoading && isFirstVisit) {
      console.log('Index: Setting showAnimation to true');
      setShowAnimation(true);
    }
  }, [isLoading, isFirstVisit]);

  const handleAnimationComplete = () => {
    console.log('Index: Animation completed, hiding animation');
    setShowAnimation(false);
  };

  if (isLoading) {
    console.log('Index: Still loading, returning null');
    return null; // Or a simple loading spinner
  }

  console.log('Index: Rendering with showAnimation:', showAnimation);

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead pageKey="index" />
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
