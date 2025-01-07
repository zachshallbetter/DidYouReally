import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { subDays, addHours, subMonths, addMinutes, startOfDay, endOfDay, differenceInDays, addDays } from 'date-fns';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout', 
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});

async function main() {
  // Clear existing data
  await prisma.trackingLog.deleteMany();
  await prisma.event.deleteMany();
  await prisma.resume.deleteMany();

  const companies = [
    {
      name: 'Meta',
      industry: 'Technology', 
      location: 'Menlo Park, CA'
    },
    {
      name: 'Apple',
      industry: 'Technology',
      location: 'Cupertino, CA'
    },
    {
      name: 'Google',
      industry: 'Technology',
      location: 'Mountain View, CA'
    }
  ];

  const deviceTypes = ['desktop', 'mobile', 'tablet', 'cloud'];
  const sources = ['email', 'linkedin', 'direct', 'referral'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const operatingSystems = ['Windows', 'Mac OS X', 'iOS', 'Android'];

  // Create resumes
  for (const company of companies) {
    const resume = await prisma.resume.create({
      data: {
        jobTitle: faker.person.jobTitle(),
        company,
        jobListingUrl: faker.internet.url(),
        viewCount: 0,
        uniqueLocations: 0,
        deviceAccessCount: 0,
        cloudAccessCount: 0,
        avgViewDuration: 0,
        recentViewCount: 0,
        uniqueLocationsLast7Days: 0,
        distinctDeviceCount: 0,
      },
    });

    // Create tracking logs
    const numLogs = faker.number.int({ min: 5, max: 15 });
    for (let i = 0; i < numLogs; i++) {
      const deviceType = faker.helpers.arrayElement(deviceTypes);
      const browser = faker.helpers.arrayElement(browsers);
      const os = faker.helpers.arrayElement(operatingSystems);
      const source = faker.helpers.arrayElement(sources);

      await prisma.trackingLog.create({
        data: {
          resumeId: resume.id,
          location: faker.location.city() + ', ' + faker.location.state(),
          deviceType,
          ipAddress: faker.internet.ip(),
          userAgent: `${browser}/115.0.0.0 (${os} 10.15.7)`,
          source,
          createdAt: faker.date.recent({ days: 7 }),
        },
      });

      // Create corresponding event
      await prisma.event.create({
        data: {
          resumeId: resume.id,
          type: 'view',
          metadata: {
            source,
            deviceType,
            location: faker.location.city() + ', ' + faker.location.state(),
          },
          createdAt: faker.date.recent({ days: 7 }),
        },
      });
    }

    // Add some cloud service views
    const numCloudViews = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < numCloudViews; i++) {
      await prisma.trackingLog.create({
        data: {
          resumeId: resume.id,
          location: 'Cloud Service',
          deviceType: 'cloud',
          source: 'ats',
          createdAt: faker.date.recent({ days: 7 }),
        },
      });

      await prisma.event.create({
        data: {
          resumeId: resume.id,
          type: 'view',
          metadata: {
            source: 'ats',
            deviceType: 'cloud',
            location: 'Cloud Service',
          },
          createdAt: faker.date.recent({ days: 7 }),
        },
      });
    }

    // Add some additional metrics
    const numLocations = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < numLocations; i++) {
      await prisma.trackingLog.create({
        data: {
          resumeId: resume.id,
          location: faker.location.city() + ', ' + faker.location.state(),
          deviceType: faker.helpers.arrayElement(deviceTypes),
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          source: faker.helpers.arrayElement(sources),
          createdAt: faker.date.recent({ days: 30 }),
          duration: faker.number.int({ min: 30, max: 300 }),
        },
      });
    }

    // Update resume metrics
    const logs = await prisma.trackingLog.findMany({
      where: { resumeId: resume.id }
    });
    const uniqueLocations = new Set(logs.map((log) => log.location));
    const recentLogs = logs.filter((log) => 
      differenceInDays(new Date(), log.createdAt) <= 7
    );
    const uniqueLocationsLast7Days = new Set(recentLogs.map((log) => log.location));

    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        viewCount: logs.length,
        uniqueLocations: uniqueLocations.size,
        deviceAccessCount: logs.filter((log) => log.deviceType !== 'cloud').length,
        cloudAccessCount: logs.filter((log) => log.deviceType === 'cloud').length,
        avgViewDuration: logs.reduce((sum: number, log) => sum + (log.duration || 0), 0) / logs.length,
        recentViewCount: recentLogs.length,
        uniqueLocationsLast7Days: uniqueLocationsLast7Days.size,
      }
    });
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