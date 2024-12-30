import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { type TrackingLog } from '@/lib/types';

interface TrackingLogsProps {
  logs: Partial<TrackingLog>[];
}

export function TrackingLogs({ logs }: TrackingLogsProps) {
  return (
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
                {new Date(log.timestamp || Date.now()).toLocaleString()}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
} 