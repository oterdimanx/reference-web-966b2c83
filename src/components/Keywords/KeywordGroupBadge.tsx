import { Badge } from "@/components/ui/badge";

interface KeywordGroupBadgeProps {
  groupName?: string;
  groupColor?: string;
  className?: string;
}

export const KeywordGroupBadge = ({ groupName, groupColor, className }: KeywordGroupBadgeProps) => {
  if (!groupName) return null;

  return (
    <Badge 
      variant="secondary" 
      className={`text-xs ${className}`}
      style={{ 
        backgroundColor: groupColor ? `${groupColor}20` : undefined,
        borderColor: groupColor || undefined,
        color: groupColor || undefined
      }}
    >
      {groupName}
    </Badge>
  );
};