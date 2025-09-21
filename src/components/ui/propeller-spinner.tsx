import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PropellerSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16', 
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

const PropellerSpinner: React.FC<PropellerSpinnerProps> = ({ 
  size = 'lg', 
  className,
  message 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("flex flex-col items-center justify-center space-y-4", className)}
    >
      {/* Propeller Container */}
      <div className="relative">
        {/* Main Hub */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 10px hsl(var(--primary) / 0.3)",
              "0 0 20px hsl(var(--primary) / 0.5)",
              "0 0 10px hsl(var(--primary) / 0.3)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-primary/20 border-2 border-primary z-10"
        />
        
        {/* Propeller SVG */}
        <svg 
          className={cn(sizeClasses[size], "animate-propeller-spin")}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Propeller Blades */}
          <g className="origin-center">
            {/* Blade 1 */}
            <ellipse
              cx="50"
              cy="20"
              rx="3"
              ry="25"
              fill="hsl(var(--primary))"
              className="animate-blade-blur"
              transform="rotate(0 50 50)"
            />
            {/* Blade 2 */}
            <ellipse
              cx="50"
              cy="20"
              rx="3"
              ry="25"
              fill="hsl(var(--primary))"
              className="animate-blade-blur"
              transform="rotate(120 50 50)"
            />
            {/* Blade 3 */}
            <ellipse
              cx="50"
              cy="20"
              rx="3"
              ry="25"
              fill="hsl(var(--primary))"
              className="animate-blade-blur"
              transform="rotate(240 50 50)"
            />
          </g>
          
          {/* Central Hub */}
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1"
          />
          
          {/* Hub Highlight */}
          <circle
            cx="48"
            cy="47"
            r="2"
            fill="hsl(var(--primary-foreground) / 0.6)"
          />
        </svg>
      </div>

      {/* Loading Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {message}
        </motion.p>
      )}
      
      {/* Optional Loading Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex space-x-1"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export { PropellerSpinner };