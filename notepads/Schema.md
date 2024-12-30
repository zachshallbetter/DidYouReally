# Prisma Schema

You're right. Let me propose a more maintainable approach using Prisma, which provides several advantages:

1. **Schema-First Development**:
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Company {
  id        String   @id @default(uuid())
  name      String   @unique
  website   String?
  industry  String?
  resumes   Resume[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("companies")
}

model Resume {
  id              String    @id @default(uuid())
  jobTitle        String    @map("job_title")
  company         Company   @relation(fields: [companyId], references: [id])
  companyId       String    @map("company_id")
  trackingUrl     String    @map("tracking_url")
  status         String    @default("active")
  version        Int       @default(1)
  events         Event[]
  logs           TrackingLog[]
  // ... other fields

  @@map("resumes")
}
```

2. **Type-Safe Seeding**:
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const companies = await prisma.company.createMany({
    data: [
      { name: 'Tech Solutions Inc', website: 'https://techsolutions.com' },
      // ... other companies
    ],
    skipDuplicates: true
  })
  
  // Seed resumes with proper relations
  const resumes = await prisma.resume.createMany({
    data: [
      { 
        jobTitle: 'Senior Software Engineer',
        companyId: companies[0].id,
        trackingUrl: 'tracking-001'
      },
      // ... other resumes
    ]
  })
}

main()
```

Benefits of this approach:

- Automatic TypeScript types generation
- Schema migrations are handled automatically
- Relationships are enforced at the schema level
- Seeding is type-safe and reusable
- Built-in data validation
- Better developer experience with IDE support

## Schema

1. **Core Tables**:
   - `companies`: Company profiles
   - `resumes`: Resume documents and metadata
   - `tracking_logs`: View and interaction tracking
   - `resume_events`: Detailed event tracking
   - `user_preferences`: User settings
   - `application_tracking`: Application status tracking

2. **Enums**:
   - `ResumeStatus`: active, archived, deleted
   - `ApplicationStatus`: draft, sent, interviewing, rejected, accepted
   - `DeviceType`: desktop, mobile, tablet, unknown
   - `ThemeType`: light, dark, system
   - `EventType`: view, send, open, click, download
   - `ApplicationTrackingStatus`: applied, screening, interviewing, offered, rejected, accepted, withdrawn

3. **Key Relationships**:

   ```sql
   Company 1:N Resume
   Resume 1:N TrackingLog
   Resume 1:N ResumeEvent
   Resume 1:N ApplicationTracking
   ```

4. **Important Features**:
   - UUID primary keys
   - Timestamp tracking (created_at, updated_at)
   - Soft deletes for resumes
   - JSONB for flexible metadata storage
   - Proper indexing on foreign keys and status fields
   - Cascading deletes where appropriate
   - Data retention policies
   - Version control for resumes

Here's a Prisma schema that would capture all these requirements:

```prisma:notepads/Schema.md
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ResumeStatus {
  active
  archived
  deleted
}

enum ApplicationStatus {
  draft
  sent
  interviewing
  rejected
  accepted
}

enum DeviceType {
  desktop
  mobile
  tablet
  unknown
}

enum EventType {
  view
  send
  open
  click
  download
}

enum ApplicationTrackingStatus {
  applied
  screening
  interviewing
  offered
  rejected
  accepted
  withdrawn
}

model Company {
  id        String   @id @default(uuid())
  name      String   @unique
  website   String?
  industry  String?
  resumes   Resume[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("companies")
}

model Resume {
  id                String      @id @default(uuid())
  jobTitle         String      @map("job_title")
  company          Company     @relation(fields: [companyId], references: [id], onDelete: Restrict)
  companyId        String      @map("company_id")
  trackingUrl      String      @map("tracking_url")
  jobListingUrl    String?     @map("job_listing_url")
  status           ResumeStatus @default(active)
  version          Int         @default(1)
  archivedAt       DateTime?   @map("archived_at")
  originalContent  String?     @map("original_content")
  metadata         Json        @default("{}")
  layoutPreferences Json       @default("{}") @map("layout_preferences")
  tags             String[]    @default([])
  companyType      String?     @map("company_type")
  jobLevel         String?     @map("job_level")
  applicationStatus ApplicationStatus?
  lastAccessedAt   DateTime?   @map("last_accessed_at")
  lastModifiedBy   String?     @map("last_modified_by")
  viewCount        Int         @default(0) @map("view_count")
  uniqueLocations  Int         @default(0) @map("unique_locations")
  avgViewDuration  Float       @default(0) @map("avg_view_duration")
  createdAt        DateTime    @default(now()) @map("created_at")
  updatedAt        DateTime    @updatedAt @map("updated_at")
  
  trackingLogs     TrackingLog[]
  events           ResumeEvent[]
  applications     ApplicationTracking[]

  @@index([status])
  @@index([applicationStatus])
  @@map("resumes")
}

// ... remaining models follow same pattern
```

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ResumeStatus {
  active
  archived
  deleted
}

enum ApplicationStatus {
  draft
  sent
  interviewing
  rejected
  accepted
}

enum DeviceType {
  desktop
  mobile
  tablet
  unknown
}

enum EventType {
  view
  send
  open
  click
  download
}

enum ApplicationTrackingStatus {
  applied
  screening
  interviewing
  offered
  rejected
  accepted
  withdrawn
}

model Company {
  id          String    @id @default(uuid())
  name        String    @unique
  website     String?
  industry    String?
  location    String?
  size        String?
  description String?
  resumes     Resume[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("companies")
}

model Resume {
  id                String               @id @default(uuid())
  jobTitle         String               @map("job_title")
  company          Company              @relation(fields: [companyId], references: [id], onDelete: Restrict)
  companyId        String               @map("company_id")
  trackingUrl      String               @unique @map("tracking_url")
  jobListingUrl    String?              @map("job_listing_url")
  status           ResumeStatus         @default(active)
  version          Int                  @default(1)
  archivedAt       DateTime?            @map("archived_at")
  originalContent  String?              @map("original_content")
  currentContent   String?              @map("current_content")
  metadata         Json                 @default("{}")
  layoutPreferences Json                @default("{}") @map("layout_preferences")
  tags             String[]             @default([])
  companyType      String?              @map("company_type")
  jobLevel         String?              @map("job_level")
  applicationStatus ApplicationStatus?
  lastAccessedAt   DateTime?            @map("last_accessed_at")
  lastModifiedBy   String?              @map("last_modified_by")
  viewCount        Int                  @default(0) @map("view_count")
  uniqueLocations  Int                  @default(0) @map("unique_locations")
  avgViewDuration  Float                @default(0) @map("avg_view_duration")
  createdAt        DateTime             @default(now()) @map("created_at")
  updatedAt        DateTime             @updatedAt @map("updated_at")
  
  trackingLogs     TrackingLog[]
  events           ResumeEvent[]
  applications     ApplicationTracking[]
  versions         ResumeVersion[]

  @@index([status])
  @@index([applicationStatus])
  @@index([companyId])
  @@map("resumes")
}

model ResumeVersion {
  id          String   @id @default(uuid())
  resume      Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  resumeId    String   @map("resume_id")
  version     Int
  content     String
  metadata    Json     @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")

  @@unique([resumeId, version])
  @@index([resumeId])
  @@map("resume_versions")
}

model TrackingLog {
  id              String    @id @default(uuid())
  resume          Resume    @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  resumeId        String    @map("resume_id")
  ipAddress       String?   @map("ip_address")
  userAgent       String?   @map("user_agent")
  deviceType      DeviceType @default(unknown)
  location        String?
  referrer        String?
  duration        Int?      // Duration in seconds
  createdAt       DateTime  @default(now()) @map("created_at")

  @@index([resumeId])
  @@index([createdAt])
  @@map("tracking_logs")
}

model ResumeEvent {
  id          String    @id @default(uuid())
  resume      Resume    @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  resumeId    String    @map("resume_id")
  type        EventType
  metadata    Json      @default("{}")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([resumeId])
  @@index([type])
  @@map("resume_events")
}

model ApplicationTracking {
  id          String                    @id @default(uuid())
  resume      Resume                    @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  resumeId    String                    @map("resume_id")
  status      ApplicationTrackingStatus
  notes       String?
  appliedAt   DateTime                  @map("applied_at")
  updatedAt   DateTime                  @updatedAt @map("updated_at")

  @@index([resumeId])
  @@index([status])
  @@map("application_tracking")
}
```
