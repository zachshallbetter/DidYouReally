import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, MapPin, Clock } from "lucide-react";
import { format } from 'date-fns';

interface StatsOverviewProps {
  totalResumes: number;
  totalViews: number;
  uniqueLocations: number;
  latestActivity: Date | null;
}

export function StatsOverview({ totalResumes, totalViews, uniqueLocations, latestActivity }: StatsOverviewProps) {
  // Get recent activity
  const formattedDate = latestActivity ? format(latestActivity, 'MM/dd/yyyy') : 'No activity';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResumes}</div>
          <p className="text-xs text-muted-foreground">Active resumes being tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViews}</div>
          <p className="text-xs text-muted-foreground">Resume views tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueLocations}</div>
          <p className="text-xs text-muted-foreground">Different viewing locations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedDate}</div>
          <p className="text-xs text-muted-foreground">Most recent view</p>
        </CardContent>
      </Card>
    </div>
  );
} 