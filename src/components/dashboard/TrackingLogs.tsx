import { formatDistanceToNow } from "date-fns";
import { MapPin, Globe, Monitor, Smartphone, Tablet, Cloud, Building2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";

interface TrackingLog {
  id: string;
  location: string;
  deviceType: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | Date;
  source?: string;
  jobTitle?: string;
  company?: string;
}

interface TrackingLogsProps {
  logs: TrackingLog[];
  loading?: boolean;
}

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  cloud: Cloud
} as const;

const DEVICE_COLORS = {
  desktop: "text-blue-500",
  mobile: "text-green-500",
  tablet: "text-orange-500",
  cloud: "text-purple-500"
} as const;

const SOURCE_BADGES = {
  email: "bg-green-100 text-green-800",
  linkedin: "bg-blue-100 text-blue-800",
  direct: "bg-gray-100 text-gray-800",
  referral: "bg-purple-100 text-purple-800"
} as const;

export function TrackingLogs({ logs, loading }: TrackingLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-3 w-1/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>;
  }

  if (!logs.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tracking logs recorded yet
      </div>
    );
  }

  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return null;
    // Extract browser and OS information
    const browser = userAgent.match(/(Chrome|Safari|Firefox|Edge|MSIE|Opera)\/?\s*(\d+)/i);
    const os = userAgent.match(/(Mac OS X|Windows|Linux|Android|iOS)\s*([0-9_.]+)?/i);
    if (!browser && !os) return userAgent;
    return `${browser?.[1] || ''} ${browser?.[2] || ''} ${os?.[1] || ''}`.trim();
  };

  return (
    <div ref={scrollRef} className="h-[300px] overflow-y-auto pr-4">
      <div className="space-y-2">
        {logs.map((log) => {
          const DeviceIcon = DEVICE_ICONS[log.deviceType as keyof typeof DEVICE_ICONS] || DEVICE_ICONS.cloud;
          const deviceColor = DEVICE_COLORS[log.deviceType as keyof typeof DEVICE_COLORS] || "text-gray-500";
          const sourceBadgeColor = SOURCE_BADGES[log.source as keyof typeof SOURCE_BADGES] || SOURCE_BADGES.direct;
          const formattedUserAgent = formatUserAgent(log.userAgent);

          return (
            <div key={log.id} className="flex items-start gap-2 py-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              <div className="flex flex-col gap-1 min-w-0">
                {(log.jobTitle || log.company) && (
                  <div className="font-medium text-sm">
                    {log.jobTitle && <span>{log.jobTitle}</span>}
                    {log.jobTitle && log.company && <span> at </span>}
                    {log.company && <span>{log.company}</span>}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`text-xs shrink-0 ${sourceBadgeColor}`}
                  >
                    {log.source || 'direct'}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <DeviceIcon className={`h-3 w-3 shrink-0 ${deviceColor}`} />
                  <span className="capitalize text-xs text-muted-foreground">{log.deviceType}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                  {formattedUserAgent && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground truncate" title={log.userAgent}>
                        {formattedUserAgent}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}