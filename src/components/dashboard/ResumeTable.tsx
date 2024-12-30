import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Monitor, Smartphone, Tablet, Cloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Resume } from "@/types/resume";

interface ResumeTableProps {
  resumes: Resume[];
  onEdit: (id: string, data: any) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export function ResumeTable({ resumes, onEdit, onArchive, onDelete, onCopyUrl }: ResumeTableProps) {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-orange-500" />;
      default:
        return <Cloud className="h-4 w-4 text-purple-500" />;
    }
  };

  const getLastEvent = (resume: Resume) => {
    if (!resume.events.length) return null;
    return resume.events.sort((a: { createdAt: Date | string }, b: { createdAt: Date | string }) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const getRecentViews = (resume: Resume) => {
    return {
      count: resume.recentViewCount,
      locations: resume.uniqueLocationsLast7Days,
      deviceCount: resume.distinctDeviceCount,
      lastDeviceType: resume.lastDeviceType
    };
  };

  return (
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
        {resumes.map((resume) => {
          const lastEvent = getLastEvent(resume);
          const recentViews = getRecentViews(resume);

          return (
            <TableRow key={resume.id}>
              <TableCell className="font-medium">{resume.jobTitle}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{resume.company.name}</span>
                  <span className="text-xs text-muted-foreground">{resume.company.industry}</span>
                </div>
              </TableCell>
              <TableCell>{resume.company.location}</TableCell>
              <TableCell>
                {lastEvent ? (
                  <div className="flex flex-col">
                    <span>{formatDistanceToNow(new Date(lastEvent.createdAt))} ago</span>
                    <span className="text-xs text-muted-foreground">
                      {lastEvent.type} via {lastEvent.metadata.source}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No activity</span>
                )}
              </TableCell>
              <TableCell>
                {recentViews.count > 0 ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{recentViews.count} views</span>
                      {recentViews.lastDeviceType && (
                        <span>{getDeviceIcon(recentViews.lastDeviceType)}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      from {recentViews.locations} locations, {recentViews.deviceCount} devices
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No views</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={resume.calculatedState === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {resume.calculatedState?.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onCopyUrl(resume.trackingUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(resume.id, {})}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
} 