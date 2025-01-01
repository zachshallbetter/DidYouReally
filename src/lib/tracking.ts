/**
 * Generates tracking URLs for resumes and links
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function generatePixelUrl(resumeId: string): string {
  return `${BASE_URL}/api/tracking/pixel?id=${resumeId}`;
}

export function generateTrackingLink(resumeId: string, targetUrl: string): string {
  const encodedUrl = encodeURIComponent(targetUrl);
  return `${BASE_URL}/api/tracking/link?id=${resumeId}&url=${encodedUrl}`;
}

export function embedTrackingPixel(resumeId: string): string {
  const pixelUrl = generatePixelUrl(resumeId);
  return `<img src="${pixelUrl}" alt="" width="1" height="1" style="position:absolute;opacity:0" />`;
}

export function replaceLinksWithTracking(html: string, resumeId: string): string {
  // Replace all links with tracking links
  return html.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/g,
    (match, url, rest) => {
      const trackingUrl = generateTrackingLink(resumeId, url);
      return `<a href="${trackingUrl}"${rest}>`;
    }
  );
}

export function processResumeContent(content: string, resumeId: string): string {
  let processed = content;
  
  // Replace links with tracking links
  processed = replaceLinksWithTracking(processed, resumeId);
  
  // Add tracking pixel at the end
  processed += embedTrackingPixel(resumeId);
  
  return processed;
}