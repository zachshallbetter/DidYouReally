"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";

export function ResumeStats({ className }: { className?: string }) {
  const { resumes } = useAppStore();

  // Calculate state distributions
  const stateDistribution = resumes.reduce((acc, resume) => {
    acc[resume.state] = (acc[resume.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalResumes = resumes.length;

  const stateLabels = {
    not_opened: "Not Opened",
    recently_viewed: "Recently Viewed",
    frequently_accessed: "Frequently Accessed",
    multi_device_viewed: "Multi-Device",
    cloud_accessed: "Cloud Accessed",
    expired: "Expired"
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Resume States</CardTitle>
        <CardDescription>Distribution of resume engagement states</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(stateLabels).map(([state, label]) => {
            const count = stateDistribution[state] || 0;
            const percentage = totalResumes ? Math.round((count / totalResumes) * 100) : 0;

            return (
              <div key={state} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">
                    {count} ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 