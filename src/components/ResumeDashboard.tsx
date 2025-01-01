'use client';

import { useState, useEffect } from 'react';
import { ResumeTable } from '@/components/dashboard/ResumeTable';
import { Recommendations } from '@/components/dashboard/Recommendations';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { toast } from "@/hooks/use-toast";
import { TableResume, Resume, transformTableResumeToResume } from "@/types/resume";
import { ResumeDetailsSheet } from '@/components/dashboard/ResumeDetailsSheet';
import { Insights } from '@/components/dashboard/Insights';
import { TrackingLogs } from './dashboard/TrackingLogs';

interface DashboardData {
  resumes: Array<{
    id: string;
    jobTitle: string;
    company: {
      name: string;
      industry: string;
      location: string;
    };
    jobListingUrl?: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    trackingLogs: Array<{
      id: string;
      location: string;
      deviceType: string;
      ipAddress?: string;
      userAgent?: string;
      createdAt: string;
    }>;
    events: Array<{
      id: string;
      type: string;
      metadata: {
        source: string;
        deviceType?: string;
        location?: string;
      };
      createdAt: string;
    }>;
  }>;
  logs: Array<{
    id: string;
    location: string;
    createdAt: string;
  }>;
  events: Array<{
    id: string;
    type: string;
    createdAt: string;
  }>;
}

export function ResumeDashboard() {
  const [data, setData] = useState<DashboardData>({
    resumes: [],
    logs: [],
    events: []
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    insights: true,
    recommendations: true,
    resumes: true,
    eventAnalytics: true
  });
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'insights'>('details');

  useEffect(() => {
    fetchData();
  }, []);

  const handleResumeClick = (resume: Resume, tab: 'details' | 'insights' = 'details') => {
    setSelectedResume(resume);
    setActiveTab(tab);
    setSheetOpen(true);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      let jsonData;
      
      try {
        jsonData = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(jsonData?.message || 'Failed to fetch data');
      }
      
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid data received from server');
      }
      
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (resumeId: string, data: { job_title: string; company: string; job_listing_url?: string }) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update resume');
      await fetchData();
      toast({
        title: "Success",
        description: "Resume updated successfully",
      });
    } catch (error) {
      console.error('Error updating resume:', error);
      toast({
        title: "Error",
        description: "Failed to update resume",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/archive`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to archive resume');
      await fetchData();
      toast({
        title: "Success",
        description: "Resume archived successfully",
      });
    } catch (error) {
      console.error('Error archiving resume:', error);
      toast({
        title: "Error",
        description: "Failed to archive resume",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete resume');
      await fetchData();
      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "URL copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying URL:', error);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <StatsOverview
          totalResumes={0}
          totalViews={0}
          uniqueLocations={0}
          latestActivity={null}
          loading={true}
        />
        <CollapsibleSection
          title="Active Resumes"
          description="Currently tracked resumes and their details"
          isExpanded={true}
          onToggle={() => {}}
        >
          <ResumeTable
            loading={true}
            resumes={[]}
            fullResumes={[]}
            onEdit={handleEdit}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onCopyUrl={handleCopyUrl}
          />
        </CollapsibleSection>
      </div>
    );
  }

  const totalViews = data.events.filter(event => event.type === 'view').length;
  const uniqueLocations = new Set(data.logs.map(log => log.location).filter(Boolean)).size;
  const latestActivity = data.events[0]?.createdAt || null;

  const tableResumes: TableResume[] = data.resumes.map(resume => ({
    id: resume.id,
    job_title: resume.jobTitle,
    company: resume.company.name,
    job_listing_url: resume.jobListingUrl,
    createdAt: new Date(resume.createdAt),
    updatedAt: new Date(resume.updatedAt),
    views: resume.viewCount
  }));

  const recommendationResumes: Resume[] = data.resumes.map(resume => {
    // Calculate state based on activity
    const lastView = resume.events?.find(e => e.type === 'view');
    const daysSinceLastView = lastView 
      ? Math.floor((Date.now() - new Date(lastView.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;
    
    const uniqueDevices = new Set(resume.events?.filter(e => e.metadata?.deviceType)
      .map(e => e.metadata.deviceType) || []);

    const state = 
      daysSinceLastView === Infinity ? 'not_opened' :
      daysSinceLastView > 30 ? 'expired' :
      uniqueDevices.size > 1 ? 'multi_device_viewed' :
      resume.viewCount > 10 ? 'frequently_accessed' :
      daysSinceLastView < 7 ? 'recently_viewed' :
      'under_consideration';

    return {
      id: resume.id,
      job_title: resume.jobTitle,
      company: resume.company,
      job_listing_url: resume.jobListingUrl,
      createdAt: new Date(resume.createdAt),
      updatedAt: new Date(resume.updatedAt),
      views: resume.viewCount,
      viewCount: resume.viewCount,
      uniqueLocations: new Set(resume.trackingLogs?.map(log => log.location) || []).size,
      deviceAccessCount: resume.events?.filter(e => e.metadata?.deviceType).length || 0,
      cloudAccessCount: resume.events?.filter(e => e.metadata?.source === 'cloud').length || 0,
      avgViewDuration: 0, // TODO: Calculate from logs if available
      recentViewCount: resume.events?.filter(e => 
        e.type === 'view' && 
        new Date(e.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length || 0,
      lastViewDate: lastView ? new Date(lastView.createdAt) : null,
      uniqueLocationsLast7Days: new Set(
        (resume.trackingLogs || [])
          .filter(log => new Date(log.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
          .map(log => log.location)
      ).size,
      distinctDeviceCount: uniqueDevices.size,
      state,
      trackingLogs: (resume.trackingLogs || []).map(log => ({
        ...log,
        createdAt: new Date(log.createdAt)
      })),
      events: (resume.events || []).map(event => ({
        ...event,
        createdAt: new Date(event.createdAt)
      }))
    };
  });

  return (
    <div className="space-y-8">
      <ResumeDetailsSheet
        resume={selectedResume}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCopyUrl={handleCopyUrl}
        defaultTab={activeTab}
      />

      <StatsOverview
        totalResumes={data.resumes.length}
        totalViews={totalViews}
        uniqueLocations={uniqueLocations}
        latestActivity={latestActivity}
      />

      <CollapsibleSection
        title="Insights"
        description="Insights and suggestions to improve your resume performance"
        isExpanded={expandedSections.insights}
        onToggle={() => toggleSection('insights')}
      >
        <div className="space-y-6">
          <Insights resumes={recommendationResumes} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Recommendations"
        description="Insights and suggestions to improve your resume performance"
        isExpanded={expandedSections.recommendations}
        onToggle={() => toggleSection('recommendations')}
      >
        <div className="space-y-6">
          <Recommendations resumes={recommendationResumes} onResumeClick={handleResumeClick} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Application Activity"
        description="Track engagement and activity across your applications"
        isExpanded={expandedSections.eventAnalytics}
        onToggle={() => toggleSection('eventAnalytics')}
      >
        <div className="space-y-6">
          <TrackingLogs logs={recommendationResumes.flatMap(r => r.trackingLogs)} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Active Resumes"
        description="Currently tracked resumes and their details"
        isExpanded={expandedSections.resumes}
        onToggle={() => toggleSection('resumes')}
      >
        <ResumeTable
          resumes={tableResumes}
          fullResumes={recommendationResumes}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onCopyUrl={handleCopyUrl}
          onResumeClick={handleResumeClick}
        />
      </CollapsibleSection>
    </div>
  );
}