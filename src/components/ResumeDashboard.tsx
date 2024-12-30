'use client';

import { useState, useEffect } from 'react';
import { ResumeTable } from '@/components/dashboard/ResumeTable';
import { Recommendations } from '@/components/dashboard/Recommendations';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { toast } from "@/hooks/use-toast";
import { initializeDatabase } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

type BaseResume = NonNullable<Awaited<ReturnType<PrismaClient['resume']['findFirst']>>>;

interface Resume extends BaseResume {
  lastEvent?: {
    type: string;
    createdAt: string;
  } | null;
  company: {
    name: string;
  };
}

type TrackingLog = NonNullable<Awaited<ReturnType<PrismaClient['trackingLog']['findFirst']>>>;
type ResumeEvent = NonNullable<Awaited<ReturnType<PrismaClient['resumeEvent']['findFirst']>>>;

export function ResumeDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [events, setEvents] = useState<ResumeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    resumes: true,
    eventAnalytics: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await initializeDatabase();
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      
      // Sort resumes by most recent event and enrich with last event info
      const sortedResumes = [...data.resumes].map((resume: BaseResume) => {
        // Get all events for this resume
        const resumeEvents = data.events.filter((event: ResumeEvent) => event.resumeId === resume.id);
        // Sort events by date descending
        const sortedEvents = resumeEvents.sort((a: ResumeEvent, b: ResumeEvent) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        // Get the most recent event
        const lastEvent = sortedEvents[0];
        
        return {
          ...resume,
          lastEvent: lastEvent ? {
            type: lastEvent.type,
            createdAt: lastEvent.createdAt
          } : null
        };
      }).sort((a: Resume, b: Resume) => {
        const aLastAccessed = a.lastEvent?.createdAt || a.createdAt;
        const bLastAccessed = b.lastEvent?.createdAt || b.createdAt;
        return new Date(bLastAccessed).getTime() - new Date(aLastAccessed).getTime();
      });
      
      setResumes(sortedResumes);
      setLogs(data.logs);
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
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

  if (loading) return <div>Loading...</div>;

  const totalViews = events.filter(event => event.type === 'view').length;
  const uniqueLocations = new Set(logs.map(log => log.location).filter(Boolean)).size;
  const latestActivity = events[0]?.createdAt || null;

  return (
    <div className="space-y-8">
      <StatsOverview
        totalResumes={resumes.length}
        totalViews={totalViews}
        uniqueLocations={uniqueLocations}
        latestActivity={latestActivity}
      />

      <CollapsibleSection
        title="Recommendations"
        description="Insights and suggestions to improve your resume performance"
        isExpanded={expandedSections.recommendations}
        onToggle={() => toggleSection('recommendations')}
      >
        <Recommendations resumes={resumes} logs={logs} events={events} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Active Resumes"
        description="Currently tracked resumes and their details"
        isExpanded={expandedSections.resumes}
        onToggle={() => toggleSection('resumes')}
      >
        <ResumeTable
          resumes={resumes}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onCopyUrl={handleCopyUrl}
        />
      </CollapsibleSection>
    </div>
  );
}