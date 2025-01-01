export interface Resume {
  id: string;
  job_title: string;
  company: {
    name: string;
    industry: string;
    location: string;
  };
  job_listing_url?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  viewCount: number;
  uniqueLocations: number;
  deviceAccessCount: number;
  cloudAccessCount: number;
  avgViewDuration: number;
  recentViewCount: number;
  lastViewDate: string | Date | null;
  uniqueLocationsLast7Days: number;
  distinctDeviceCount: number;
  state: 'not_opened' | 'recently_viewed' | 'frequently_accessed' | 'multi_device_viewed' | 'under_consideration' | 'expired';
  trackingLogs: Array<{
    id: string;
    location: string;
    deviceType: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string | Date;
  }>;
  events: Array<{
    id: string;
    type: string;
    metadata: {
      source: string;
      deviceType?: string;
      location?: string;
    };
    createdAt: string | Date;
  }>;
}

export interface TableResume {
  id: string;
  job_title: string;
  company: string;
  job_listing_url?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

export function transformTableResumeToResume(tableResume: TableResume): Resume {
  return {
    ...tableResume,
    company: {
      name: tableResume.company,
      industry: 'Technology',
      location: 'Unknown'
    },
    viewCount: tableResume.views,
    uniqueLocations: 0,
    deviceAccessCount: 0,
    cloudAccessCount: 0,
    avgViewDuration: 0,
    recentViewCount: 0,
    lastViewDate: tableResume.updatedAt,
    uniqueLocationsLast7Days: 0,
    distinctDeviceCount: 0,
    state: 'not_opened',
    trackingLogs: [],
    events: []
  };
}