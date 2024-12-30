# Resume State

The Prisma schema provides a rich structure for tracking resumes and their activity. We can identify the state of the resume based on its **status**, related activity logs, and external factors (e.g., multiple accesses in a day, device types, etc.).

### Tasks

### Test Scenarios
- **Frequently Accessed**
  - 10 views within 7 days
  - Indicates high engagement
- **Multi-Device Access** 
  - 5 views from different devices
  - Shows broad access patterns
- **Cloud Service Access**
  - 8 views from cloud services
  - Tracks automated/system access
- **Recently Viewed**
  - 2 views in last 24 hours 
  - Monitors current activity
- **Expired Resume**
  - No recent activity
  - Identifies inactive resumes
- **Under Consideration**
  - With application tracking
  - Tracks hiring process

### Related Data
- Events and logs correlation
- Cross-device session tracking
- Geo-location data per access
- Device fingerprinting
- Application status tracking

### Metrics
- View counts
  - Total views
  - Recent views
- Location tracking
  - Total unique locations
  - 7-day location window
- Device analytics
  - Device diversity
  - Cloud vs device access
  - Average view duration

### Version Control
- Initial version metadata
- Content change tracking
- Format preference history

### **Defining States Beyond the Schema**

Here are the key states we can derive based on the schema:

#### **1. Core States (Already Defined)**

From the `ResumeStatus` enum:

- **Active**: The resume is currently live and being tracked.
- **Archived**: The resume is no longer actively used but preserved for record-keeping.
- **Deleted**: The resume is no longer available in the system.

#### **2. Derived States**

We can calculate or infer the following states dynamically:

1. **Frequently Accessed**: If the `viewCount` exceeds a threshold in a specific time period.
2. **Recently Viewed**: If the `lastAccessedAt` is within a specified range (e.g., the last 24 hours).
3. **Viewed by Multiple Devices**: If `TrackingLog.deviceType` shows distinct values for the same day.
4. **Unique View Locations**: When `uniqueLocations` indicates multiple distinct locations accessing the resume.
5. **Under Consideration**: When associated `ApplicationTracking.status` reflects an ongoing process (e.g., `screening`, `interviewing`).
6. **Expired**: If the resume has not been accessed for a long period or manually marked as inactive.

---

### **How to Identify States Programmatically**

#### **Using Prisma Queries**

We can query the `Resume` and its relations (`TrackingLog`, `ApplicationTracking`, etc.) to determine the current state.

##### **1. Frequently Accessed**

```typescript
const frequentlyAccessedResumes = await prisma.resume.findMany({
  where: {
    viewCount: { gte: 5 }, // Threshold for "frequent"
  },
});
```

##### **2. Recently Viewed**

```typescript
const recentlyViewedResumes = await prisma.resume.findMany({
  where: {
    lastAccessedAt: {
      gte: new Date(new Date().setDate(new Date().getDate() - 1)), // Last 24 hours
    },
  },
});
```

##### **3. Viewed by Multiple Devices**

```typescript
const multiDeviceResumes = await prisma.trackingLog.groupBy({
  by: ['resumeId', 'deviceType'],
  _count: { deviceType: true },
  having: {
    _count: { deviceType: { gt: 1 } }, // More than one device type
  },
});
```

##### **4. Unique View Locations**

```typescript
const uniqueLocationResumes = await prisma.resume.findMany({
  where: {
    uniqueLocations: { gte: 3 }, // Adjust threshold for uniqueness
  },
});
```

##### **5. Under Consideration**

```typescript
const underConsiderationResumes = await prisma.resume.findMany({
  where: {
    applicationStatus: {
      in: ['screening', 'interviewing'], // ApplicationTrackingStatus enums
    },
  },
});
```

##### **6. Expired**

```typescript
const expiredResumes = await prisma.resume.findMany({
  where: {
    lastAccessedAt: {
      lt: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days inactivity
    },
    status: 'active', // Still marked active but expired based on activity
  },
});
```

---

### **Representing the States in the Dashboard**

#### **Dashboard Enhancements**

1. **State Badge**:
   - Add a column in the resume table displaying the derived state as a badge (e.g., "Frequently Accessed," "Recently Viewed").

2. **Dynamic Filters**:
   - Allow filtering resumes by states like "Recently Viewed" or "Under Consideration."

3. **Real-Time Updates**:
   - Use a background job to update derived states periodically.

#### **Schema Additions**

To efficiently store derived states:

