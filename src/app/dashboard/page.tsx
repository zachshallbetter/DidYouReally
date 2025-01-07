'use client';

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ResumeStats } from "@/components/dashboard/ResumeStats";
import { TopResumes } from "@/components/dashboard/TopResumes";

export default function DashboardPage() {
  const { resumes, setResumes } = useAppStore();

  useEffect(() => {
    // Initialize with data from API
    async function fetchData() {
      try {
        const response = await fetch('/api/resumes');
        const data = await response.json();
        setResumes(data);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    }

    if (resumes.length === 0) {
      fetchData();
    }
  }, [resumes.length, setResumes]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your resume activity and engagement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Resumes</CardTitle>
            <CardDescription>Active resumes in circulation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{resumes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>Cumulative resume views</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {resumes.reduce((sum, resume) => sum + resume.viewCount, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active States</CardTitle>
            <CardDescription>Resumes with recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {resumes.filter(resume => 
                ['recently_viewed', 'frequently_accessed', 'multi_device_viewed'].includes(resume.state)
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ResumeStats className="md:col-span-2 lg:col-span-1" />
        <TopResumes className="md:col-span-2" />
      </div>

      <RecentActivity />
    </div>
  );
} 