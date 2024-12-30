import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, MapPin, Clock, TrendingUp, AlertTriangle, Lightbulb, BarChart } from "lucide-react";
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
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResumes}</div>
          <p className="text-xs text-muted-foreground">Active resumes being tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <BarChart className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViews}</div>
          <p className="text-xs text-muted-foreground">Resume views tracked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueLocations}</div>
          <p className="text-xs text-muted-foreground">Different viewing locations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedDate}</div>
          <p className="text-xs text-muted-foreground">Most recent view</p>
        </CardContent>
      </Card>
    </div>
  );
}