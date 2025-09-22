import { cn } from "@/lib/utils";

interface SubmarineLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SubmarineLoading = ({ className, size = "md" }: SubmarineLoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-spin"
          style={{ animationDuration: "2s" }}
        >
          {/* Submarine body */}
          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="15"
            fill="hsl(var(--muted-foreground))"
            opacity="0.8"
          />
          
          {/* Submarine conning tower */}
          <rect
            x="45"
            y="35"
            width="10"
            height="15"
            rx="2"
            fill="hsl(var(--muted-foreground))"
            opacity="0.9"
          />
          
          {/* Periscope */}
          <line
            x1="50"
            y1="35"
            x2="50"
            y2="25"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.5"
            opacity="0.7"
          />
          
          {/* Submarine front */}
          <ellipse
            cx="20"
            cy="50"
            rx="8"
            ry="12"
            fill="hsl(var(--muted-foreground))"
            opacity="0.6"
          />
          
          {/* Submarine rear */}
          <ellipse
            cx="80"
            cy="50"
            rx="6"
            ry="10"
            fill="hsl(var(--muted-foreground))"
            opacity="0.6"
          />
          
          {/* Propeller */}
          <g transform="translate(85, 50)">
            <line x1="-3" y1="0" x2="3" y2="0" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
          </g>
          
          {/* Small details/windows */}
          <circle cx="35" cy="50" r="2" fill="hsl(var(--background))" opacity="0.8" />
          <circle cx="42" cy="48" r="1.5" fill="hsl(var(--background))" opacity="0.6" />
          <circle cx="58" cy="52" r="1.5" fill="hsl(var(--background))" opacity="0.6" />
        </svg>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Loading keywords...
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};