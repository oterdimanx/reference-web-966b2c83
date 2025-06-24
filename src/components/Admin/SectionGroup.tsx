
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionGroupProps {
  title: string;
  icon: React.ElementType;
  colorClass?: string;
  groupKey: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function SectionGroup({ 
  title, 
  icon: Icon,
  colorClass = "bg-blue-500", 
  isOpen,
  onToggle,
  children 
}: SectionGroupProps) {
  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <div className={`flex items-center rounded-t-lg p-3 ${colorClass}`}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center w-full text-white font-semibold text-left">
              <Icon size={20} className="mr-2" />
              {title}
              {isOpen ? (
                <ChevronDown className="ml-auto" size={20} />
              ) : (
                <ChevronRight className="ml-auto" size={20} />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="border border-t-0 rounded-b-lg p-4 space-y-6">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
