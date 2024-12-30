# Edge Functions

To implement **pixel tracking** and **link tracking** for your resumes, we'll use a **combination of Supabase** for backend storage and processing, and **dynamic generation** of URLs and tracking beacons. Here's a detailed plan:

---

### **1. Pixel Tracking**

#### **Objective**

- Insert a **tracking pixel** (1x1 transparent image) into the resumes to monitor when they're opened.

#### **Workflow**

1. **Generate Tracking URL**: Create a unique URL for each resume that corresponds to the tracking pixel.
2. **Insert Pixel into the PDF**: Embed the tracking URL as an `<img>` tag or metadata in the resume.
3. **Log Access on Pixel Request**: When the pixel is requested, log the event in the `tracking_logs` table.

#### **Implementation**

##### **a. API Endpoint for the Tracking Pixel**

Create a Supabase **Edge Function** to serve the pixel and log access.

**File: `functions/pixel.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { unique_id } = req.query;

  try {
    // Log the tracking event
    await supabase.from('tracking_logs').insert({
      resumeId: unique_id,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      accessedAt: new Date(),
    });

    // Serve a transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgUBxOYfu6IAAAAASUVORK5CYII=',
      'base64'
    );
    res.setHeader('Content-Type', 'image/png');
    res.end(pixel);
  } catch (error) {
    console.error('Error logging tracking event:', error);
    res.status(500).json({ error: 'Failed to log tracking event' });
  }
}
```

---

##### **b. Generating the Pixel Tracking URL**

Each resume gets a unique pixel tracking URL:

```javascript
const trackingUrl = `https://your-vercel-app.vercel.app/api/pixel?unique_id=${resumeId}`;
```

---

##### **c. Embedding the Pixel in the PDF**

Insert the tracking pixel into the PDF as metadata or a visible element using Python.

**Python Example with `fpdf`**:

```python
from fpdf import FPDF

def embed_pixel_tracking(pdf_path, output_path, tracking_url):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Add pixel as an image (tiny, invisible)
    pdf.image(tracking_url, x=1, y=1, w=1, h=1)
    
    pdf.output(output_path)

# Example usage
embed_pixel_tracking("resume.pdf", "tracked_resume.pdf", "https://your-vercel-app.vercel.app/api/pixel?unique_id=12345")
```

---

### **2. Link Tracking**

#### **Objective**

- Track clicks on links embedded in the resume.

#### **Workflow**

1. **Generate Unique Links**: Use a Supabase Edge Function to redirect from a tracking link to the actual destination.
2. **Log Click Events**: Log the link click in the `tracking_logs` table with the resume ID and timestamp.
3. **Redirect to Target URL**: After logging, redirect the user to the intended URL.

---

#### **Implementation**

##### **a. API Endpoint for Link Tracking**

**File: `functions/link.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { unique_id, target_url } = req.query;

  try {
    // Log the click event
    await supabase.from('tracking_logs').insert({
      resumeId: unique_id,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      accessedAt: new Date(),
      action: 'link_click',
      metadata: { target_url },
    });

    // Redirect to the target URL
    res.writeHead(302, { Location: decodeURIComponent(target_url) });
    res.end();
  } catch (error) {
    console.error('Error logging link click:', error);
    res.status(500).json({ error: 'Failed to log link click' });
  }
}
```

---

##### **b. Generating the Tracking Link**

For each link in the resume, generate a tracking URL:

```javascript
const targetUrl = encodeURIComponent('https://example.com');
const trackingLink = `https://your-vercel-app.vercel.app/api/link?unique_id=${resumeId}&target_url=${targetUrl}`;
```

---

##### **c. Embedding the Link in the PDF**

Replace all links in the resume with the tracking links.

**Python Example**:

```python
from PyPDF2 import PdfReader, PdfWriter

def replace_links_with_tracking(input_pdf, output_pdf, tracking_links):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    for page in reader.pages:
        text = page.extract_text()
        for original_link, tracking_link in tracking_links.items():
            text = text.replace(original_link, tracking_link)
        page.merge_text(text)  # Update the page with the new links
        writer.add_page(page)

    with open(output_pdf, "wb") as f:
        writer.write(f)

