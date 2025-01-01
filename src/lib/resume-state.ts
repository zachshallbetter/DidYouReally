import { db } from '@/lib/db';
import { logStateChange, logResumeEvent } from './resume-events';

export type ResumeState = 
  | 'not_opened'
  | 'recently_viewed'
  | 'frequently_accessed'
  | 'multi_device_viewed'
  | 'cloud_accessed'
  | 'expired'
  | 'under_consideration'
  | 'active';

interface StateConditions {
  [key: string]: (data: ResumeStateData) => boolean;
}

interface ResumeStateData {
  viewCount: number;
  deviceAccessCount: number;
  cloudAccessCount: number;
  uniqueLocations: number;
  lastAccessedAt: Date | null;
  createdAt: Date;
}

const STATE_CONDITIONS: StateConditions = {
  expired: (data) => {
    if (!data.lastAccessedAt) return true;
    const daysSinceLastAccess = Math.floor(
      (Date.now() - data.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastAccess > 30;
  },
  
  frequently_accessed: (data) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - data.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return data.viewCount >= 10 && daysSinceCreation <= 7;
  },
  
  multi_device_viewed: (data) => {
    return data.deviceAccessCount > 1;
  },
  
  cloud_accessed: (data) => {
    return data.cloudAccessCount > 0;
  },
  
  recently_viewed: (data) => {
    if (!data.lastAccessedAt) return false;
    const hoursSinceLastAccess = Math.floor(
      (Date.now() - data.lastAccessedAt.getTime()) / (1000 * 60 * 60)
    );
    return hoursSinceLastAccess <= 24;
  },
  
  not_opened: (data) => {
    return data.viewCount === 0;
  }
};

export async function determineResumeState(resumeId: string): Promise<ResumeState> {
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
    select: {
      viewCount: true,
      deviceAccessCount: true,
      cloudAccessCount: true,
      uniqueLocations: true,
      lastAccessedAt: true,
      createdAt: true,
    },
  });

  if (!resume) throw new Error('Resume not found');

  // Check conditions in priority order
  if (STATE_CONDITIONS.expired(resume)) return 'expired';
  if (STATE_CONDITIONS.frequently_accessed(resume)) return 'frequently_accessed';
  if (STATE_CONDITIONS.multi_device_viewed(resume)) return 'multi_device_viewed';
  if (STATE_CONDITIONS.cloud_accessed(resume)) return 'cloud_accessed';
  if (STATE_CONDITIONS.recently_viewed(resume)) return 'recently_viewed';
  if (STATE_CONDITIONS.not_opened(resume)) return 'not_opened';

  return 'active';
}

export async function updateResumeState(resumeId: string): Promise<void> {
  const resume = await db.resume.findUnique({
    where: { id: resumeId },
    select: {
      state: true,
      viewCount: true,
      deviceAccessCount: true,
      cloudAccessCount: true,
      uniqueLocations: true,
      lastAccessedAt: true,
      createdAt: true,
    },
  });

  if (!resume) throw new Error('Resume not found');

  const previousState = resume.state as ResumeState;
  const newState = await determineResumeState(resumeId);

  if (previousState !== newState) {
    await Promise.all([
      // Update the state in the database
      db.resume.update({
        where: { id: resumeId },
        data: { state: newState },
      }),
      // Log the state change
      logStateChange(resumeId, previousState, newState)
    ]);
  }
}

export async function updateAllResumeStates(): Promise<void> {
  const resumes = await db.resume.findMany({
    select: { id: true },
  });

  await Promise.all(
    resumes.map(resume => updateResumeState(resume.id))
  );
}

// Function to update metrics based on tracking logs
export async function updateResumeMetrics(resumeId: string): Promise<void> {
  const [
    deviceTypes,
    cloudAccesses,
    uniqueIPs,
    recentLogs
  ] = await Promise.all([
    // Count distinct device types
    db.trackingLog.groupBy({
      by: ['deviceType'],
      where: { resumeId },
    }),
    
    // Count cloud accesses
    db.trackingLog.count({
      where: { 
        resumeId,
        isCloudService: true,
      },
    }),
    
    // Count unique IP addresses
    db.trackingLog.groupBy({
      by: ['ip_address'],
      where: { resumeId },
    }),
    
    // Get recent logs for view count
    db.trackingLog.findMany({
      where: {
        resumeId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  const metrics = {
    deviceAccessCount: deviceTypes.length,
    cloudAccessCount: cloudAccesses,
    uniqueLocations: uniqueIPs.length,
    viewCount: recentLogs.length,
  };

  await Promise.all([
    // Update resume metrics
    db.resume.update({
      where: { id: resumeId },
      data: metrics,
    }),
    // Log metrics update event
    logResumeEvent(resumeId, 'view', {
      viewCount: metrics.viewCount,
      uniqueLocations: metrics.uniqueLocations,
    })
  ]);
} 