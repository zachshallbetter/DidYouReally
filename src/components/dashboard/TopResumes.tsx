"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

export function TopResumes({ className }: { className?: string }) {
  const { resumes } = useAppStore();

  // Calculate engagement score for each resume
  const topResumes = resumes
    .map(resume => ({
      ...resume,
      engagementScore: Math.round(
        (resume.viewCount * 30 +
        resume.uniqueLocations * 20 +
        resume.deviceAccessCount * 30 +
        (resume.cloudAccessCount > 0 ? 20 : 0)) / 2
      )
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);

  const maxScore = Math.max(...topResumes.map(r => r.engagementScore));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Performing Resumes</CardTitle>
        <CardDescription>Resumes with highest engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topResumes.map((resume) => (
            <div key={resume.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{resume.job_title}</span>
                    <Badge variant="outline" className="capitalize">
                      {resume.state.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{resume.company.name}</span>
                    <span>•</span>
                    <span>
                      {resume.lastAccessedAt
                        ? formatDistanceToNow(new Date(resume.lastAccessedAt), { addSuffix: true })
                        : 'Not viewed yet'}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {resume.engagementScore}%
                </div>
              </div>
              <Progress 
                value={(resume.engagementScore / maxScore) * 100} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>{resume.viewCount} views</div>
                <div>{resume.uniqueLocations} locations</div>
                <div>{resume.deviceAccessCount} devices</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 