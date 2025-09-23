import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Code2 } from 'lucide-react';
import { generateTrackingScript } from '@/services/eventTrackingService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrackingScriptPopoverProps {
  websiteId: string;
  websiteDomain: string;
}

export const TrackingScriptPopover: React.FC<TrackingScriptPopoverProps> = ({
  websiteId,
  websiteDomain,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleCopyScript = () => {
    const script = generateTrackingScript(websiteId);
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast({
      title: t('trackingScriptPage', 'scriptCopied'),
      description: t('trackingScriptPage', 'scriptCopiedDescription'),
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const trackingScript = generateTrackingScript(websiteId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
          title={t('trackingScriptPage', 'generateScript')}
        >
          <Code2 size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">
              {t('trackingScriptPage', 'generateScript')}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {websiteDomain}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t('trackingScriptPage', 'scriptInstructions')}
            </p>
            <Textarea
              value={trackingScript}
              readOnly
              className="text-xs font-mono resize-none"
              rows={6}
            />
          </div>
          
          <Button
            onClick={handleCopyScript}
            className="w-full"
            size="sm"
          >
            {copied ? (
              <>
                <Check size={14} className="mr-2" />
                {t('trackingScriptPage', 'copied')}
              </>
            ) : (
              <>
                <Copy size={14} className="mr-2" />
                {t('trackingScriptPage', 'copy')}
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};