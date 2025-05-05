
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 card-hover",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <span className="text-green-600 dark:text-green-400 flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {trend} positions
                </span>
              ) : trend < 0 ? (
                <span className="text-red-600 dark:text-red-400 flex items-center text-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {Math.abs(trend)} positions
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400 text-sm">No change</span>
              )}
            </div>
          )}
        </div>
        {icon && <div className="text-blue-500 dark:text-blue-400">{icon}</div>}
      </div>
    </div>
  );
}
