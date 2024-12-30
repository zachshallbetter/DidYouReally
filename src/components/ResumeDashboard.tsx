'use client';

import { useEffect, useState } from 'react';
import { supabase, initializeDatabase } from '@/lib/supabase';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, History, Archive } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { UploadResume } from './UploadResume';
import { StatsOverview } from './dashboard/StatsOverview';
import { ResumeTable } from './dashboard/ResumeTable';
import { TrackingLogs } from './dashboard/TrackingLogs';
import { Recommendations } from './dashboard/Recommendations';
import { toast } from "@/hooks/use-toast";
import type { Database } from '@/types/supabase';
import { type TrackingLog } from '@/lib/types';
import * as z from "zod";

type Resume = Database['public']['Tables']['resumes']['Row'];
type EditFormValues = z.infer<typeof editFormSchema>;

const editFormSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  job_listing_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export function ResumeDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [logs, setLogs] = useState<Partial<TrackingLog>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        await fetchData();
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError('Failed to connect to database. Please try again later.');
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchData() {
    try {
      setError(null);
      
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (resumeError) throw resumeError;

      const { data: logData, error: logError } = await supabase
        .from('tracking_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (logError) throw logError;

      setResumes(resumeData || []);
      setLogs(logData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(resumeId: string, data: EditFormValues) {
    try {
      const resumeLogs = logs.filter(log => log.resume_id === resumeId);
      const hasViews = resumeLogs.length > 0;
      
      if (hasViews) {
        const confirmed = window.confirm(
          "This resume has already been viewed. Editing it may affect tracking consistency. Do you want to proceed?"
        );
        if (!confirmed) return;
      }

      const { error } = await supabase
        .from('resumes')
        .update({
          job_title: data.job_title,
          company: data.company,
          job_listing_url: data.job_listing_url || null,
        })
        .eq('id', resumeId);
      
      if (error) throw error;
      
      toast({
        title: "Resume updated",
        description: "The resume details have been updated successfully.",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update resume. Please try again.",
      });
    }
  }

  async function handleArchive(resumeId: string) {
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ status: 'archived' })
        .eq('id', resumeId);
      
      if (error) throw error;
      
      toast({
        title: "Resume archived",
        description: "The resume has been moved to archives.",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error archiving resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive resume. Please try again.",
      });
    }
  }

  async function handleDelete(resumeId: string) {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);
      
      if (error) throw error;
      
      toast({
        title: "Resume deleted",
        description: "The resume has been permanently deleted.",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resume. Please try again.",
      });
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The tracking URL has been copied to your clipboard.",
      });
    });
  }

  if (loading) {
    return (
      <div className="container space-y-8 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full p-8 pb-16">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resume Tracker</h2>
          <p className="text-muted-foreground">
            Track and manage your resume interactions across different companies.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <StatsOverview resumes={resumes} logs={logs} />

      <div className="mt-8">
        <CollapsibleCard
          title="Recommendations"
          description="Insights and suggestions to improve your resume performance"
          defaultOpen={true}
          trigger={<Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>}
        >
          <Recommendations resumes={resumes} logs={logs} />
        </CollapsibleCard>
      </div>

      <div className="grid gap-6 mt-16">
        {/* Add New Resume */}
        <CollapsibleCard
          title="Add New Resume"
          description="Upload a new resume to track its performance"
          trigger={
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add new resume</span>
            </Button>
          }
        >
          <UploadResume onUploadComplete={fetchData} />
        </CollapsibleCard>

        {/* Active Resumes */}
        <CollapsibleCard
          title="Active Resumes"
          description="Currently tracked resumes and their details"
          defaultOpen={true}
          trigger={
            <Button variant="outline" size="icon">
              <FileText className="h-4 w-4" />
              <span className="sr-only">View active resumes</span>
            </Button>
          }
        >
          <div className="border-0">
            <ResumeTable
              resumes={resumes}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onCopyUrl={copyToClipboard}
            />
          </div>
        </CollapsibleCard>

        {/* Tracking Logs */}
        <CollapsibleCard
          title="Tracking Logs"
          description="Recent resume view activity"
          trigger={
            <Button variant="outline" size="icon">
              <History className="h-4 w-4" />
              <span className="sr-only">View tracking logs</span>
            </Button>
          }
        >
          <div className="border-0">
            <TrackingLogs logs={logs} />
          </div>
        </CollapsibleCard>

        {/* Settings */}
        <CollapsibleCard
          title="Settings"
          description="Configure tracking and notification preferences"
          trigger={
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Open settings</span>
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Tracking Settings</h4>
              <div className="space-y-2">
                {/* Add tracking settings controls */}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Notification Preferences</h4>
              <div className="space-y-2">
                {/* Add notification settings controls */}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Data Management</h4>
              <div className="space-y-2">
                {/* Add data management controls */}
              </div>
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </div>
  );
}