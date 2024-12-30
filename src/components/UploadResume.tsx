'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface Resume {
  id: string;
  job_title: string;
  version: number;
}

const formSchema = z.object({
  jobTitle: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  company: z.string().min(2, {
    message: "Company must be at least 2 characters.",
  }),
  jobListingUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  resumeVersion: z.string(),
  file: z.any().optional(), // Changed from FileList to fix SSR issue
});

interface UploadResumeProps {
  onUploadComplete: () => void;
}

export function UploadResume({ onUploadComplete }: UploadResumeProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [companies] = useState<string[]>([]);
  const [existingResumes] = useState<Resume[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      jobListingUrl: "",
      resumeVersion: "new",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsUploading(true);

      if (values.resumeVersion === "new" && !values.file) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a file to upload.",
        });
        return;
      }

      let fileUrl = "";
      if (values.file) {
        const file = values.file[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('resumes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        fileUrl = data.path;
      }

      const { error } = await supabase
        .from('resumes')
        .insert([
          {
            job_title: values.jobTitle,
            company: values.company,
            file_url: fileUrl,
            job_listing_url: values.jobListingUrl || null,
            status: 'active',
            version: 1,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resume uploaded successfully.",
      });

      form.reset();
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload resume. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Senior Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or enter company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">+ Add New Company</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.value === "new" && (
                  <Input 
                    placeholder="Enter company name"
                    onChange={(e) => field.onChange(e.target.value)}
                    className="mt-2"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="jobListingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Listing URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                Optional: Add the URL of the job listing for reference
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resumeVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume Version</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose resume version" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">Upload New Resume</SelectItem>
                  {existingResumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.job_title} - v{resume.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("resumeVersion") === "new" && (
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Resume File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Upload your resume in PDF, DOC, or DOCX format
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}