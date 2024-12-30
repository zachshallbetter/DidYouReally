import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [resumes, events, logs] = await Promise.all([
      prisma.resume.findMany({
        include: {
          company: true,
          events: true,
          trackingLogs: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.resumeEvent.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.trackingLog.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return NextResponse.json({
      resumes,
      events,
      logs,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 