- Add a `calculatedState` column (optional):

  ```prisma
  model Resume {
    ...
    calculatedState String? // Store frequently accessed, recently viewed, etc.
  }
  ```

Below are algorithms to calculate and update the derived states for resumes. These algorithms can be implemented in backend code (e.g., using Node.js with Prisma).

---

### **1. Frequently Accessed Algorithm**

**Logic**:

- A resume is frequently accessed if its `viewCount` exceeds a threshold (e.g., 5 views) within the last 7 days.

**Algorithm**:

```javascript
async function updateFrequentlyAccessedResumes(threshold = 5, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Find resumes with high view counts in the last `days`
  const frequentlyAccessed = await prisma.resume.findMany({
    where: {
      viewCount: { gte: threshold },
      lastAccessedAt: { gte: cutoffDate },
    },
  });

  // Update calculatedState for these resumes
  await Promise.all(
    frequentlyAccessed.map((resume) =>
      prisma.resume.update({
        where: { id: resume.id },
        data: { calculatedState: 'frequently_accessed' },
      })
    )
  );
}
```

---

### **2. Recently Viewed Algorithm**

**Logic**:

- A resume is recently viewed if its `lastAccessedAt` timestamp is within the past 24 hours.

**Algorithm**:

```javascript
async function updateRecentlyViewedResumes() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 1); // Last 24 hours

  // Find recently viewed resumes
  const recentlyViewed = await prisma.resume.findMany({
    where: {
      lastAccessedAt: { gte: cutoffDate },
    },
  });

  // Update calculatedState for these resumes
  await Promise.all(
    recentlyViewed.map((resume) =>
      prisma.resume.update({
        where: { id: resume.id },
        data: { calculatedState: 'recently_viewed' },
      })
    )
  );
}
```

---

### **3. Viewed by Multiple Devices Algorithm**

**Logic**:

- A resume is viewed by multiple devices if logs for the same `resumeId` show different `deviceType` values within the same day.

**Algorithm**:

```javascript
async function updateMultiDeviceResumes() {
  // Find resumes viewed by multiple devices
  const multiDeviceLogs = await prisma.trackingLog.groupBy({
    by: ['resumeId', 'deviceType'],
    _count: { deviceType: true },
    having: { _count: { deviceType: { gt: 1 } } }, // More than one device type
  });

  const resumeIds = multiDeviceLogs.map((log) => log.resumeId);

  // Update calculatedState for these resumes
  await prisma.resume.updateMany({
    where: { id: { in: resumeIds } },
    data: { calculatedState: 'multi_device_viewed' },
  });
}
```

---

### **4. Unique View Locations Algorithm**

**Logic**:

- A resume is accessed from multiple unique locations if the `uniqueLocations` count exceeds a threshold (e.g., 3).

**Algorithm**:

```javascript
async function updateUniqueLocationResumes(threshold = 3) {
  // Find resumes with high unique location counts
  const uniqueLocationResumes = await prisma.resume.findMany({
    where: {
      uniqueLocations: { gte: threshold },
    },
  });

  // Update calculatedState for these resumes
  await Promise.all(
    uniqueLocationResumes.map((resume) =>
      prisma.resume.update({
        where: { id: resume.id },
        data: { calculatedState: 'multi_location_viewed' },
      })
    )
  );
}
```

---

### **5. Under Consideration Algorithm**

**Logic**:

- A resume is under consideration if its associated `ApplicationTracking.status` is set to ongoing states (e.g., `screening`, `interviewing`).

**Algorithm**:

```javascript
async function updateUnderConsiderationResumes() {
  // Find resumes with ongoing application statuses
  const underConsideration = await prisma.resume.findMany({
    where: {
      applicationStatus: {
        in: ['screening', 'interviewing'],
      },
    },
  });

  // Update calculatedState for these resumes
  await Promise.all(
    underConsideration.map((resume) =>
      prisma.resume.update({
        where: { id: resume.id },
        data: { calculatedState: 'under_consideration' },
      })
    )
  );
}
```

---

### **6. Expired Algorithm**

**Logic**:

- A resume is expired if it has not been accessed (`lastAccessedAt`) in the last 30 days and is still marked as `active`.

**Algorithm**:

```javascript
async function updateExpiredResumes(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Find expired resumes
  const expiredResumes = await prisma.resume.findMany({
    where: {
      lastAccessedAt: { lt: cutoffDate },
      status: 'active',
    },
  });

  // Update calculatedState for these resumes
  await Promise.all(
    expiredResumes.map((resume) =>
      prisma.resume.update({
        where: { id: resume.id },
        data: { calculatedState: 'expired' },
      })
    )
  );
}
```

