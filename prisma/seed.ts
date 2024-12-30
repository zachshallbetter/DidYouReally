import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { subDays, addHours, subMonths, addMinutes, startOfDay, endOfDay, differenceInDays, addDays } from 'date-fns';

const prisma = new PrismaClient();

type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';
type EventType = 'view' | 'send' | 'open' | 'click' | 'download';
type ResumeState = 'active' | 'recently_viewed' | 'expired' | 'multi_device' | 'under_consideration' | 'cloud_accessed';

// Test scenarios to ensure coverage of all formulas
const TEST_SCENARIOS = [
  {
    name: 'Frequently Accessed',
    viewCount: 10,
    timeSpan: 7,
    deviceTypes: ['desktop' as DeviceType],
    isCloud: false,
    locations: ['San Francisco, CA', 'San Jose, CA'],
    sessionPattern: 'single',
    eventChain: true
  },
  {
    name: 'Multi-Device Access',
    viewCount: 5,
    timeSpan: 3,
    deviceTypes: ['desktop' as DeviceType, 'mobile' as DeviceType, 'tablet' as DeviceType],
    isCloud: false,
    locations: ['New York, NY', 'Boston, MA', 'Chicago, IL'],
    sessionPattern: 'multiple',
    eventChain: false
  },
  {
    name: 'Cloud Service Access',
    viewCount: 8,
    timeSpan: 5,
    deviceTypes: ['unknown' as DeviceType],
    isCloud: true,
    locations: ['AWS Cloud', 'Google Cloud', 'Azure Cloud'],
    sessionPattern: 'continuous',
    eventChain: false
  },
  {
    name: 'Recently Viewed',
    viewCount: 2,
    timeSpan: 1,
    deviceTypes: ['desktop' as DeviceType],
    isCloud: false,
    locations: ['Seattle, WA'],
    sessionPattern: 'single',
    eventChain: true
  },
  {
    name: 'Expired Resume',
    viewCount: 3,
    timeSpan: 45,
    deviceTypes: ['desktop' as DeviceType],
    isCloud: false,
    locations: ['Austin, TX'],
    sessionPattern: 'single',
    eventChain: false,
    forceExpired: true
  },
  {
    name: 'Under Consideration',
    viewCount: 15,
    timeSpan: 14,
    deviceTypes: ['desktop' as DeviceType, 'mobile' as DeviceType],
    isCloud: false,
    locations: ['Los Angeles, CA', 'San Diego, CA'],
    sessionPattern: 'multiple',
    eventChain: true,
    applicationStatus: 'interviewing'
  }
];

// Helper function to generate device fingerprint
function generateDeviceFingerprint(deviceType: DeviceType, userAgent: string): string {
  return `${deviceType}-${faker.string.alphanumeric(16)}`;
}

// Helper function to generate session ID
function generateSessionId(): string {
  return `session-${faker.string.alphanumeric(12)}`;
}

// Helper function to generate geo location data
function generateGeoLocation(location: string): any {
  const geoData: any = {
    city: location.split(',')[0].trim(),
    region: location.includes(',') ? location.split(',')[1].trim() : undefined,
    country: 'US',
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    timezone: faker.location.timeZone(),
    isp: faker.company.name()
  };

  if (location.includes('Cloud')) {
    geoData.isCloud = true;
    geoData.cloudProvider = location.split(' ')[0];
    geoData.datacenter = faker.location.city();
  }

  return geoData;
}

