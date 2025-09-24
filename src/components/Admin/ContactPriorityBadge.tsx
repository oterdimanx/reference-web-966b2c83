import { Badge } from '@/components/ui/badge';

interface ContactPriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export const ContactPriorityBadge = ({ priority }: ContactPriorityBadgeProps) => {
  const getVariant = () => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'low':
        return 'Low Priority';
      case 'medium':
        return 'Medium Priority';
      case 'high':
        return 'High Priority';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getVariant()}>
      {getLabel()}
    </Badge>
  );
};