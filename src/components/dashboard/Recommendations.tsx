import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, TrendingUp, Lightbulb, Globe, Laptop, Smartphone } from "lucide-react";
import { LineChart, BarChart, DoughnutChart } from "@/components/ui/charts";
import { type TrackingLog } from '@/lib/types';
import type { Database } from '@/types/supabase';

type Resume = Database['public']['Tables']['resumes']['Row'];

interface RecommendationsProps {
  resumes: Resume[];
  logs: Partial<TrackingLog>[];
}

export function Recommendations({ resumes, logs }: RecommendationsProps) {
  const getChartData = () => {
    // Get engagement data
    const viewsByDate = logs.reduce((acc: Record<string, number>, log) => {
      if (!log.timestamp) return acc;
      const date = new Date(log.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Get device data
    const deviceTypes = logs.reduce((acc: Record<string, number>, log) => {
      if (!log.user_agent) return acc;
      const userAgent = log.user_agent.toLowerCase();
      const type = userAgent.includes('mobile') ? 'Mobile' :
                   userAgent.includes('tablet') ? 'Tablet' : 'Desktop';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Get location data
    const locations = logs.reduce((acc: Record<string, number>, log) => {
      const location = log.country || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    return {
      engagement: {
        labels: Object.keys(viewsByDate),
        datasets: [{
          label: 'Views',
          data: Object.values(viewsByDate),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
        }]
      },
      devices: {
        labels: Object.keys(deviceTypes),
        datasets: [{
          data: Object.values(deviceTypes),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 51, 234, 0.8)',
          ],
        }]
      },
      locations: {
        labels: Object.keys(locations).slice(0, 5),
        datasets: [{
          label: 'Views by Location',
          data: Object.values(locations).slice(0, 5),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
        }]
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <h5 className="text-sm font-medium">Needs Attention</h5>
            </div>
            <div className="text-2xl font-bold">
              {resumes.filter(r => !r.job_listing_url || logs.filter(log => log.resume_id === r.id).length === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Resumes requiring action</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Eye className="h-4 w-4" />
              <h5 className="text-sm font-medium">Being Reviewed</h5>
            </div>
            <div className="text-2xl font-bold">
              {resumes.filter(r => logs.filter(log => 
                log.timestamp && new Date(log.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
              ).length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Active in last 7 days</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="h-4 w-4" />
              <h5 className="text-sm font-medium">High Engagement</h5>
            </div>
            <div className="text-2xl font-bold">
              {resumes.filter(r => {
                const resumeLogs = logs.filter(log => log.resume_id === r.id);
                return resumeLogs.length >= 5 && 
                       resumeLogs.some(log => log.view_duration && log.view_duration > 30);
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">High view time & count</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 col-span-1">
          <h4 className="text-sm font-medium mb-2">Device Distribution</h4>
          <DoughnutChart data={getChartData().devices} height={150} />
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Laptop className="h-3 w-3 text-indigo-500" />
              <span>Desktop: {((logs.filter(l => 
                l.user_agent?.toLowerCase().includes('mobile') === false
              ).length / logs.length) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Smartphone className="h-3 w-3 text-blue-500" />
              <span>Mobile: {((logs.filter(l => 
                l.user_agent?.toLowerCase().includes('mobile') === true
              ).length / logs.length) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>
        <Card className="p-4 col-span-2">
          <h4 className="text-sm font-medium mb-2">Engagement Over Time</h4>
          <LineChart data={getChartData().engagement} height={150} />
        </Card>
      </div>

      {/* Location Chart */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Top Viewing Locations</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>{new Set(logs.map(l => l.country)).size} Countries</span>
          </div>
        </div>
        <BarChart data={getChartData().locations} height={80} />
      </Card>

      {/* Performance Insights */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Insights
          </h4>
          <Badge variant="outline" className="text-xs">
            {resumes.length} Resumes
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {resumes.map(resume => {
            const resumeLogs = logs.filter(log => log.resume_id === resume.id);
            const viewCount = resumeLogs.length;
            const uniqueLocations = new Set(resumeLogs.map(log => `${log.city},${log.country}`).filter(Boolean)).size;
            const avgDuration = resumeLogs.length > 0 
              ? resumeLogs.reduce((acc, log) => acc + (log.view_duration || 0), 0) / resumeLogs.length 
              : 0;
            
            return (
              <Card key={resume.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{resume.job_title}</span>
                    <Badge variant="outline">{viewCount} views</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {uniqueLocations} unique locations
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. view time: {avgDuration.toFixed(1)}s
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
          })}
        </div>
      </div>

      {/* Action Items */}
      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Recommended Actions</h4>
        <div className="space-y-2">
          {resumes.some(r => !r.job_listing_url) && (
            <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {resumes.filter(r => !r.job_listing_url).length} resumes missing job listing URLs
              </AlertDescription>
            </Alert>
          )}
          {logs.some(log => log.is_bot) && (
            <Alert variant="destructive" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {logs.filter(l => l.is_bot).length} bot visits detected - consider additional protection
              </AlertDescription>
            </Alert>
          )}
          {resumes.some(r => {
            const resumeLogs = logs.filter(log => log.resume_id === r.id);
            return resumeLogs.length === 0;
          }) && (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-500">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                {resumes.filter(r => logs.filter(l => l.resume_id === r.id).length === 0).length} resumes 
                have no views - consider broader distribution
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Best Practices */}
      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Best Practices</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="p-4">
            <h5 className="text-sm font-medium mb-2">Tracking Optimization</h5>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Use unique versions for different applications</li>
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
        </div>
      </div>
    </div>
  );
} 