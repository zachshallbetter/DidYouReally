import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Monitor, Smartphone, Tablet, HelpCircle, TrendingUp, AlertTriangle, Lightbulb, BarChart as BarChartIcon } from "lucide-react";
import { PrismaClient } from '@prisma/client';

type TrackingLog = NonNullable<Awaited<ReturnType<PrismaClient['trackingLog']['findFirst']>>>;

interface TrackingLogsProps {
  logs: TrackingLog[];
}

export function TrackingLogs({ logs }: TrackingLogsProps) {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-orange-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'insight':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'analytics':
        return <BarChartIcon className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Resume ID</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>User Agent</TableHead>
          <TableHead>Device Type</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
              No tracking logs found. Views will appear here once your resumes are accessed.
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-xs">
                <div className="flex items-center gap-2">
                  {getEventIcon('view')}
                  {log.resumeId}
                </div>
              </TableCell>
              <TableCell>
                {log.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{log.location}</span>
                  </div>
                ) : (
                  'Unknown'
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                {log.userAgent}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getDeviceIcon(log.deviceType)}
                  <span className="capitalize">{log.deviceType}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {log.duration ? `${log.duration}s` : 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
} 