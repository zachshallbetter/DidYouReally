import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Disable caching for this page

async function getResumes() {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getLogs() {
  const { data, error } = await supabase
    .from('tracking_logs')
    .select(`
      *,
      resume:resumes (
        job_title,
        company
      )
    `)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}

export default async function Dashboard() {
  const [resumes, logs] = await Promise.all([getResumes(), getLogs()]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Resume Tracking Dashboard</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Resumes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resumes.map((resume) => (
                <tr key={resume.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{resume.job_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{resume.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{resume.tracking_url}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(resume.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Tracking Logs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.resume?.job_title} at {log.resume?.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.ip_address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user_agent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 