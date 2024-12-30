import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet, Cloud, MapPin, Clock, Eye, Link, Copy } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Resume } from "@/types/resume";

interface ResumeDetailsSheetProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyUrl: (url: string) => void;
}

export function ResumeDetailsSheet({ resume, open, onOpenChange, onCopyUrl }: ResumeDetailsSheetProps) {
  if (!resume) return null;

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-orange-500" />;
      default:
        return <Cloud className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[90vw] max-w-[1200px] overflow-y-auto sm:max-w-[1000px]"
      >
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center justify-between">
            <span>{resume.jobTitle}</span>
            <Badge variant="outline" className="capitalize">
              {resume.calculatedState?.replace('_', ' ')}
            </Badge>
          </SheetTitle>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{resume.company.name}</div>
              <SheetDescription className="text-sm text-muted-foreground">
                {resume.company.location}
              </SheetDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => onCopyUrl(resume.trackingUrl)}
            >
              <Link className="h-4 w-4" />
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Views</span>
                    <span className="font-medium">{resume.viewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recent Views (7d)</span>
                    <span className="font-medium">{resume.recentViewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. View Duration</span>
                    <span className="font-medium">{resume.avgViewDuration}s</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Unique Locations</span>
                    <span className="font-medium">{resume.uniqueLocations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recent Locations (7d)</span>
                    <span className="font-medium">{resume.uniqueLocationsLast7Days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cloud Access</span>
                    <span className="font-medium">{resume.cloudAccessCount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resume.events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium capitalize">{event.type}</div>
                        <div className="text-xs text-muted-foreground">via {event.metadata.source}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {resume.events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <div className="text-sm font-medium capitalize">{event.type}</div>
                        <div className="text-xs text-muted-foreground">
                          via {event.metadata.source} • {event.metadata.deviceType}
                        </div>
                      </div>
                      <div className="text-sm">
                        {format(new Date(event.createdAt), 'PPpp')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {resume.trackingLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{log.location}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.ipAddress} • {log.isCloudService ? 'Cloud Service' : 'Direct Access'}
                        </div>
                      </div>
                      <div className="text-sm">
                        {format(new Date(log.createdAt), 'PPpp')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {resume.trackingLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(log.deviceType)}
                          <span className="text-sm font-medium capitalize">{log.deviceType}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[400px]">
                          {log.userAgent}
                        </div>
                      </div>
                      <div className="text-sm">
                        {format(new Date(log.createdAt), 'PPpp')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 