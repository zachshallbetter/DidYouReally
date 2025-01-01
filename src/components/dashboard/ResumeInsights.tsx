import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Globe, 
  Clock, 
  Laptop,
  Smartphone,
  Tablet,
  Cloud,
  Building2,
  MapPin,
  Eye,
  Link2
} from "lucide-react";
import { Resume } from "@/types/resume";
import { formatDistanceToNow } from "date-fns";

interface ResumeInsightsProps {
  resume: Resume;
}

export function ResumeInsights({ resume }: ResumeInsightsProps) {
  // Calculate view trend
  const recentViews = resume.events
    .filter(e => 
      e.type === 'view' && 
      new Date(e.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
  const viewTrend = recentViews > (resume.viewCount / 4);

  // Calculate device distribution
  const deviceStats = {
    desktop: resume.events.filter(e => e.metadata?.deviceType === 'desktop').length,
    mobile: resume.events.filter(e => e.metadata?.deviceType === 'mobile').length,
    tablet: resume.events.filter(e => e.metadata?.deviceType === 'tablet').length,
    cloud: resume.cloudAccessCount
  };

  const totalViews = resume.viewCount;
  const devicePercentages = Object.entries(deviceStats).map(([device, count]) => ({
    device,
    count,
    percentage: totalViews ? Math.round((count / totalViews) * 100) : 0
  }));

  // Calculate engagement score
  const engagementScore = Math.round(
    (resume.viewCount * 2 + 
    resume.uniqueLocations * 3 + 
    resume.cloudAccessCount * 1.5 + 
    resume.deviceAccessCount * 1.5) / 10
  );

  const insights = [
    {
      title: "View Trend",
      value: viewTrend ? "Increasing" : "Decreasing",
      icon: viewTrend ? TrendingUp : TrendingDown,
      color: viewTrend ? "text-green-500" : "text-red-500"
    },
    {
      title: "Engagement Score",
      value: engagementScore,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Geographic Reach",
      value: resume.uniqueLocationsLast7Days,
      icon: Globe,
      color: "text-purple-500"
    },
    {
      title: "Last Activity",
      value: resume.lastViewDate ? "Active" : "Inactive",
      icon: Clock,
      color: resume.lastViewDate ? "text-green-500" : "text-gray-500"
    }
  ];

  const deviceIcons = {
    desktop: Laptop,
    mobile: Smartphone,
    tablet: Tablet,
    cloud: Cloud
  };

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <Card key={insight.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {insight.title}
                </CardTitle>
                <insight.icon className={`h-4 w-4 ${insight.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insight.value}</div>
                {insight.title === "Engagement Score" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on views, locations, and access patterns
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devicePercentages.map(({ device, count, percentage }) => {
                const Icon = deviceIcons[device as keyof typeof deviceIcons];
                const deviceColors = {
                  desktop: "text-blue-500",
                  mobile: "text-green-500",
                  tablet: "text-orange-500",
                  cloud: "text-purple-500"
                };
                const color = deviceColors[device as keyof typeof deviceColors];
                
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="capitalize">{device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count} views</span>
                      <Badge variant="secondary">{percentage}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Company Context */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Company Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{resume.company.name}</span>
                <span>•</span>
                <span className="text-muted-foreground">{resume.company.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{resume.company.location}</span>
              </div>
              {resume.job_listing_url && (
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={resume.job_listing_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:underline"
                  >
                    View Job Listing
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{totalViews} total views</span>
                <span>•</span>
                <span>{resume.uniqueLocations} locations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {devicePercentages.sort((a, b) => b.percentage - a.percentage)[0]?.percentage > 50 && (
                <p className="text-muted-foreground">
                  Most views come from {devicePercentages[0].device} devices ({devicePercentages[0].percentage}%)
                </p>
              )}
              {resume.cloudAccessCount > (resume.viewCount / 2) && (
                <p className="text-muted-foreground">
                  High cloud service access - consider ATS optimization
                </p>
              )}
              {resume.uniqueLocationsLast7Days > 3 && (
                <p className="text-muted-foreground">
                  Wide geographic reach in the last 7 days
                </p>
              )}
              {resume.lastViewDate && (
                <p className="text-muted-foreground">
                  Last viewed {formatDistanceToNow(new Date(resume.lastViewDate), { addSuffix: true })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
} 