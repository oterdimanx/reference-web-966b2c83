
import { useState, useEffect } from 'react';

export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedHomepage');
    
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedHomepage', 'true');
    }
    
    setIsLoading(false);
  }, []);

  return { isFirstVisit, isLoading };
};
