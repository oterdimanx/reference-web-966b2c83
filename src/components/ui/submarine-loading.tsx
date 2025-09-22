import { cn } from "@/lib/utils";

interface SubmarineLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SubmarineLoading = ({ className, size = "md" }: SubmarineLoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-32 h-32", 
    lg: "w-48 h-48"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-6", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-spin"
          style={{ animationDuration: "2s" }}
        >
          {/* Submarine main body - more rounded */}
          <ellipse
            cx="50"
            cy="50"
            rx="32"
            ry="18"
            fill="hsl(var(--muted-foreground))"
            opacity="0.8"
          />
          
          {/* Submarine conning tower - more rounded */}
          <ellipse
            cx="50"
            cy="42"
            rx="6"
            ry="8"
            fill="hsl(var(--muted-foreground))"
            opacity="0.9"
          />
          
          {/* Periscope */}
          <line
            x1="50"
            y1="34"
            x2="50"
            y2="24"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.5"
            opacity="0.7"
          />
          
          {/* Submarine front - more rounded */}
          <ellipse
            cx="22"
            cy="50"
            rx="10"
            ry="14"
            fill="hsl(var(--muted-foreground))"
            opacity="0.6"
          />
          
          {/* Submarine rear - more rounded */}
          <ellipse
            cx="78"
            cy="50"
            rx="8"
            ry="12"
            fill="hsl(var(--muted-foreground))"
            opacity="0.6"
          />
          
          {/* Propeller */}
          <g transform="translate(84, 50)">
            <line x1="-4" y1="0" x2="4" y2="0" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" opacity="0.4" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" opacity="0.4" />
          </g>
          
          {/* Small details/windows - more rounded */}
          <circle cx="35" cy="50" r="2.5" fill="hsl(var(--background))" opacity="0.8" />
          <circle cx="42" cy="48" r="2" fill="hsl(var(--background))" opacity="0.6" />
          <circle cx="58" cy="52" r="2" fill="hsl(var(--background))" opacity="0.6" />
          <circle cx="65" cy="50" r="1.8" fill="hsl(var(--background))" opacity="0.5" />
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