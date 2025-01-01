import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Archive, Trash, MonitorSmartphone, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResumeDetailsSheet } from "./ResumeDetailsSheet";
import { Resume, TableResume } from "@/types/resume";
import { formatDistanceToNow } from "date-fns";

interface ResumeTableProps {
  loading?: boolean;
  resumes: TableResume[];
  fullResumes: Resume[];
  onEdit: (resumeId: string, data: { 
    job_title: string;
    company: string;
    job_listing_url?: string;
  }) => Promise<void>;
  onArchive: (resumeId: string) => Promise<void>;
  onDelete: (resumeId: string) => Promise<void>;
  onCopyUrl: (url: string) => Promise<void>;
  onResumeClick?: (resume: Resume, tab: 'details' | 'insights') => void;
}

function getStateStyles(state: string): string {
  const styles = {
    not_opened: 'bg-amber-100 text-amber-800',
    recently_viewed: 'bg-blue-100 text-blue-800', 
    frequently_accessed: 'bg-emerald-100 text-emerald-800',
    multi_device_viewed: 'bg-purple-100 text-purple-800',
    under_consideration: 'bg-indigo-100 text-indigo-800',
    expired: 'bg-gray-100 text-gray-800',
    cloud_accessed: 'bg-sky-100 text-sky-800',
    active: 'bg-green-100 text-green-800'
  };
  return styles[state as keyof typeof styles] || 'bg-gray-100 text-gray-800';
}

function formatState(state: string): string {
  return state.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function ResumeTable({ 
  loading: initialLoading,
  resumes,
  fullResumes,
  onEdit,
  onArchive,
  onDelete,
  onCopyUrl,
  onResumeClick
}: ResumeTableProps) {
  const [page, setPage] = useState(1);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'insights'>('details');

  const itemsPerPage = 5;
  const totalPages = Math.ceil(resumes.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResumes = resumes.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowClick = (resume: TableResume, tab: 'details' | 'insights' = 'details') => {
    const fullResume = fullResumes.find(r => r.id === resume.id);
    if (fullResume && onResumeClick) {
      onResumeClick(fullResume, tab);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Recent Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResumeDetailsSheet
        resume={selectedResume}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onCopyUrl={onCopyUrl}
        defaultTab={activeTab}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Recent Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentResumes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No resumes found. Add a resume to start tracking.
                </TableCell>
              </TableRow>
            ) : (
              currentResumes.map((resume) => {
                const fullResume = fullResumes.find(r => r.id === resume.id);
                return (
                  <TableRow 
                    key={resume.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(resume, 'details')}
                  >
                    <TableCell>
                      <span className="font-medium">{resume.job_title}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{resume.company}</span>
                        <span className="text-sm text-muted-foreground">Technology</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {fullResume?.company?.location || "Remote"}
                    </TableCell>
                    <TableCell 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(resume, 'insights');
                      }}
                      className="cursor-pointer hover:text-blue-500"
                    >
                      <div className="flex flex-col">
                        <span>{formatDistanceToNow(resume.updatedAt, { addSuffix: true })}</span>
                        <span className="text-sm text-muted-foreground">view via direct</span>
                      </div>
                    </TableCell>
                    <TableCell 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(resume, 'insights');
                      }}
                      className="cursor-pointer hover:text-blue-500"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span>{resume.views} views</span>
                          <MonitorSmartphone className="h-3 w-3 text-blue-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          from {fullResume?.uniqueLocations || 1} locations, {fullResume?.deviceAccessCount || 1} devices
                        </span>
                      </div>
                    </TableCell>
                    <TableCell 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(resume, 'insights');
                      }}
                      className="cursor-pointer hover:text-blue-500"
                    >
                      <Badge 
                        variant="outline" 
                        className={getStateStyles(fullResume?.state || 'active')}
                      >
                        {formatState(fullResume?.state || 'active')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div 
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onCopyUrl(resume.job_listing_url || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onArchive(resume.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive Resume
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(resume.id)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Resume
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {resumes.length > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}