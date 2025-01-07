"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useAppStore } from "@/lib/store";
import { Eye, Users, Globe } from "lucide-react";

export function RecentActivity({ className }: { className?: string }) {
  const { resumes } = useAppStore();

  // Get recent activities based on lastAccessedAt
  const recentActivities = resumes
    .filter(resume => resume.lastAccessedAt)
    .sort((a, b) => 
      new Date(b.lastAccessedAt!).getTime() - new Date(a.lastAccessedAt!).getTime()
    )
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest resume interactions and views</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {recentActivities.map((resume) => (
              <div key={resume.id} className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-muted">
                  {resume.state === 'multi_device_viewed' ? (
                    <Users className="h-4 w-4" />
                  ) : resume.cloudAccessCount > 0 ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{resume.job_title}</span>
                    <Badge variant="outline" className="capitalize">
                      {resume.state.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {resume.company.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last viewed {formatDistanceToNow(new Date(resume.lastAccessedAt!), { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-auto text-sm">
                  {resume.viewCount} views
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 