// Helper function to generate test scenario data with proper relations
function generateTestScenarioData(scenario: typeof TEST_SCENARIOS[0], createdAt: Date) {
  const events: Array<{ type: EventType; createdAt: Date; metadata: any }> = [];
  const logs: Array<any> = [];
  const today = new Date();
  
  // Generate sessions based on pattern
  const sessions = new Map<string, { deviceType: DeviceType; fingerprint: string; userAgent: string }>();
  
  scenario.deviceTypes.forEach(deviceType => {
    const userAgent = faker.internet.userAgent();
    sessions.set(generateSessionId(), {
      deviceType,
      fingerprint: generateDeviceFingerprint(deviceType, userAgent),
      userAgent
    });
  });

  // Generate events based on scenario
  for (let i = 0; i < scenario.viewCount; i++) {
    let eventDate = scenario.forceExpired 
      ? subDays(today, scenario.timeSpan + faker.number.int({ min: 5, max: 15 }))
      : subDays(today, faker.number.int({ min: 0, max: scenario.timeSpan }));
    
    // Select session based on pattern
    const sessionEntries = Array.from(sessions.entries());
    const [sessionId, sessionData] = sessionEntries[
      scenario.sessionPattern === 'single' ? 0 : 
      faker.number.int({ min: 0, max: sessionEntries.length - 1 })
    ];

    // Add view event
    events.push({
      type: 'view',
      createdAt: eventDate,
      metadata: {
        source: faker.helpers.arrayElement(['email', 'linkedin', 'direct', 'referral']),
        isCloudService: scenario.isCloud,
        deviceType: sessionData.deviceType,
        sessionId
      }
    });

    // Add corresponding log
    const location = faker.helpers.arrayElement(scenario.locations);
    logs.push({
      deviceType: sessionData.deviceType,
      isCloudService: scenario.isCloud,
      location,
      ipAddress: faker.internet.ip(),
      userAgent: sessionData.userAgent,
      referrer: faker.internet.url(),
      duration: faker.number.int({ min: 30, max: 300 }),
      deviceFingerprint: sessionData.fingerprint,
      sessionId,
      geoLocation: generateGeoLocation(location),
      createdAt: eventDate
    });

    // Add follow-up events for active scenarios with event chains
    if (!scenario.forceExpired && scenario.eventChain && Math.random() < 0.6) {
      let lastEventTime = eventDate;
      const followUpEvents: EventType[] = ['send', 'open', 'click', 'download'];
      
      for (const eventType of followUpEvents) {
        if (Math.random() < 0.7) {
          lastEventTime = addMinutes(lastEventTime, faker.number.int({ min: 5, max: 60 }));
          events.push({
            type: eventType,
            createdAt: lastEventTime,
            metadata: {
              source: 'email',
              isCloudService: scenario.isCloud,
              deviceType: sessionData.deviceType,
              sessionId
            }
          });
        }
      }
    }
  }

  // Calculate metrics
  const uniqueLocations = new Set(logs.map(log => log.location));
  const recentLogs = logs.filter(log => 
    differenceInDays(new Date(), log.createdAt) <= 7
  );
  const uniqueLocationsLast7Days = new Set(recentLogs.map(log => log.location));
  const distinctDevices = new Set(logs.map(log => log.deviceFingerprint));

  return {
    events,
    logs,
    metrics: {
      viewCount: logs.length,
      uniqueLocations: uniqueLocations.size,
      uniqueLocationsLast7Days: uniqueLocationsLast7Days.size,
      cloudAccessCount: logs.filter(log => log.isCloudService).length,
      deviceAccessCount: logs.filter(log => !log.isCloudService).length,
      avgViewDuration: logs.reduce((sum, log) => sum + log.duration, 0) / (logs.length || 1),
      recentViewCount: recentLogs.length,
      lastViewDate: logs.length > 0 ? logs[logs.length - 1].createdAt : null,
      lastDeviceType: logs.length > 0 ? logs[logs.length - 1].deviceType : null,
      distinctDeviceCount: distinctDevices.size
    }
  };
}

// Helper function to convert scenario name to ResumeState
function getResumeState(scenarioName: string): ResumeState {
  switch (scenarioName) {
    case 'Frequently Accessed':
      return 'frequently_accessed' as ResumeState;
    case 'Multi-Device Access':
      return 'multi_device' as ResumeState;
    case 'Cloud Service Access':
      return 'cloud_accessed' as ResumeState;
    case 'Recently Viewed':
      return 'recently_viewed' as ResumeState;
    case 'Expired Resume':
      return 'expired' as ResumeState;
    case 'Under Consideration':
      return 'under_consideration' as ResumeState;
    default:
      return 'active' as ResumeState;
  }
}

