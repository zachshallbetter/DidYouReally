import { DeviceType, ResumeState } from '@prisma/client';

export interface Resume {
  id: string;
  jobTitle: string;
  company: {
    name: string;
    industry?: string;
    location?: string;
  };
  trackingUrl: string;
  trackingId: string;
  jobListingUrl?: string;
  status: 'active' | 'archived' | 'deleted';
  calculatedState?: ResumeState;
  stateUpdatedAt?: Date;
  version: number;
  archivedAt?: Date;
  originalContent?: string;
  currentContent?: string;
  metadata: any;
  layoutPreferences: any;
  tags: string[];
  companyType?: string;
  jobLevel?: string;
  applicationStatus?: 'draft' | 'sent' | 'interviewing' | 'rejected' | 'accepted';
  lastAccessedAt?: Date;
  lastModifiedBy?: string;
  
  // Metrics
  viewCount: number;
  uniqueLocations: number;
  cloudAccessCount: number;
  deviceAccessCount: number;
  avgViewDuration: number;
  recentViewCount: number;
  lastViewDate?: Date;
  uniqueLocationsLast7Days: number;
  lastDeviceType?: DeviceType;
  distinctDeviceCount: number;

  // Related data
  events: Array<{
    id: string;
    type: string;
    createdAt: Date;
    metadata: any;
  }>;
  trackingLogs: Array<{
    id: string;
    deviceType: DeviceType;
    isCloudService: boolean;
    location: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    duration?: number;
    deviceFingerprint?: string;
    sessionId?: string;
    geoLocation?: any;
    createdAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
} 