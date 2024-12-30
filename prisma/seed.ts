import { PrismaClient, DeviceType, EventType, ApplicationTrackingStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { subDays, addHours, subMonths, addMinutes, startOfDay, endOfDay, differenceInDays, addDays } from 'date-fns';

const prisma = new PrismaClient();

// Helper function to generate random events for a day with correlated patterns
function generateEventsForDay(resumeId: string, date: Date, daysSinceCreation: number) {
  const events: { resumeId: string; type: EventType; createdAt: Date; metadata: any }[] = [];
  const eventTypes: EventType[] = ['view', 'send', 'open', 'click', 'download'];
  
  // Create more realistic event patterns based on resume age
  const isRecentlyCreated = daysSinceCreation < 7;
  const isActive = daysSinceCreation < 30;
  
  // Higher chance of events for newer resumes
  const baseChance = isRecentlyCreated ? 0.8 : isActive ? 0.4 : 0.1;
  
  // Generate correlated events (e.g., view -> click -> download)
  if (Math.random() < baseChance) {
    // Always start with a view
    const viewTime = addMinutes(
      startOfDay(date),
      faker.number.int({ min: 0, max: 24 * 60 })
    );
    
    events.push({
      resumeId,
      type: 'view',
      createdAt: viewTime,
      metadata: { source: faker.helpers.arrayElement(['email', 'linkedin', 'direct', 'referral']) }
    });

    // 60% chance of sending after viewing
    if (Math.random() < 0.6) {
      events.push({
        resumeId,
        type: 'send',
        createdAt: addMinutes(viewTime, faker.number.int({ min: 1, max: 60 })),
        metadata: { source: 'email' }
      });

      // 40% chance of opening after sending
      if (Math.random() < 0.4) {
        const openTime = addMinutes(viewTime, faker.number.int({ min: 60, max: 180 }));
        events.push({
          resumeId,
          type: 'open',
          createdAt: openTime,
          metadata: { source: 'email' }
        });

        // 30% chance of clicking after opening
        if (Math.random() < 0.3) {
          events.push({
            resumeId,
            type: 'click',
            createdAt: addMinutes(openTime, faker.number.int({ min: 1, max: 30 })),
            metadata: { source: 'email' }
          });

          // 20% chance of downloading after clicking
          if (Math.random() < 0.2) {
            events.push({
              resumeId,
              type: 'download',
              createdAt: addMinutes(openTime, faker.number.int({ min: 2, max: 45 })),
              metadata: { source: 'email' }
            });
          }
        }
      }
    }
  }
  
  return events;
}

function generateTrackingId(): string {
  return faker.string.alphanumeric(8).toLowerCase();
}

function generateJobTitle(): string {
  const level = faker.helpers.arrayElement([
    'Junior', 'Senior', 'Lead', 'Principal', 'Staff', 'Distinguished'
  ]);
  const role = faker.helpers.arrayElement([
    'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
    'DevOps Engineer', 'Solutions Architect', 'Technical Program Manager'
  ]);
  return `${level} ${role}`;
}

// Define seed data
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
  },
  { 
    name: 'Microsoft',
    website: 'microsoft.com',
    industry: 'Technology',
    location: 'Redmond, WA',
    size: '150,000+',
    description: 'Global technology company focused on software, cloud, and enterprise solutions.'
  },
  { 
    name: 'Google',
    website: 'google.com',
    industry: 'Technology',
    location: 'Mountain View, CA',
    size: '100,000+',
    description: 'Leading technology company specializing in search, cloud computing, and AI.'
  },
  { 
    name: 'Amazon',
    website: 'amazon.com',
    industry: 'Technology',
    location: 'Seattle, WA',
    size: '1,000,000+',
    description: 'E-commerce and cloud computing leader with diverse technology initiatives.'
  }
];

const deviceTypes: DeviceType[] = ['desktop', 'mobile', 'tablet'];
const locations = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Denver, CO'
];

