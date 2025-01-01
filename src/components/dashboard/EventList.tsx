import { formatDistanceToNow } from "date-fns";
import { Eye, Mail, Link2, Globe, Monitor, Smartphone, Tablet, Cloud } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  type: string;
  metadata: {
    source: string;
    deviceType?: string;
    location?: string;
  };
  createdAt: string | Date;
}

interface EventListProps {
  events: Event[];
  loading?: boolean;
}

const EVENT_ICONS = {
  view: Eye,
  email: Mail,
  link: Link2,
  other: Globe
} as const;

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
  linkedin: "bg-blue-100 text-blue-800",
  email: "bg-green-100 text-green-800",
  referral: "bg-purple-100 text-purple-800",
  direct: "bg-gray-100 text-gray-800"
} as const;

export function EventList({ events, loading }: EventListProps) {
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

  if (!events.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events recorded yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {events.map((event) => {
          const EventIcon = EVENT_ICONS[event.type as keyof typeof EVENT_ICONS] || EVENT_ICONS.other;
          const DeviceIcon = event.metadata.deviceType ? 
            DEVICE_ICONS[event.metadata.deviceType as keyof typeof DEVICE_ICONS] || DEVICE_ICONS.cloud
            : null;
          const deviceColor = event.metadata.deviceType ?
            DEVICE_COLORS[event.metadata.deviceType as keyof typeof DEVICE_COLORS] || "text-gray-500"
            : "text-gray-500";
          const sourceBadgeColor = SOURCE_BADGES[event.metadata.source as keyof typeof SOURCE_BADGES] || SOURCE_BADGES.direct;

          return (
            <div key={event.id} className="flex items-start gap-4">
              <div className="mt-1">
                <EventIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm">Resume was viewed</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${sourceBadgeColor}`}
                  >
                    via {event.metadata.source}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
                  {DeviceIcon && (
                    <>
                      <span>•</span>
                      <DeviceIcon className={`h-3 w-3 ${deviceColor}`} />
                      <span className="capitalize">{event.metadata.deviceType}</span>
                    </>
                  )}
                  {event.metadata.location && (
                    <>
                      <span>•</span>
                      <span>from {event.metadata.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
} 