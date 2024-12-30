export function generateTrackingBeacon(trackingUrl: string): string {
  // Use NEXT_PUBLIC_APP_URL from env, matching supabase client config
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Generate tracking pixel that will log to tracking_logs table
  // tracking_url field in resumes table is used as unique_id
  // Pixel will trigger GET /api/track which logs view to tracking_logs
  return `<img src="${baseUrl}/api/track?unique_id=${trackingUrl}" 
    alt="" 
    width="1" 
    height="1" 
    style="display:none;position:absolute" 
    role="presentation"
    referrerpolicy="no-referrer"
    loading="eager"
    decoding="async"
  />`;
}