import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const unique_id = searchParams.get('unique_id');
  const headersList = await headers();

  if (!unique_id) {
    return NextResponse.json({ error: 'Missing unique_id' }, { status: 400 });
  }

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
    ip_address: headersList.get('x-forwarded-for') || request.headers.get('x-forwarded-for'),
    user_agent: headersList.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return a transparent 1x1 pixel GIF
  return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
} 