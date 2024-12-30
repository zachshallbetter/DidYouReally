// @ts-check
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.trackingLog.deleteMany();
  await prisma.resumeEvent.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.company.deleteMany();

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Google',
        website: 'https://google.com',
        industry: 'Technology',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Microsoft',
        website: 'https://microsoft.com',
        industry: 'Technology',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Apple',
        website: 'https://apple.com',
        industry: 'Technology',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Amazon',
        website: 'https://amazon.com',
        industry: 'Technology',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Meta',
        website: 'https://meta.com',
        industry: 'Technology',
      },
    }),
  ]);

  // Create resumes
  const resumes = await Promise.all(
    companies.map((company) =>
      prisma.resume.create({
        data: {
          jobTitle: faker.person.jobTitle(),
          companyId: company.id,
          trackingUrl: faker.internet.url(),
          jobListingUrl: faker.internet.url(),
          status: 'active',
          version: 1,
          metadata: {},
        },
      })
    )
  );

  // Generate tracking logs and events for the past 30 days
  const deviceTypes = ['desktop', 'mobile', 'tablet', 'unknown'];
  const eventTypes = ['view', 'send', 'open', 'click', 'download'];
  const locations = [
    { city: 'San Francisco', country: 'USA' },
    { city: 'New York', country: 'USA' },
    { city: 'London', country: 'UK' },
    { city: 'Toronto', country: 'Canada' },
    { city: 'Berlin', country: 'Germany' },
  ];

  for (const resume of resumes) {
    // Generate 20-50 tracking logs per resume
    const numLogs = faker.number.int({ min: 20, max: 50 });
    
    for (let i = 0; i < numLogs; i++) {
      const date = subDays(new Date(), faker.number.int({ min: 0, max: 30 }));
      const location = faker.helpers.arrayElement(locations);
      const deviceType = faker.helpers.arrayElement(deviceTypes);
      const eventType = faker.helpers.arrayElement(eventTypes);
      const duration = eventType === 'view' ? faker.number.int({ min: 10, max: 300 }) : null;

      await prisma.trackingLog.create({
        data: {
          resumeId: resume.id,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          deviceType,
          location: `${location.city}, ${location.country}`,
          duration,
          createdAt: date,
        },
      });

      // Create corresponding event
      await prisma.resumeEvent.create({
        data: {
          resumeId: resume.id,
          type: eventType,
          metadata: {},
          createdAt: date,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });