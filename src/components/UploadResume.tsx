'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateTrackingBeacon } from '@/lib/tracking';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';

interface UploadResumeProps {
  onUploadComplete: () => void;
}

export function UploadResume({ onUploadComplete }: UploadResumeProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Validate required fields match DB constraints from schema
    if (!jobTitle || jobTitle.length < 3) {
      alert('Job title must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (!company || company.length < 2) {
      alert('Company must be at least 2 characters');
      setLoading(false);
      return;
    }

    try {
      const tracking_url = uuidv4();

      // Insert directly using supabase client
      const { error } = await supabase.from('resumes').insert({
        job_title: jobTitle,
        company,
        tracking_url,
        status: 'active', // Default status from schema
        version: 1 // Default version from schema
      });

      if (error) {
        throw error;
      }

      const trackingBeacon = generateTrackingBeacon(tracking_url);
      setTrackingCode(trackingBeacon);
      setJobTitle('');
      setCompany('');
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
            Job Title
          </label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            minLength={3}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-foreground">
            Company
          </label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            minLength={2}
            placeholder="e.g. Tech Solutions Inc"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className={loading ? "opacity-50 cursor-not-allowed" : ""}
        >
          {loading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      </form>

      {trackingCode && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2">
              Tracking Code
            </h3>
            <div className="relative">
              <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                {trackingCode}
              </pre>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(trackingCode);
                  alert('Tracking code copied to clipboard!');
                }}
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
              >
                Copy
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Add this code to your resume document or webpage to enable tracking.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}