async function main() {
  // Clear existing data in the correct order
  await prisma.resumeEvent.deleteMany();
  await prisma.trackingLog.deleteMany();
  await prisma.applicationTracking.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.company.deleteMany();

  // Create companies first
  const createdCompanies = await Promise.all(
    companies.map(company => 
      prisma.company.create({
        data: company
      })
    )
  );

  // Track all created resumes for event generation
  const createdResumes: Array<{ id: string; createdAt: Date }> = [];

  // Create resumes for each company
  for (const company of createdCompanies) {
    const numResumes = faker.number.int({ min: 2, max: 3 });
    
    for (let i = 0; i < numResumes; i++) {
      const createdAt = subDays(new Date(), faker.number.int({ min: 1, max: 180 }));
      const trackingId = generateTrackingId();
      
      const resume = await prisma.resume.create({
        data: {
          jobTitle: generateJobTitle(),
          companyId: company.id,
          trackingId,
          trackingUrl: `https://dyr.fyi/${trackingId}`,
          jobListingUrl: faker.internet.url(),
          status: 'active',
          version: 1,
          originalContent: faker.lorem.paragraphs(3),
          currentContent: faker.lorem.paragraphs(3),
          metadata: { keywords: faker.helpers.multiple(() => faker.word.sample(), { count: 5 }) },
          layoutPreferences: { theme: 'modern', fontSize: '12pt' },
          tags: faker.helpers.arrayElements(['Remote', 'Hybrid', 'On-site', 'Full-time', 'Contract'], { min: 2, max: 5 }),
          companyType: faker.helpers.arrayElement(['Public', 'Private', 'Startup', 'Enterprise', 'Fortune 500']),
          jobLevel: faker.helpers.arrayElement(['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Director']),
          applicationStatus: faker.helpers.arrayElement(['draft', 'sent', 'interviewing', 'rejected', 'accepted']),
          createdAt
        }
      });

      createdResumes.push({ id: resume.id, createdAt });
    }
  }

  // Generate events and logs for all resumes
  for (const resume of createdResumes) {
    const events: Array<{
      resumeId: string;
      type: EventType;
      createdAt: Date;
      metadata: any;
    }> = [];
    
    const logs: Array<{
      resumeId: string;
      deviceType: DeviceType;
      location: string;
      ipAddress: string;
      userAgent: string;
      referrer: string;
      duration: number;
      createdAt: Date;
    }> = [];

    // Generate events from creation date until now
    const today = new Date();
    let currentDate = resume.createdAt;
    let lastEventDate = null;

    while (currentDate <= today) {
      const daysSinceCreation = differenceInDays(currentDate, resume.createdAt);
      const dailyEvents = generateEventsForDay(resume.id, currentDate, daysSinceCreation);
      
      if (dailyEvents.length > 0) {
        // Keep track of the latest event date
        const latestEventDate = dailyEvents.reduce((latest, event) => 
          event.createdAt > latest ? event.createdAt : latest, 
          dailyEvents[0].createdAt
        );
        lastEventDate = lastEventDate ? 
          (latestEventDate > lastEventDate ? latestEventDate : lastEventDate) : 
          latestEventDate;

        // Add events to the batch
        events.push(...dailyEvents);

        // Generate corresponding logs for view events
        const viewEvents = dailyEvents.filter(e => e.type === 'view');
        viewEvents.forEach(event => {
          logs.push({
            resumeId: resume.id,
            deviceType: deviceTypes[faker.number.int({ min: 0, max: deviceTypes.length - 1 })],
            location: locations[faker.number.int({ min: 0, max: locations.length - 1 })],
            ipAddress: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
            referrer: faker.internet.url(),
            duration: faker.number.int({ min: 30, max: 300 }),
            createdAt: event.createdAt
          });
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    // Batch create events and logs
    if (events.length > 0) {
      await prisma.resumeEvent.createMany({
        data: events
      });
    }

    if (logs.length > 0) {
      await prisma.trackingLog.createMany({
        data: logs
      });
    }

    // Update resume with calculated metrics
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        viewCount: logs.length,
        uniqueLocations: new Set(logs.map(log => log.location)).size,
        lastAccessedAt: lastEventDate || resume.createdAt,
        avgViewDuration: logs.reduce((sum, log) => sum + log.duration, 0) / (logs.length || 1)
      }
    });
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