# Example usage
tracking_links = {
    "https://example.com": "https://your-vercel-app.vercel.app/api/link?unique_id=12345&target_url=https%3A%2F%2Fexample.com"
}
replace_links_with_tracking("resume.pdf", "tracked_resume.pdf", tracking_links)
```

---

### **3. Logging Details**

In the `tracking_logs` table, we’ll include additional columns to distinguish pixel requests from link clicks:

```prisma
model TrackingLog {
  id           String   @id @default(uuid())
  resumeId     String   @relation(fields: [resumeId], references: [id])
  ip_address   String
  user_agent   String
  accessedAt   DateTime @default(now())
  action       String   // e.g., "pixel_request" or "link_click"
  metadata     Json?    // Additional data, e.g., target URL for link clicks
}
```

---

### **4. Analyzing Data**

#### **Pixel Tracking Insights**

- **Open Count**: Count unique pixel requests per resume.
- **Device/Location Insights**: Analyze `user_agent` and `ip_address` fields for trends.

#### **Link Tracking Insights**

- **Click Count**: Count unique link clicks per target URL.
- **Engagement Metrics**: Identify which links are clicked most frequently.

#### **SQL Query Examples**

1. Count resumes opened:

   ```sql
   select resumeId, count(*) as open_count
   from tracking_logs
   where action = 'pixel_request'
   group by resumeId;
   ```

2. Count link clicks:

   ```sql
   select metadata->>'target_url' as target_url, count(*) as click_count
   from tracking_logs
   where action = 'link_click'
   group by metadata->>'target_url';
   ```

---

### **5. Dashboard Integration**

- Show pixel-based open rates and link click-through rates in the dashboard.
- Allow filtering by:
  - Resumes with no opens.
  - Links with high click rates.

Here's how to implement **pixel and link tracking**, integrate it into your **dashboard**, and automate the setup for seamless use:

---

### **1. Pixel Tracking Setup**

#### **Integration into PDF Generation**

The tracking pixel (a 1x1 image) needs to be embedded dynamically during the PDF generation or modification process.

**Python Code for Embedding a Pixel**

```python
from fpdf import FPDF

def embed_pixel(pdf_path, output_path, tracking_url):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Add pixel tracking URL as an invisible image
    # Note: Adjust x, y, width, height as needed for visibility/invisibility
    pdf.image(tracking_url, x=1, y=1, w=1, h=1)

    # Example resume content
    pdf.cell(200, 10, txt="Resume Content Here", ln=True, align="C")

    pdf.output(output_path)

# Example usage
tracking_url = "https://your-vercel-app.vercel.app/api/pixel?unique_id=resume123"
embed_pixel("resume.pdf", "tracked_resume.pdf", tracking_url)
```

---

### **2. Link Tracking Setup**

#### **Replace Links in PDF**

To embed link tracking, replace all URLs in the PDF with generated tracking links.

**Python Code for Replacing Links**

```python
from PyPDF2 import PdfReader, PdfWriter

def replace_links_with_tracking(input_pdf, output_pdf, link_mapping):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    for page in reader.pages:
        text = page.extract_text()
        for original_url, tracking_url in link_mapping.items():
            text = text.replace(original_url, tracking_url)
        page.merge_text(text)  # Update the page with the new links
        writer.add_page(page)

    with open(output_pdf, "wb") as f:
        writer.write(f)

