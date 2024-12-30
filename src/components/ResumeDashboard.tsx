'use client';

import { useEffect, useState } from 'react';
import { supabase, initializeDatabase } from '@/lib/supabase';
import { UploadResume } from './UploadResume';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Eye, MapPin, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import type { Database } from '@/types/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  MoreHorizontal,
  Trash2,
  Edit,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Plus, FileText, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";

type Resume = Database['public']['Tables']['resumes']['Row'];
type TrackingLog = Database['public']['Tables']['tracking_logs']['Row'];

export function ResumeDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [logs, setLogs] = useState<TrackingLog[]>([]);
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
        .select(`
          id,
          resume_id,
          ip_address,
          user_agent,
          timestamp,
          country,
          city,
          view_duration,
          metadata,
          is_bot,
          retention_expires_at
        `)
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

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumes.length}</div>
            <p className="text-xs text-muted-foreground">Active resumes being tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Resume views tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map(log => `${log.city},${log.country}`).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different viewing locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs[0] ? new Date(logs[0].timestamp).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Most recent view</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-8">
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
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Tracking URL</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No resumes found. Upload your first resume to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  resumes.map((resume) => (
                    <TableRow key={resume.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{resume.job_title}</TableCell>
                      <TableCell>{resume.company}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]">{resume.tracking_url}</span>
                          <button
                            onClick={() => copyToClipboard(resume.tracking_url)}
                            className="p-1 hover:bg-muted rounded-md"
                            aria-label="Copy tracking URL"
                            title="Copy tracking URL"
                          >
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">v{resume.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(resume.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            resume.status === 'active' 
                              ? 'default'
                              : resume.status === 'archived' 
                                ? 'secondary' 
                                : 'destructive'
                          }
                        >
                          {resume.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0">
                            <div className="h-8 w-8 p-0 flex items-center justify-center hover:bg-muted rounded-md">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => window.open(`/resume/${resume.id}`, '_blank')}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Resume
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(resume.tracking_url)}
                              className="cursor-pointer"
                            >
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Copy Tracking Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`/resume/${resume.id}/edit`, '_blank')}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleArchive(resume.id)}
                              className="cursor-pointer"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(resume.id)}
                              className="cursor-pointer text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CollapsibleCard>

        {/* Archived Resumes */}
        <CollapsibleCard
          title="Archived Resumes"
          description="Previously used resumes"
          trigger={
            <Button variant="outline" size="icon">
              <Archive className="h-4 w-4" />
              <span className="sr-only">View archived resumes</span>
            </Button>
          }
        >
          <div className="border-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Archived Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Add archived resumes table content */}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Resume ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No tracking logs found. Views will appear here once your resumes are accessed.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {log.resume_id}
                      </TableCell>
                      <TableCell>
                        {log.city && log.country ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{log.city}, {log.country}</span>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {log.user_agent}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.view_duration || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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

        {/* Recommendations */}
        <CollapsibleCard
          title="Recommendations"
          description="Insights and suggestions to improve your resume performance"
          trigger={
            <Button variant="outline" size="icon">
              <Lightbulb className="h-4 w-4" />
              <span className="sr-only">View recommendations</span>
            </Button>
          }
        >
          <div className="space-y-6">
            {/* Performance Insights */}
            <div>
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Insights
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {resumes.map(resume => {
                  const resumeLogs = logs.filter(log => log.resume_id === resume.id);
                  const viewCount = resumeLogs.length;
                  const uniqueLocations = new Set(resumeLogs.map(log => `${log.city},${log.country}`).filter(Boolean)).size;
                  
                  return (
                    <Card key={resume.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{resume.job_title}</span>
                          <Badge variant="outline">{viewCount} views</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {uniqueLocations} unique locations
                        </div>
                        {viewCount === 0 && (
                          <div className="flex items-center gap-2 text-xs text-amber-500">
                            <AlertTriangle className="h-3 w-3" />
                            No views yet - consider sharing more widely
                          </div>
                        )}
                        {viewCount > 0 && viewCount < 5 && (
                          <div className="flex items-center gap-2 text-xs text-blue-500">
                            <Lightbulb className="h-3 w-3" />
                            Getting traction - optimize for more visibility
                          </div>
                        )}
                        {viewCount >= 5 && (
                          <div className="flex items-center gap-2 text-xs text-green-500">
                            <TrendingUp className="h-3 w-3" />
                            Good engagement - maintain momentum
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="text-sm font-medium mb-4">Recommended Actions</h4>
              <div className="space-y-3">
                {resumes.some(r => !r.job_listing_url) && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Some resumes are missing job listing URLs. Adding these can help track application context.
                    </AlertDescription>
                  </Alert>
                )}
                {logs.some(log => log.is_bot) && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Bot traffic detected. Consider implementing additional tracking protection.
                    </AlertDescription>
                  </Alert>
                )}
                {resumes.some(r => {
                  const resumeLogs = logs.filter(log => log.resume_id === r.id);
                  return resumeLogs.length === 0;
                }) && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      Some resumes have no views. Consider sharing them on relevant platforms or with recruiters.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Best Practices */}
            <div>
              <h4 className="text-sm font-medium mb-4">Best Practices</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <h5 className="text-sm font-medium mb-2">Tracking Optimization</h5>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Use unique versions for different job applications</li>
                    <li>• Add job listing URLs for context</li>
                    <li>• Monitor view durations for engagement</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h5 className="text-sm font-medium mb-2">Distribution Strategy</h5>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Share tracking links in applications</li>
                    <li>• Use different versions for different roles</li>
                    <li>• Track which platforms drive most views</li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </div>
  );
}