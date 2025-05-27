
import { useState, useEffect } from 'react';

export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useFirstVisit: Checking localStorage...');
    const hasVisited = localStorage.getItem('hasVisitedHomepage');
    console.log('useFirstVisit: hasVisited value:', hasVisited);
    
    if (!hasVisited) {
      console.log('useFirstVisit: First visit detected, setting flag');
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedHomepage', 'true');
    } else {
      console.log('useFirstVisit: Not first visit');
    }
    
    setIsLoading(false);
    console.log('useFirstVisit: Loading complete, isFirstVisit:', !hasVisited);
  }, []);

  return { isFirstVisit, isLoading };
};
