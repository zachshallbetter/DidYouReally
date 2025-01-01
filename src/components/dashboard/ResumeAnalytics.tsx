import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow, formatDuration } from 'date-fns';
import { 
  MonitorSmartphone, 
  Globe, 
  Clock, 
  Activity, 
  Cloud,
  Timer,
  Users,
  Gauge
} from 'lucide-react';
import { Resume, ResumeState } from '@/types/resume';

interface ResumeAnalyticsProps {
  resumeId: string;
}

interface AnalyticsData {
  resume: Resume;
  events: Array<{
    id: string;
    type: string;
    metadata: any;
    createdAt: string;
  }>;
  analytics: {
    recentViews: number;
    totalViews: number;
    deviceDistribution: Array<{
      deviceType: string;
      count: number;
      percentage: number;
    }>;
    locationCount: number;
    stateHistory: Array<{
      timestamp: string;
      previousState: ResumeState | null;
      newState: ResumeState;
    }>;
    engagementScore: number;
    metrics: {
      avgViewDuration: number;
      deviceAccessCount: number;
      cloudAccessCount: number;
      lastAccessedAt: string | null;
    };
  };
}

export function ResumeAnalytics({ resumeId }: ResumeAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`/api/resumes/${resumeId}/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [resumeId]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  if (error || !data) {
    return <div className="text-destructive p-4">Error loading analytics: {error}</div>;
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="devices">Devices</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 7 days of activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Recent Views</span>
                  </div>
                  <span className="font-medium">{data.analytics.recentViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Unique Locations</span>
                  </div>
                  <span className="font-medium">{data.analytics.locationCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>Avg. View Time</span>
                  </div>
                  <span className="font-medium">
                    {formatDuration({ seconds: data.analytics.metrics.avgViewDuration })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Score</CardTitle>
              <CardDescription>Based on views, locations, and duration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{data.analytics.engagementScore}%</span>
                  </div>
                  <Progress value={data.analytics.engagementScore} />
                </div>
                <div className="pt-4 text-sm text-muted-foreground">
                  {data.analytics.engagementScore >= 75 ? (
                    "High engagement - Your resume is getting significant attention"
                  ) : data.analytics.engagementScore >= 50 ? (
                    "Good engagement - Your resume is being viewed regularly"
                  ) : data.analytics.engagementScore >= 25 ? (
                    "Moderate engagement - Your resume has some activity"
                  ) : (
                    "Low engagement - Your resume needs more visibility"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="engagement">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Detailed view of resume engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Views</span>
                  </div>
                  <div className="text-2xl font-bold">{data.analytics.totalViews}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Unique Devices</span>
                  </div>
                  <div className="text-2xl font-bold">{data.analytics.metrics.deviceAccessCount}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">View Duration</h4>
                <Progress 
                  value={Math.min(100, (data.analytics.metrics.avgViewDuration / 300) * 100)} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  Average view time: {formatDuration({ seconds: data.analytics.metrics.avgViewDuration })}
                </p>
              </div>

              {data.analytics.metrics.lastAccessedAt && (
                <div className="pt-4 text-sm text-muted-foreground">
                  Last viewed {formatDistanceToNow(new Date(data.analytics.metrics.lastAccessedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="devices">
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Access patterns across devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.analytics.deviceDistribution.map((device) => (
                <div key={device.deviceType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device.deviceType === 'cloud' ? (
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                    ) : device.deviceType === 'desktop' ? (
                      <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="capitalize">{device.deviceType}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={device.percentage} className="w-[100px]" />
                    <div className="min-w-[90px] text-right">
                      <span className="font-medium">{device.count}</span>
                      <span className="text-muted-foreground ml-1">({device.percentage}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>State History</CardTitle>
            <CardDescription>Resume state changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {data.analytics.stateHistory.map((change, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {change.newState.toLowerCase().replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      {change.previousState && (
                        <p className="text-sm text-muted-foreground">
                          From: {change.previousState.toLowerCase().replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 