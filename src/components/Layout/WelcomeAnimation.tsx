
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export const WelcomeAnimation = ({ onComplete }: WelcomeAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  console.log('WelcomeAnimation: Rendering with currentStep:', currentStep);

  useEffect(() => {
    console.log('WelcomeAnimation: Starting animation sequence');
    const timer1 = setTimeout(() => {
      console.log('WelcomeAnimation: Step 1');
      setCurrentStep(1);
    }, 500);
    const timer2 = setTimeout(() => {
      console.log('WelcomeAnimation: Step 2');
      setCurrentStep(2);
    }, 1500);
    const timer3 = setTimeout(() => {
      console.log('WelcomeAnimation: Step 3');
      setCurrentStep(3);
    }, 2500);
    const timer4 = setTimeout(() => {
      console.log('WelcomeAnimation: Animation complete, calling onComplete');
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center"
    >
      <div className="text-center space-y-8">
        <AnimatePresence mode="wait">
          {currentStep >= 0 && (
            <motion.div
              key="welcome"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4"
            >
              <motion.h1 
                className="text-6xl font-bold gradient-text"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Welcome
              </motion.h1>
              
              {currentStep >= 1 && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xl text-muted-foreground"
                >
                  to Reference Web
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep >= 2 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            
            {currentStep >= 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-muted-foreground"
              >
                Loading your dashboard...
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
