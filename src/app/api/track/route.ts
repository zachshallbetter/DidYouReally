import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const unique_id = searchParams.get('unique_id');

  if (!unique_id) {
    return NextResponse.json({ error: 'Missing unique_id parameter' }, { status: 400 });
  }

  try {
    // Find the resume associated with the tracking URL
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('id')
      .eq('tracking_url', unique_id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Log tracking data
    const { error } = await supabase.from('tracking_logs').insert({
      resume_id: resume.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    if (error) {
      throw error;
    }

    // Return a transparent 1x1 pixel GIF
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error tracking resume view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}