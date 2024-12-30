import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_title, company, tracking_url } = body;

    // Validate required fields match DB constraints
    if (!job_title || job_title.length < 3) {
      return NextResponse.json(
        { error: 'Job title must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!company || company.length < 2) {
      return NextResponse.json(
        { error: 'Company must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!tracking_url) {
      return NextResponse.json(
        { error: 'Tracking URL is required' },
        { status: 400 }
      );
    }

    // Insert resume with default status='active', version=1
    const { data, error } = await supabase.from('resumes').insert({
      job_title,
      company, 
      tracking_url,
      status: 'active',
      version: 1
    }).select().single();

    if (error) {
      // Log error details
      await supabase.from('error_logs').insert({
        endpoint: '/api/upload',
        error_message: error.message,
        stack_trace: error.stack,
        severity: 'ERROR'
      });
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error uploading resume metadata:', error);
    
    // Log unhandled errors
    await supabase.from('error_logs').insert({
      endpoint: '/api/upload',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      stack_trace: error instanceof Error ? error.stack : undefined,
      severity: 'ERROR'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}