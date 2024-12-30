import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResumeState } from '@prisma/client';

function calculateResumeState(resume: any): ResumeState {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Check for cloud access
  if (resume.cloudAccessCount > 0 && resume.lastAccessedAt && resume.lastAccessedAt > sevenDaysAgo) {
    return 'cloud_accessed';
  }

  // Check for frequent access
  if (resume.recentViewCount >= 10 && resume.lastAccessedAt && resume.lastAccessedAt > sevenDaysAgo) {
    return 'frequently_accessed';
  }

  // Check for multi-device access
  if (resume.distinctDeviceCount >= 3 && resume.lastAccessedAt && resume.lastAccessedAt > sevenDaysAgo) {
    return 'multi_device';
  }

  // Check for recent views
  if (resume.lastAccessedAt && resume.lastAccessedAt > sevenDaysAgo) {
    return 'recently_viewed';
  }

  // Check for under consideration
  if (resume.applicationStatus === 'interviewing') {
    return 'under_consideration';
  }

  // Check for expired
  if (!resume.lastAccessedAt || resume.lastAccessedAt < thirtyDaysAgo) {
    return 'expired';
  }

  return 'active';
}

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

    // Calculate and update resume states
    const updatedResumes = await Promise.all(
      resumes.map(async (resume) => {
        const calculatedState = calculateResumeState(resume);
        
        if (calculatedState !== resume.calculatedState) {
          await prisma.resume.update({
            where: { id: resume.id },
            data: {
              calculatedState,
              stateUpdatedAt: new Date()
            }
          });
        }

        return {
          ...resume,
          calculatedState
        };
      })
    );

    // Get aggregated metrics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [eventMetrics, locationMetrics, deviceMetrics, cloudMetrics] = await Promise.all([
      prisma.resumeEvent.groupBy({
        by: ['type'],
        _count: true,
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.trackingLog.groupBy({
        by: ['location'],
        _count: true,
        where: {
          createdAt: { gte: thirtyDaysAgo },
          location: { not: null }
        }
      }),
      prisma.trackingLog.groupBy({
        by: ['deviceType'],
        _count: true,
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.trackingLog.groupBy({
        by: ['isCloudService'],
        _count: true,
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ]);

    return NextResponse.json({
      resumes: updatedResumes.map(resume => ({
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
    // Log error to terminal in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Runtime Error in API route:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 