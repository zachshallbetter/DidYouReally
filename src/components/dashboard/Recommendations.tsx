import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, subDays, startOfDay, startOfWeek, startOfMonth, isWithinInterval, addDays } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { useState, type ReactNode } from "react";
import { TrendingUp, AlertTriangle, Lightbulb, BarChart as BarChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Resume = NonNullable<Awaited<ReturnType<PrismaClient['resume']['findFirst']>>>;
type TrackingLog = NonNullable<Awaited<ReturnType<PrismaClient['trackingLog']['findFirst']>>>;
type ResumeEvent = NonNullable<Awaited<ReturnType<PrismaClient['resumeEvent']['findFirst']>>>;

type EventType = 'view' | 'send' | 'open' | 'click' | 'download';

interface ChartData {
  date: string;
  view: number;
  send: number;
  open: number;
  click: number;
  download: number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface LocationData {
  location: string;
  count: number;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface RecommendationsProps {
  resumes?: Resume[];
  logs?: TrackingLog[];
  events?: ResumeEvent[];
  loading?: boolean;
}

function getTimeRange(range: string): TimeRange {
  const now = new Date();
  switch (range) {
    case 'today':
      return {
        start: startOfDay(now),
        end: now
      };
    case 'week':
      return {
        start: startOfWeek(now),
        end: now
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: now
      };
    case 'all':
    default:
      return {
        start: subDays(now, 365),
        end: now
      };
  }
}

function getChartData(events: ResumeEvent[] | undefined, timeRange: TimeRange): ChartData[] {
  if (!events || !Array.isArray(events)) return [];

  console.log('Processing events:', events.length);
  console.log('Time range:', timeRange);

  // Create a map to store event counts by date and type
  const eventsByDate = new Map<string, { [key in EventType]: number }>();

  // Initialize dates in the range
  let currentDate = startOfDay(timeRange.start);
  const endDate = startOfDay(timeRange.end);
  
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    eventsByDate.set(dateStr, {
      view: 0,
      send: 0,
      open: 0,
      click: 0,
      download: 0
    });
    currentDate = addDays(currentDate, 1);
  }

  // Aggregate events by date
  events.forEach(event => {
    if (!event.createdAt || !event.type) {
      console.log('Skipping invalid event:', event);
      return;
    }

    const eventDate = startOfDay(new Date(event.createdAt));
    const dateStr = format(eventDate, 'yyyy-MM-dd');
    console.log('Processing event:', { date: dateStr, type: event.type });

    if (isWithinInterval(eventDate, { start: timeRange.start, end: endDate })) {
      const dateEvents = eventsByDate.get(dateStr);
      if (dateEvents && event.type in dateEvents) {
        dateEvents[event.type as EventType]++;
        console.log('Updated counts for', dateStr, ':', dateEvents);
      } else {
        console.log('No matching date entry for:', dateStr);
      }
    } else {
      console.log('Event outside time range:', dateStr);
    }
  });

  // Convert map to array and sort by date
  const result = Array.from(eventsByDate.entries())
    .map(([date, counts]) => ({
      date,
      ...counts
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('Final chart data:', result);
  return result;
}

function getDeviceData(logs: TrackingLog[] | undefined, timeRange: TimeRange): DeviceData[] {
  if (!logs || !Array.isArray(logs)) return [];
  
  const filteredLogs = logs.filter(log => 
    log.createdAt && isWithinInterval(new Date(log.createdAt), timeRange)
  );
  
  const devices = filteredLogs.reduce((acc: { [key: string]: number }, log) => {
    if (!log?.deviceType) return acc;
    acc[log.deviceType] = (acc[log.deviceType] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(devices)
    .map(([device, count]) => ({
      device,
      count
    }))
    .sort((a, b) => b.count - a.count);
}

function getLocationData(logs: TrackingLog[] | undefined, timeRange: TimeRange): LocationData[] {
  if (!logs || !Array.isArray(logs)) return [];
  
  const filteredLogs = logs.filter(log => 
    log.createdAt && isWithinInterval(new Date(log.createdAt), timeRange)
  );
  
  const locations = filteredLogs.reduce((acc: { [key: string]: number }, log) => {
    const location = log?.location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(locations)
    .map(([location, count]) => ({
      location,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function ChartSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function Recommendations({ resumes = [], logs = [], events = [], loading }: RecommendationsProps) {
  const LoadingCard = () => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-6 w-[80px]" />
        </div>
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Insights
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {loading ? (
                <>
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                </>
              ) : (
                resumes.map(resume => {
                  const resumeLogs = logs.filter(log => log.resumeId === resume.id);
                  const viewCount = resumeLogs.length;
                  const uniqueLocations = new Set(resumeLogs.map(log => log.location).filter(Boolean)).size;
                  
                  return (
                    <Card key={resume.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{resume.jobTitle}</span>
                          <Badge variant="outline">{viewCount} views</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {uniqueLocations} unique locations
                        </div>
                        {viewCount === 0 && (
                          <div className="flex items-center gap-2 text-xs text-amber-500">
                            <AlertTriangle className="h-3 w-3" />
                            No views yet - consider sharing more widely
                          </div>
                        )}
                        {viewCount > 0 && viewCount < 5 && (
                          <div className="flex items-center gap-2 text-xs text-blue-500">
                            <Lightbulb className="h-3 w-3" />
                            Getting traction - optimize for more visibility
                          </div>
                        )}
                        {viewCount >= 5 && (
                          <div className="flex items-center gap-2 text-xs text-green-500">
                            <TrendingUp className="h-3 w-3" />
                            Good engagement - maintain momentum
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Recommended Actions</h4>
            <div className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-[72px] w-full" />
                  <Skeleton className="h-[72px] w-full" />
                  <Skeleton className="h-[72px] w-full" />
                </>
              ) : (
                <>
                  {resumes.some(r => !r.jobListingUrl) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Some resumes are missing job listing URLs. Adding these can help track application context.
                      </AlertDescription>
                    </Alert>
                  )}
                  {logs.some(log => log.isBot) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Bot traffic detected. Consider implementing additional tracking protection.
                      </AlertDescription>
                    </Alert>
                  )}
                  {resumes.some(r => {
                    const resumeLogs = logs.filter(log => log.resumeId === r.id);
                    return resumeLogs.length === 0;
                  }) && (
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        Some resumes have no views. Consider sharing them on relevant platforms or with recruiters.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Best Practices</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {loading ? (
                <>
                  <Skeleton className="h-[160px] w-full" />
                  <Skeleton className="h-[160px] w-full" />
                </>
              ) : (
                <>
                  <Card className="p-4">
                    <h5 className="text-sm font-medium mb-2">Tracking Optimization</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Use unique versions for different job applications</li>
                      <li>• Add job listing URLs for context</li>
                      <li>• Monitor view durations for engagement</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h5 className="text-sm font-medium mb-2">Distribution Strategy</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Share tracking links in applications</li>
                      <li>• Use different versions for different roles</li>
                      <li>• Track which platforms drive most views</li>
                    </ul>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}