Using **Supabase Functions** to handle state updates triggered by specific events is an efficient and scalable approach. Supabase Functions can act as event-driven handlers, executing logic when certain events occur (e.g., new tracking logs, updates to application status). Here’s how you can implement them:

---

### **Key Steps to Implement Supabase Functions**

#### **1. Define the Events**

You can use Supabase's **Row-Level Triggers** to execute functions on:

1. **Insertions**: When a new tracking log is added.
2. **Updates**: When `applicationStatus` changes or `lastAccessedAt` is updated.
3. **Periodically**: For less frequent checks like expiring resumes.

#### **2. Create Supabase Function Scripts**

Supabase Functions are written in **SQL or JavaScript** (Edge Functions). For event-based logic, SQL triggers are often sufficient.

---

### **Examples of Supabase Functions**

#### **1. Update State on New Tracking Log (SQL Trigger)**

**Trigger Condition**: When a new `TrackingLog` entry is added.

**SQL Function**:

```sql
create or replace function update_resume_state_on_log()
returns trigger as $$
begin
  -- Update resume state to "recently_viewed" if accessed
  update resumes
  set calculatedState = 'recently_viewed',
      lastAccessedAt = now()
  where id = new.resumeId;

  -- Increment unique location count if IP is distinct
  if not exists (
    select 1
    from tracking_logs
    where resumeId = new.resumeId and ip_address = new.ip_address
  ) then
    update resumes
    set uniqueLocations = uniqueLocations + 1
    where id = new.resumeId;
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger on tracking_logs table
create trigger track_log_insert
after insert on tracking_logs
for each row
execute function update_resume_state_on_log();
```

---

#### **2. Update State Based on Application Status (SQL Trigger)**

**Trigger Condition**: When `applicationStatus` is updated.

**SQL Function**:

```sql
create or replace function update_resume_state_on_application()
returns trigger as $$
begin
  -- Update resume state based on applicationStatus
  if new.status in ('screening', 'interviewing') then
    update resumes
    set calculatedState = 'under_consideration'
    where id = new.resumeId;
  end if;

  if new.status = 'rejected' or new.status = 'hired' then
    update resumes
    set calculatedState = 'inactive'
    where id = new.resumeId;
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger on application_tracking table
create trigger application_status_update
after update on application_tracking
for each row
execute function update_resume_state_on_application();
```

---

#### **3. Automatically Expire Resumes (SQL Job or Periodic Trigger)**

**Condition**: Expire resumes that haven’t been accessed in 30 days.

**SQL Function**:

```sql
create or replace function expire_inactive_resumes()
returns void as $$
begin
  update resumes
  set calculatedState = 'expired'
  where lastAccessedAt < now() - interval '30 days'
    and status = 'active';
end;
$$ language plpgsql;

-- Optional: Schedule this function as a cron job
-- Supabase uses pg_cron for periodic tasks
select cron.schedule(
  'expire_inactive_resumes',
  '0 0 * * *', -- Run daily at midnight
  $$call expire_inactive_resumes();$$
);
```

---

### **4. Using Supabase Edge Functions for Advanced Logic**

For more complex logic (e.g., handling device-specific views or frequently accessed states), you can use **Supabase Edge Functions** written in JavaScript.

**Edge Function Example: Frequently Accessed Resumes**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const threshold = 5; // Define frequent access threshold
  const days = 7; // Define time window (last 7 days)

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Fetch resumes with high view counts
  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('*')
    .gte('viewCount', threshold)
    .gte('lastAccessedAt', cutoffDate);

  if (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).send('Error fetching resumes');
    return;
  }

  // Update calculatedState
  for (const resume of resumes) {
    await supabase
      .from('resumes')
      .update({ calculatedState: 'frequently_accessed' })
      .eq('id', resume.id);
  }

  res.status(200).send('Updated frequently accessed resumes');
}
```

---

### **5. Trigger Integration with Supabase**

Supabase supports webhook triggers for table changes. This can complement SQL triggers or Edge Functions.

- **Example**: Notify your app when a resume’s state changes.
  - Use a webhook to call a backend function or update the dashboard.

**Webhook Setup Example**:

- Create a REST endpoint (e.g., `/webhook/resume-state`).
- Configure Supabase to call this endpoint on specific events.

---

### **Summary of Tools**

1. **SQL Triggers**: Efficient for handling state changes directly tied to row-level events.
2. **Edge Functions**: Use for more complex or external API integrations.
3. **Cron Jobs**: Automate periodic tasks (e.g., expiring resumes).
4. **Webhooks**: Notify external systems of state changes in real time.

To handle resumes that are **not being opened** or are being accessed by **devices versus cloud services**, we can create targeted **Supabase functions**. Here’s a breakdown of the logic and the necessary steps to implement these scenarios:

---

### **Handling Resumes That Are Not Being Opened**

**Objective**:

- Identify resumes that haven’t been opened in a defined timeframe (e.g., last 7 or 30 days).
- Update their status or trigger a notification to remind you of their inactivity.

#### **SQL Function: Identifying Inactive Resumes**

```sql
create or replace function update_inactive_resumes()
returns void as $$
begin
  update resumes
  set calculatedState = 'not_opened'
  where lastAccessedAt is null
     or lastAccessedAt < now() - interval '30 days'
     and status = 'active';