async function main() {
  // Clear existing data
  await prisma.resumeEvent.deleteMany();
  await prisma.trackingLog.deleteMany();
  await prisma.applicationTracking.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.company.deleteMany();

  // Create test companies
  const companies = [
    { 
      name: 'Meta',
      website: 'meta.com',
      industry: 'Technology',
      location: 'Menlo Park, CA',
      size: '50,000+',
      description: 'Social media and virtual reality technology company.'
    },
    { 
      name: 'Apple',
      website: 'apple.com',
      industry: 'Technology',
      location: 'Cupertino, CA',
      size: '150,000+',
      description: 'Consumer technology company known for innovative hardware and software products.'
    }
  ];

  const createdCompanies = await Promise.all(
    companies.map(company => 
      prisma.company.create({
        data: company
      })
    )
  );

  // Create test resumes for each scenario
  for (const company of createdCompanies) {
    for (const scenario of TEST_SCENARIOS) {
      const createdAt = subDays(new Date(), scenario.timeSpan + faker.number.int({ min: 0, max: 10 }));
      const trackingId = faker.string.alphanumeric(8).toLowerCase();
      
      // Generate data based on scenario
      const { events, logs, metrics } = generateTestScenarioData(scenario, createdAt);
      
      // Create resume with scenario data
      const resume = await prisma.resume.create({
        data: {
          jobTitle: `${faker.helpers.arrayElement(['Senior', 'Lead', 'Principal'])} ${faker.helpers.arrayElement(['Software Engineer', 'Product Manager'])}`,
          companyId: company.id,
          trackingId,
          trackingUrl: `https://dyr.fyi/${trackingId}`,
          jobListingUrl: faker.internet.url(),
          status: 'active',
          calculatedState: getResumeState(scenario.name),
          stateUpdatedAt: new Date(),
          version: 1,
          originalContent: faker.lorem.paragraphs(3),
          currentContent: faker.lorem.paragraphs(3),
          metadata: { keywords: faker.helpers.multiple(() => faker.word.sample(), { count: 5 }) },
          layoutPreferences: { theme: 'modern', fontSize: '12pt' },
          tags: faker.helpers.arrayElements(['Remote', 'Hybrid', 'On-site', 'Full-time', 'Contract'], { min: 2, max: 5 }),
          companyType: faker.helpers.arrayElement(['Public', 'Private', 'Startup']),
          jobLevel: faker.helpers.arrayElement(['Senior Level', 'Lead', 'Manager']),
          
          // Add all metrics
          viewCount: metrics.viewCount,
          uniqueLocations: metrics.uniqueLocations,
          cloudAccessCount: metrics.cloudAccessCount,
          deviceAccessCount: metrics.deviceAccessCount,
          avgViewDuration: metrics.avgViewDuration,
          recentViewCount: metrics.recentViewCount,
          lastViewDate: metrics.lastViewDate,
          uniqueLocationsLast7Days: metrics.uniqueLocationsLast7Days,
          lastDeviceType: metrics.lastDeviceType,
          distinctDeviceCount: metrics.distinctDeviceCount,
          lastAccessedAt: metrics.lastViewDate,
          
          createdAt,
          
          // Create related events
          events: {
            createMany: {
              data: events.map(event => ({
                type: event.type,
                metadata: event.metadata,
                createdAt: event.createdAt
              }))
            }
          },
          
          // Create related tracking logs
          trackingLogs: {
            createMany: {
              data: logs.map(log => ({
                deviceType: log.deviceType,
                isCloudService: log.isCloudService,
                location: log.location,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                referrer: log.referrer,
                duration: log.duration,
                deviceFingerprint: log.deviceFingerprint,
                sessionId: log.sessionId,
                geoLocation: log.geoLocation,
                createdAt: log.createdAt
              }))
            }
          }
        }
      });

      // Create version history
      await prisma.resumeVersion.create({
        data: {
          resumeId: resume.id,
          version: 1,
          content: faker.lorem.paragraphs(3),
          metadata: { originalFormat: 'pdf', wordCount: faker.number.int({ min: 300, max: 800 }) },
          createdAt
        }
      });

      // Add application tracking for "Under Consideration" scenario
      if (scenario.name === 'Under Consideration') {
        await prisma.applicationTracking.create({
          data: {
            resumeId: resume.id,
            status: 'interviewing',
            notes: 'Currently in the interview process',
            appliedAt: subDays(new Date(), 14)
          }
        });
      }
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 