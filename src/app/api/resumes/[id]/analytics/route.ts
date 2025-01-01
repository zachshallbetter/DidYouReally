import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { ResumeState } from "@prisma/client";

// Cache analytics results for 5 minutes
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resumeId = params.id;

    // Use a transaction for consistent data
    const [resume, events, trackingLogs] = await db.$transaction([
      // Get resume details with relations
      db.resume.findUnique({
        where: { 
          id: resumeId,
          status: "active" // Only get active resumes
        },
        include: {
          company: true,
          events: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          trackingLogs: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
          },
        },
      }),

      // Get recent events
      db.event.findMany({
        where: {
          resumeId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      // Get tracking logs
      db.trackingLog.findMany({
        where: {
          resumeId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or inactive" },
        { status: 404 }
      );
    }

    // Calculate analytics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentViews = trackingLogs.filter(
      log => new Date(log.createdAt) > sevenDaysAgo
    ).length;

    // Calculate device distribution with percentage
    const deviceDistribution = trackingLogs.reduce((acc, log) => {
      const key = log.deviceType || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalViews = Object.values(deviceDistribution).reduce((a, b) => a + b, 0);
    
    const locations = new Set(
      trackingLogs
        .filter(log => log.location)
        .map(log => log.location)
    );

    const stateHistory = events
      .filter(event => event.type === 'state_change')
      .map(event => ({
        timestamp: event.createdAt,
        previousState: event.metadata?.previousState as ResumeState || null,
        newState: event.metadata?.newState as ResumeState || 'not_opened',
      }));

    // Format device distribution for the UI with percentages
    const formattedDeviceDistribution = Object.entries(deviceDistribution)
      .map(([deviceType, count]) => ({
        deviceType,
        count,
        percentage: totalViews ? Math.round((count / totalViews) * 100) : 0
      }));

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.round(
      (recentViews * 30 +
      locations.size * 20 +
      (resume.avgViewDuration / 60) * 30 +
      (resume.deviceAccessCount > 1 ? 20 : 0)) / 2
    ));

    const analytics = {
      recentViews,
      totalViews: resume.viewCount,
      deviceDistribution: formattedDeviceDistribution,
      locationCount: locations.size,
      stateHistory,
      engagementScore,
      metrics: {
        avgViewDuration: resume.avgViewDuration,
        deviceAccessCount: resume.deviceAccessCount,
        cloudAccessCount: resume.cloudAccessCount,
        lastAccessedAt: resume.lastAccessedAt,
      }
    };

    return NextResponse.json({
      resume,
      events,
      analytics,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching resume analytics:', error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
} 