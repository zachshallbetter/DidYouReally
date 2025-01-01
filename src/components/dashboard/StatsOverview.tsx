import { Users, Eye, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  totalResumes: number;
  totalViews: number;
  uniqueLocations: number;
  latestActivity: any;
  loading?: boolean;
}

export function StatsOverview({ totalResumes, totalViews, uniqueLocations, latestActivity, loading }: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Resumes",
      value: totalResumes,
      icon: Users,
    },
    {
      title: "Total Views", 
      value: totalViews,
      icon: Eye,
    },
    {
      title: "Unique Locations",
      value: uniqueLocations,
      icon: MapPin,
    },
    {
      title: "Latest Activity",
      value: latestActivity ? "Active" : "No activity",
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium">{stat.title}</div>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}