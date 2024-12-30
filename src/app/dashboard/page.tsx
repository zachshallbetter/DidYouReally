'use client';

import { useEffect, useState } from 'react';
import { ResumeTable } from '@/components/dashboard/ResumeTable';
import { Recommendations } from '@/components/dashboard/Recommendations';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { TrackingLogs } from '@/components/dashboard/TrackingLogs';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { UploadResume } from '@/components/UploadResume';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Resume, ResumeEvent, TrackingLog } from '@prisma/client';

interface DashboardData {
  resumes: (Resume & { 
    company: { name: string };
    trackingLogs: TrackingLog[];
    events: ResumeEvent[];
  })[];
  metrics: {
    events: Array<{ type: string; _count: number }>;
    locations: Array<{ location: string; _count: number }>;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    upload: false,
    resumes: true,
    logs: false,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        // Log error to terminal in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Runtime Error:', errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handleError = (error: unknown, context: string) => {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    // Log error to terminal in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Runtime Error in ${context}:`, errorMessage);
    }
    return errorMessage;
  };

  const handleEdit = async (resumeId: string, formData: any) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update resume');
      window.location.reload();
    } catch (error) {
      handleError(error, 'handleEdit');
    }
  };

  const handleArchive = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/archive`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to archive resume');
      window.location.reload();
    } catch (error) {
      handleError(error, 'handleArchive');
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete resume');
      window.location.reload();
    } catch (error) {
      handleError(error, 'handleDelete');
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      handleError(error, 'handleCopyUrl');
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getLatestActivity = (data: DashboardData) => {
    if (!data.resumes.length) return null;
    
    const allEvents = data.resumes.flatMap(resume => 
      resume.events.map(event => ({
        ...event,
        resumeId: resume.id
      }))
    );
    
    if (!allEvents.length) return null;
    
    return allEvents.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0].createdAt;
  };

  const getTotalViews = (data: DashboardData) => {
    return data.resumes.reduce((total, resume) => 
      total + resume.viewCount, 0
    );
  };

  const getUniqueLocations = (data: DashboardData) => {
    const locations = new Set(
      data.resumes.flatMap(resume => 
        resume.trackingLogs.map(log => log.location)
      ).filter(Boolean)
    );
    return locations.size;
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h2 className="text-lg font-semibold text-destructive">Error</h2>
          <p className="mt-2 text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Dashboard</h1>
        <ThemeToggle />
      </div>

      {data && (
        <>
          <StatsOverview
            totalResumes={data.resumes.length}
            totalViews={getTotalViews(data)}
            uniqueLocations={getUniqueLocations(data)}
            latestActivity={getLatestActivity(data)}
            loading={loading}
          />
          
          <div className="grid gap-4">
            <CollapsibleSection
              title="Recommendations"
              description="Insights and suggestions to improve your resume performance"
              isExpanded={expandedSections.recommendations}
              onToggle={() => toggleSection('recommendations')}
            >
              <Recommendations
                resumes={data.resumes}
                logs={data.logs}
                loading={loading}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Add New Resume"
              description="Upload a new resume to track its performance"
              isExpanded={expandedSections.upload}
              onToggle={() => toggleSection('upload')}
              showAdd
              onAdd={() => toggleSection('upload')}
            >
              <UploadResume onUploadComplete={() => window.location.reload()} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Active Resumes"
              description="Currently tracked resumes and their details"
              isExpanded={expandedSections.resumes}
              onToggle={() => toggleSection('resumes')}
            >
              <ResumeTable
                resumes={data.resumes}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onCopyUrl={handleCopyUrl}
                loading={loading}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Tracking Logs"
              description="Recent resume view activity"
              isExpanded={expandedSections.logs}
              onToggle={() => toggleSection('logs')}
            >
              <TrackingLogs 
                logs={data.logs} 
                loading={loading}
              />
            </CollapsibleSection>
          </div>
        </>
      )}
    </div>
  );
} 