import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { updateResumeMetrics, updateResumeState } from '@/lib/resume-state';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get('id');
  const targetUrl = searchParams.get('url');
  const headersList = headers();

  if (!resumeId || !targetUrl) {
    return new NextResponse('Missing required parameters', { status: 400 });
  }

  try {
    // Log the tracking event
    await db.trackingLog.create({
      data: {
        resumeId,
        ip_address: headersList.get('x-forwarded-for') || 'unknown',
        user_agent: headersList.get('user-agent') || 'unknown',
        deviceType: determineDeviceType(headersList.get('user-agent') || ''),
        isCloudService: isCloudService(headersList.get('user-agent') || ''),
        source: 'link',
        metadata: {
          target_url: targetUrl,
        },
      },
    });

    // Update metrics and state
    await Promise.all([
      updateResumeMetrics(resumeId),
      updateResumeState(resumeId)
    ]);

    // Redirect to the target URL
    return new NextResponse(null, {
      status: 302,
      headers: {
        'Location': decodeURIComponent(targetUrl),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error logging link click:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function determineDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet')) return 'tablet';
  if (ua.includes('cloud') || isCloudService(ua)) return 'cloud';
  return 'desktop';
}

function isCloudService(userAgent: string): boolean {
  const cloudIdentifiers = [
    'aws',
    'googlecloud',
    'azure',
    'cloudfront',
    'akamai',
    'fastly',
    'cloudflare',
    'bot',
    'crawler',
    'spider',
  ];
  
  const ua = userAgent.toLowerCase();
  return cloudIdentifiers.some(identifier => ua.includes(identifier));
} 