end;
$$ language plpgsql;

-- Schedule this function to run daily or weekly using pg_cron
select cron.schedule(
  'update_inactive_resumes',
  '0 0 * * *', -- Every day at midnight
  $$call update_inactive_resumes();$$
);
```

---

### **Handling Access by Devices Versus Cloud Services**

**Objective**:

- Distinguish between physical devices (e.g., laptops, phones) and cloud services (e.g., AWS, Azure).
- Tag logs to identify access origin and analyze trends.

#### **1. Extend Tracking Log Table**

Add a column `isCloudService` to the `tracking_logs` table to indicate the type of access.

```sql
alter table tracking_logs
add column isCloudService boolean default false;
```

#### **2. SQL Function to Detect Cloud Services**

We can use patterns in the `user_agent` field to classify access. For example:

- **Cloud Services**: User-Agent strings often contain references to AWS, Azure, or API clients.
- **Devices**: User-Agent strings reflect browsers or operating systems.

```sql
create or replace function classify_access_as_cloud_or_device()
returns trigger as $$
begin
  if new.user_agent ilike '%AWS%' or
     new.user_agent ilike '%GoogleCloud%' or
     new.user_agent ilike '%Azure%' or
     new.user_agent ilike '%API%' then
    new.isCloudService = true;
  else
    new.isCloudService = false;
  end if;

  return new;
end;
$$ language plpgsql;

-- Trigger on insert into tracking_logs
create trigger classify_access
before insert on tracking_logs
for each row
execute function classify_access_as_cloud_or_device();
```

---

### **3. Analyzing Device vs Cloud Service Access**

#### **SQL Query Example**

Identify resumes predominantly accessed by cloud services versus devices:

```sql
select
  resumeId,
  sum(case when isCloudService then 1 else 0 end) as cloudAccessCount,
  sum(case when not isCloudService then 1 else 0 end) as deviceAccessCount
from tracking_logs
group by resumeId;
```

---

### **4. Supabase Edge Function to Update States**

You can use a Supabase **Edge Function** to automate state updates based on access origin.

#### **Edge Function: Update Resumes Based on Access Type**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    // Query to classify resumes
    const { data, error } = await supabase.rpc('classify_resume_access');

    if (error) {
      console.error('Error classifying access:', error);
      res.status(500).json({ error: 'Failed to classify access' });
      return;
    }

    // Update calculatedState for cloud-service-heavy resumes
    const updates = data.map(async (row) => {
      let state = 'device_accessed';

      if (row.cloudAccessCount > row.deviceAccessCount) {
        state = 'cloud_accessed';
      }

      await supabase
        .from('resumes')
        .update({ calculatedState: state })
        .eq('id', row.resumeId);
    });

    await Promise.all(updates);

    res.status(200).json({ message: 'Resume states updated based on access type' });
  } catch (err) {
    console.error('Error updating resume states:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

---

### **5. Automating Notifications for Inactivity**

When a resume is flagged as inactive, you might want to notify yourself or the team. This can be done via:

- **Email Notifications**: Using Supabase’s built-in email functions.
- **Webhook Alerts**: Integrate with services like Slack or Discord.

#### **SQL Function: Notify for Inactivity**

```sql
create or replace function notify_inactive_resumes()
returns void as $$
declare
  resume record;