# Example usage
link_mapping = {
    "https://example.com": "https://your-vercel-app.vercel.app/api/link?unique_id=resume123&target_url=https%3A%2F%2Fexample.com"
}
replace_links_with_tracking("resume.pdf", "tracked_resume.pdf", link_mapping)
```

---

### **3. Supabase API Integration**

#### **Pixel API Endpoint**

Logs access when the tracking pixel is requested.
**Supabase Edge Function: `/api/pixel.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { unique_id } = req.query;

  try {
    await supabase.from('tracking_logs').insert({
      resumeId: unique_id,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      accessedAt: new Date(),
      action: 'pixel_request',
    });

    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgUBxOYfu6IAAAAASUVORK5CYII=',
      'base64'
    );
    res.setHeader('Content-Type', 'image/png');
    res.end(pixel);
  } catch (error) {
    console.error('Error logging pixel request:', error);
    res.status(500).json({ error: 'Pixel tracking failed' });
  }
}
```

#### **Link API Endpoint**

Logs clicks when a tracking link is accessed and redirects to the target URL.
**Supabase Edge Function: `/api/link.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { unique_id, target_url } = req.query;

  try {
    await supabase.from('tracking_logs').insert({
      resumeId: unique_id,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      accessedAt: new Date(),
      action: 'link_click',
      metadata: { target_url },
    });

    res.writeHead(302, { Location: decodeURIComponent(target_url) });
    res.end();
  } catch (error) {
    console.error('Error logging link click:', error);
    res.status(500).json({ error: 'Link tracking failed' });
  }
}
```

---

### **4. Logging Enhancements**

Update the `tracking_logs` table schema to include:

- **Action**: Type of event (`pixel_request`, `link_click`).
- **Metadata**: JSON for storing additional information (e.g., `target_url`).

**Prisma Schema Update**:

```prisma
model TrackingLog {
  id           String   @id @default(uuid())
  resumeId     String   @relation(fields: [resumeId], references: [id])
  ip_address   String
  user_agent   String
  accessedAt   DateTime @default(now())
  action       String   // e.g., "pixel_request", "link_click"
  metadata     Json?    // Optional: Store target URL for link clicks
}
```

---

### **5. Dashboard Integration**

#### **Pixel Tracking Insights**

- Show total number of opens per resume.
- Display unique device types and IPs.

**SQL Query for Pixel Tracking Data**:

```sql
select resumeId, count(*) as total_opens, count(distinct ip_address) as unique_opens
from tracking_logs
where action = 'pixel_request'
group by resumeId;
```

#### **Link Tracking Insights**

- Show total clicks per link.
- Highlight the most clicked links.

**SQL Query for Link Tracking Data**:

```sql
select metadata->>'target_url' as target_url, count(*) as total_clicks
from tracking_logs
where action = 'link_click'
group by metadata->>'target_url';
```

#### **Dashboard UI Example**

Add a section for tracking metrics in the **Resume Details View**:

```tsx
import { Card, Table } from "shadcn-ui";

export function ResumeMetrics({ pixelData, linkData }) {
  return (
    <div className="metrics-section">
      <Card>
        <h3>Pixel Tracking</h3>
        <Table>
          <thead>
            <tr>
              <th>Resume ID</th>
              <th>Total Opens</th>
              <th>Unique Opens</th>
            </tr>
          </thead>
          <tbody>
            {pixelData.map((row) => (
              <tr key={row.resumeId}>
                <td>{row.resumeId}</td>
                <td>{row.total_opens}</td>
                <td>{row.unique_opens}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <h3>Link Tracking</h3>
        <Table>
          <thead>
            <tr>
              <th>Target URL</th>
              <th>Total Clicks</th>
            </tr>
          </thead>
          <tbody>
            {linkData.map((row) => (
              <tr key={row.target_url}>
                <td>{row.target_url}</td>
                <td>{row.total_clicks}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
```

---

### **6. Automation Script**

A script to automate embedding tracking pixels and links into resumes:

```python
def automate_tracking(resume_id, original_pdf, output_pdf, links):
    pixel_url = f"https://your-vercel-app.vercel.app/api/pixel?unique_id={resume_id}"
    tracking_links = {
        link: f"https://your-vercel-app.vercel.app/api/link?unique_id={resume_id}&target_url={link}"
        for link in links
    }

    embed_pixel(original_pdf, output_pdf, pixel_url)
    replace_links_with_tracking(original_pdf, output_pdf, tracking_links)
```
