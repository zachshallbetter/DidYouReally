import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Monitor, Smartphone, Tablet, HelpCircle, TrendingUp, AlertTriangle, Lightbulb, BarChart as BarChartIcon, Cloud } from "lucide-react";
import { PrismaClient } from '@prisma/client';

type TrackingLog = NonNullable<Awaited<ReturnType<PrismaClient['trackingLog']['findFirst']>>>;

interface TrackingLogsProps {
  logs: TrackingLog[];
  loading?: boolean;
}

export function TrackingLogs({ logs = [], loading }: TrackingLogsProps) {
  const LoadingRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-6 w-[60px]" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
    </TableRow>
  );

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

  const getEventIcon = (eventType: string, isCloudService: boolean) => {
    if (isCloudService) {
      return <Cloud className="h-4 w-4 text-purple-500" />;
    }
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

  const getLocationDisplay = (log: TrackingLog) => {
    if (!log.location) return 'Unknown';
    
    const geoData = log.geoLocation as any;
    if (geoData?.isCloud) {
      return `${geoData.cloudProvider} (${geoData.datacenter})`;
    }
    
    return log.location;
  };

  return (
    <div className="space-y-4">
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
          {loading ? (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          ) : logs.length === 0 ? (
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
                    {getEventIcon('view', log.isCloudService)}
                    {log.resumeId}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{getLocationDisplay(log)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {log.userAgent}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(log.deviceType)}
                    <span className="capitalize">{log.deviceType}</span>
                    {log.deviceFingerprint && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Session: {log.sessionId?.slice(-4)}
                      </Badge>
                    )}
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
    </div>
  );
}