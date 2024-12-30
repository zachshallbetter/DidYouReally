import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get resumes with proper relationships and sorting
    const resumes = await prisma.resume.findMany({
      include: {
        company: {
          select: {
            name: true,
            industry: true,
            location: true
          }
        },
        events: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            type: true,
            createdAt: true,
            metadata: true
          }
        },
        trackingLogs: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            deviceType: true,
            isCloudService: true,
            location: true,
            ipAddress: true,
            userAgent: true,
            referrer: true,
            duration: true,
            deviceFingerprint: true,
            sessionId: true,
            geoLocation: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        lastAccessedAt: 'desc'
      },
      where: {
        status: 'active'
      }
    });

    // Get aggregated event metrics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const eventMetrics = await prisma.resumeEvent.groupBy({
      by: ['type'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get location metrics for the last 30 days
    const locationMetrics = await prisma.trackingLog.groupBy({
      by: ['location'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        location: {
          not: null
        }
      }
    });

    // Get device metrics for the last 30 days
    const deviceMetrics = await prisma.trackingLog.groupBy({
      by: ['deviceType'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get cloud vs non-cloud metrics for the last 30 days
    const cloudMetrics = await prisma.trackingLog.groupBy({
      by: ['isCloudService'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      resumes: resumes.map(resume => ({
        ...resume,
        metrics: {
          viewCount: resume.viewCount,
          uniqueLocations: resume.uniqueLocations,
          cloudAccessCount: resume.cloudAccessCount,
          deviceAccessCount: resume.deviceAccessCount,
          avgViewDuration: resume.avgViewDuration,
          recentViewCount: resume.recentViewCount,
          uniqueLocationsLast7Days: resume.uniqueLocationsLast7Days,
          distinctDeviceCount: resume.distinctDeviceCount
        }
      })),
      metrics: {
        events: eventMetrics,
        locations: locationMetrics,
        devices: deviceMetrics,
        cloud: cloudMetrics
      }
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 