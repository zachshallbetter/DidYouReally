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
  resumes: (Resume & { company: { name: string } })[];
  events: ResumeEvent[];
  logs: TrackingLog[];
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
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

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
      console.error('Error updating resume:', error);
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
      console.error('Error archiving resume:', error);
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
      console.error('Error deleting resume:', error);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Dashboard</h1>
        <ThemeToggle />
      </div>

      <StatsOverview
        totalResumes={data.resumes.length}
        totalViews={data.logs.length}
        uniqueLocations={new Set(data.logs.map(log => log.location).filter(Boolean)).size}
        latestActivity={data.logs[0]?.createdAt}
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
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Tracking Logs"
          description="Recent resume view activity"
          isExpanded={expandedSections.logs}
          onToggle={() => toggleSection('logs')}
        >
          <TrackingLogs logs={data.logs} />
        </CollapsibleSection>
      </div>
    </div>
  );
} 