import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { updateAllResumeStates } from '@/lib/resume-state';

// This endpoint should be called by a cron job every hour
export async function POST(request: Request) {
  const headersList = headers();
  const authHeader = headersList.get('authorization');

  // Basic security check - in production, use a proper authentication method
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await updateAllResumeStates();
    return NextResponse.json({ 
      success: true,
      message: 'Successfully updated all resume states',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update resume states',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 