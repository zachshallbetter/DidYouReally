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
import type { Database } from '@/types/supabase';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Resume = Database['public']['Tables']['resumes']['Row'];

const editFormSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  job_listing_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type EditFormValues = z.infer<typeof editFormSchema>;

interface ResumeTableProps {
  resumes: Resume[];
  onEdit: (resumeId: string, data: EditFormValues) => Promise<void>;
  onArchive: (resumeId: string) => Promise<void>;
  onDelete: (resumeId: string) => Promise<void>;
  onCopyUrl: (url: string) => void;
}

export function ResumeTable({ resumes, onEdit, onArchive, onDelete, onCopyUrl }: ResumeTableProps) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
  });

  return (
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
            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
                    onClick={() => onCopyUrl(resume.tracking_url)}
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
                {new Date(resume.created_at || Date.now()).toLocaleDateString()}
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
                      onClick={() => onCopyUrl(resume.tracking_url)}
                      className="cursor-pointer"
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Copy Tracking Link
                    </DropdownMenuItem>
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Resume</DialogTitle>
                          <DialogDescription>
                            Update the resume details below. Note that editing a resume that has already been viewed may affect tracking consistency.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit((data) => onEdit(resume.id, data))} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="job_title"
                              defaultValue={resume.job_title}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="company"
                              defaultValue={resume.company}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="job_listing_url"
                              defaultValue={resume.job_listing_url || ""}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Listing URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="url" placeholder="https://..." />
                                  </FormControl>
                                  <FormDescription>
                                    The original job posting URL for reference
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end gap-2">
                              <Button type="submit">Save Changes</Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onArchive(resume.id)}
                      className="cursor-pointer"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(resume.id)}
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
  );
} 