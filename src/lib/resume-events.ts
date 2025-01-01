import { db } from '@/lib/db';
import { ResumeState } from './resume-state';

export type EventType = 
  | 'view'
  | 'state_change'
  | 'cloud_access'
  | 'multi_device'
  | 'high_engagement'
  | 'expired';

interface EventMetadata {
  previousState?: ResumeState;
  newState?: ResumeState;
  deviceType?: string;
  source?: string;
  location?: string;
  viewCount?: number;
  uniqueLocations?: number;
}

export async function logResumeEvent(
  resumeId: string,
  type: EventType,
  metadata: EventMetadata = {}
): Promise<void> {
  await db.event.create({
    data: {
      resumeId,
      type,
      metadata: metadata as any, // Prisma handles JSON conversion
    },
  });
}

export async function logStateChange(
  resumeId: string,
  previousState: ResumeState,
  newState: ResumeState
): Promise<void> {
  // Log the state change event
  await logResumeEvent(resumeId, 'state_change', {
    previousState,
    newState,
  });

  // Log additional events based on state transitions
  if (newState === 'cloud_accessed' && previousState !== 'cloud_accessed') {
    await logResumeEvent(resumeId, 'cloud_access');
  }

  if (newState === 'multi_device_viewed' && previousState !== 'multi_device_viewed') {
    await logResumeEvent(resumeId, 'multi_device');
  }

  if (newState === 'frequently_accessed') {
    await logResumeEvent(resumeId, 'high_engagement');
  }

  if (newState === 'expired' && previousState !== 'expired') {
    await logResumeEvent(resumeId, 'expired');
  }
}

export async function getResumeEvents(resumeId: string) {
  return db.event.findMany({
    where: { resumeId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecentEvents(hours: number = 24) {
  return db.event.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - hours * 60 * 60 * 1000),
      },
    },
    include: {
      resume: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEventStats(resumeId: string) {
  const events = await db.event.groupBy({
    by: ['type'],
    where: { resumeId },
    _count: true,
  });

  return events.reduce((acc, curr) => {
    acc[curr.type] = curr._count;
    return acc;
  }, {} as Record<string, number>);
} 