
import { StatCard } from '@/components/common/StatCard';
import { Globe, Search, TrendingUp, Award } from 'lucide-react';

interface StatsSectionProps {
  overallStats: {
    totalWebsites: number;
    totalKeywords: number;
    avgPosition: number;
    improvingWebsites: number;
    topWebsite: string;
  };
}

export function StatsSection({ overallStats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <StatCard
        title="Websites Tracked"
        value={overallStats.totalWebsites}
        icon={<Globe className="h-5 w-5" />}
      />
      <StatCard
        title="Total Keywords"
        value={overallStats.totalKeywords}
        icon={<Search className="h-5 w-5" />}
      />
      <StatCard
        title="Average Position"
        value={`#${overallStats.avgPosition}`}
        icon={<Award className="h-5 w-5" />}
      />
      <StatCard
        title="Improving Websites"
        value={`${overallStats.improvingWebsites} of ${overallStats.totalWebsites}`}
        icon={<TrendingUp className="h-5 w-5" />}
      />
    </div>
  );
}