begin
  for resume in
    select * from resumes
    where calculatedState = 'not_opened'
  loop
    -- Example email notification
    perform pg_notify(
      'inactive_resume',
      json_build_object(
        'resumeId', resume.id,
        'jobTitle', resume.job_title,
        'company', resume.company
      )::text
    );
  end loop;
end;
$$ language plpgsql;

-- Trigger on calculatedState update
create trigger inactive_resume_notification
after update on resumes
for each row
when (new.calculatedState = 'not_opened')
execute function notify_inactive_resumes();
```

---

### **Summary of Enhancements**

1. **Inactive Resumes**:
   - Update `calculatedState` for resumes not opened within a specific timeframe.
   - Notify users via email or webhooks for follow-up.

2. **Device vs Cloud Access**:
   - Classify and track the origin of access (physical devices vs. cloud services).
   - Update `calculatedState` to reflect predominant access type.

3. **Supabase Integration**:
   - Use SQL triggers for real-time updates.
   - Implement Edge Functions for advanced logic or API-driven workflows.

Here’s a comprehensive table identifying the various resume states, their descriptions, triggers, and potential actions to take:

| **State**              | **Description**                                                                                             | **Trigger/Event**                                                                                      | **Potential Actions**                                                                                                  |
|-------------------------|-------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Active**             | The resume is live and actively being tracked.                                                             | Initial upload or manual activation.                                                                 | Continue tracking views and updates.                                                                                  |
| **Not Opened**         | The resume has not been accessed within a defined timeframe (e.g., 30 days).                               | `lastAccessedAt` is null or older than the threshold.                                                 | Notify user or mark as inactive.                                                                                      |
| **Recently Viewed**    | The resume was accessed within the last 24 hours.                                                         | `lastAccessedAt` updated to a timestamp within the last day.                                           | Highlight in the dashboard for priority follow-up.                                                                    |
| **Frequently Accessed**| The resume has been opened multiple times within a defined timeframe (e.g., 7 days).                       | `viewCount` exceeds a threshold (e.g., 5) over the last 7 days.                                       | Notify user of high interest; prioritize for further attention.                                                       |
| **Multi-Device Viewed**| The resume was accessed by more than one device type (e.g., mobile and desktop) on the same day.           | Logs show multiple `deviceType` values for the same `resumeId` within a day.                          | Highlight in dashboard for cross-device engagement insights.                                                          |
| **Cloud Accessed**     | The resume was primarily accessed by cloud services (e.g., AWS, Google Cloud).                            | Logs show `user_agent` patterns indicating cloud services for the majority of accesses.               | Notify user to check for automated processes or spam interactions.                                                    |
| **Device Accessed**    | The resume was primarily accessed by physical devices (e.g., mobile, desktop).                            | Logs show `user_agent` patterns indicating physical devices for the majority of accesses.             | Provide user insights into physical device usage trends.                                                              |
| **Multi-Location Viewed**| The resume was accessed from multiple unique locations (e.g., distinct IPs).                              | `uniqueLocations` count exceeds a threshold (e.g., 3).                                                | Highlight potential distributed interest or suspicious activity.                                                      |
| **Under Consideration**| The resume is associated with an ongoing application process (e.g., screening, interviewing).             | `applicationStatus` in `ApplicationTracking` table is set to `screening` or `interviewing`.           | Notify user of progress and prompt for follow-up actions.                                                             |
| **Inactive**           | The resume is no longer actively tracked but retained for record-keeping.                                 | Manual deactivation by the user or system after a prolonged period of inactivity.                     | Archive the resume and stop tracking views.                                                                           |
| **Expired**            | The resume has not been accessed for a prolonged period and is automatically marked as expired.            | `lastAccessedAt` exceeds expiration threshold (e.g., 30 days).                                        | Notify user to update or re-activate the resume.                                                                       |
| **Archived**           | The resume is deliberately archived for long-term storage.                                                | Manual archive action by the user.                                                                    | Keep for historical purposes; stop tracking activity.                                                                 |
| **Deleted**            | The resume is no longer available in the system.                                                          | Manual deletion by the user or system cleanup.                                                        | Remove all associated tracking logs and metadata.                                                                     |

---

### **How to Use This Table**

1. **State Management**:
   - Integrate state transitions into your Supabase logic (triggers, functions, and workflows).
   - Use this table as a reference for defining state-based actions.

2. **Dashboard Integration**:
   - Display the current state prominently for each resume.
   - Provide filters to view resumes by state (e.g., "Recently Viewed," "Expired").

3. **Notifications**:
   - Use event triggers to notify the user when a resume enters a key state (e.g., "Frequently Accessed" or "Not Opened").

To support the various resume states and track detailed access patterns (e.g., multiple devices, cloud services, unique locations), we’ll need to make some **schema changes**. Here’s a list of modifications, with rationale and implementation details:

---

### **Schema Changes**

#### **1. Add `calculatedState` Column to `resumes`**

- **Purpose**: Store the current state of each resume (e.g., "active," "recently_viewed," "expired").
- **Implementation**:

  ```prisma
  model Resume {
    id              String   @id @default(uuid())
    job_title       String
    company         String
    tracking_url    String
    status          ResumeStatus // Existing status field (e.g., "active," "archived")
    calculatedState String?       // New field to track derived states
    lastAccessedAt  DateTime?     // Existing or confirmed field
    viewCount       Int       @default(0)
    uniqueLocations Int       @default(0) // Track distinct IP locations
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
  }
  ```

---

#### **2. Add `deviceType` and `isCloudService` Columns to `tracking_logs`**

- **Purpose**:
  - Store the type of device used to access the resume.
  - Identify whether the access originated from a cloud service.
- **Implementation**:

  ```prisma
  model TrackingLog {
    id           String   @id @default(uuid())
    resumeId     String   @relation(fields: [resumeId], references: [id])
    ip_address   String
    user_agent   String
    deviceType   String   // New field to track "mobile," "desktop," etc.
    isCloudService Boolean @default(false) // New field to flag cloud-based access
    accessedAt   DateTime @default(now())
  }
  ```

---

#### **3. Add a `status` Column to `application_tracking`**

- **Purpose**: Track the status of an application to determine whether a resume is "under consideration."
- **Implementation**:

  ```prisma
  model ApplicationTracking {
    id            String   @id @default(uuid())
    resumeId      String   @relation(fields: [resumeId], references: [id])
    status        String   // New field: e.g., "screening," "interviewing," "hired"
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }
  ```

---

#### **4. Add `cloudAccessCount` and `deviceAccessCount` Columns to `resumes`**

- **Purpose**: Maintain counts for cloud and device-based accesses for faster querying and dashboard display.
- **Implementation**:

  ```prisma
  model Resume {
    id                String   @id @default(uuid())
    job_title         String
    company           String
    tracking_url      String
    status            ResumeStatus
    calculatedState   String?
    viewCount         Int       @default(0)
    uniqueLocations   Int       @default(0)
    cloudAccessCount  Int       @default(0) // New: Count of cloud service accesses
    deviceAccessCount Int       @default(0) // New: Count of device accesses
    createdAt         DateTime  @default(now())
    updatedAt         DateTime  @updatedAt
  }
  ```

---

#### **5. Optional: Add `stateUpdatedAt` Column to `resumes`**

- **Purpose**: Track when the `calculatedState` was last updated for auditing and debugging.
- **Implementation**:

  ```prisma
  model Resume {
    id              String   @id @default(uuid())
    calculatedState String?
    stateUpdatedAt  DateTime? // New: Timestamp for the last state change
    ...
  }
  ```

---

### **Summary of Changes**

| **Table**          | **New Column**         | **Purpose**                                                                 |
|---------------------|------------------------|-----------------------------------------------------------------------------|
| `resumes`          | `calculatedState`      | Store the derived state of the resume (e.g., "expired," "multi_device").    |
| `resumes`          | `cloudAccessCount`     | Maintain count of cloud-based accesses.                                    |
| `resumes`          | `deviceAccessCount`    | Maintain count of device-based accesses.                                   |
| `resumes`          | `stateUpdatedAt`       | Track when the derived state was last updated.                             |
| `tracking_logs`    | `deviceType`           | Store the type of device accessing the resume (e.g., "mobile," "desktop"). |
| `tracking_logs`    | `isCloudService`       | Flag whether the access originated from a cloud service.                   |
| `application_tracking` | `status`           | Track application status (e.g., "screening," "hired").                     |

---

### **Rationale for Changes**

1. **`calculatedState`**: Efficiently store and query derived resume states without recalculating on each request.
2. **`cloudAccessCount` and `deviceAccessCount`**: Pre-computed values improve dashboard performance.
3. **`deviceType` and `isCloudService`**: Enhance tracking details for actionable insights (e.g., origin of accesses).
4. **`stateUpdatedAt`**: Useful for debugging or analytics to see when state transitions occur.

---

Proceed with applying these changes in Prisma, and should we write the corresponding migration scripts?
