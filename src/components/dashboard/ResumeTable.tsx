import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Eye, LinkIcon, Edit, Archive, Trash2, Copy } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow, format } from "date-fns";

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

interface ResumeTableProps {
  resumes: Resume[];
  onEdit: (id: string, data: any) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

export function ResumeTable({ resumes, onEdit, onArchive, onDelete, onCopyUrl }: ResumeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Tracking URL</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resumes.map((resume) => (
          <TableRow key={resume.id}>
            <TableCell className="font-medium">{resume.jobTitle}</TableCell>
            <TableCell>{resume.company.name}</TableCell>
            <TableCell className="flex items-center gap-2">
              <span className="truncate max-w-[200px]">{resume.trackingUrl}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopyUrl(resume.trackingUrl)}
                className="h-8 w-8"
                title="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              {resume.lastEvent ? (
                <div className="flex flex-col">
                  <span>{formatDistanceToNow(new Date(resume.lastEvent.createdAt))} ago</span>
                  <span className="text-xs text-muted-foreground">
                    Last {resume.lastEvent.type}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">No activity</span>
              )}
            </TableCell>
            <TableCell>{formatDistanceToNow(new Date(resume.createdAt))} ago</TableCell>
            <TableCell>
              <Badge variant={resume.status === 'active' ? 'default' : 'secondary'}>
                {resume.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 