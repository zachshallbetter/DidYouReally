import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, MapPin, Clock } from "lucide-react";
import { type TrackingLog } from '@/lib/types';
import type { Database } from '@/types/supabase';

type Resume = Database['public']['Tables']['resumes']['Row'];

interface StatsOverviewProps {
  resumes: Resume[];
  logs: Partial<TrackingLog>[];
}

export function StatsOverview({ resumes, logs }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumes.length}</div>
          <p className="text-xs text-muted-foreground">Active resumes being tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{logs.length}</div>
          <p className="text-xs text-muted-foreground">Resume views tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(logs.map(log => `${log.city},${log.country}`).filter(Boolean)).size}
          </div>
          <p className="text-xs text-muted-foreground">Different viewing locations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {logs[0]?.timestamp ? new Date(logs[0].timestamp).toLocaleDateString() : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">Most recent view</p>
        </CardContent>
      </Card>
    </div>
  );
} 