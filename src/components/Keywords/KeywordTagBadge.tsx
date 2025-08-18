import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface KeywordTagBadgeProps {
  tag: string;
  onRemove?: (tag: string) => void;
  removable?: boolean;
  className?: string;
}

export const KeywordTagBadge = ({ tag, onRemove, removable = false, className }: KeywordTagBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex items-center gap-1 ${className}`}
    >
      {tag}
      {removable && onRemove && (
        <X 
          size={12} 
          className="cursor-pointer hover:text-destructive" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
        />
      )}
    </Badge>
  );
};