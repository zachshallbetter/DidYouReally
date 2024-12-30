import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, parseISO } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { Users, Eye, MapPin, Clock } from "lucide-react";

type Resume = NonNullable<Awaited<ReturnType<PrismaClient['resume']['findFirst']>>>;

interface ChartData {
  date: string;
  [key: string]: string | number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface LocationData {
  location: string;
  count: number;
}

interface TrackingLog {
  createdAt: Date;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  location: string | null;
}

interface ResumeEvent {
  type: 'view' | 'send' | 'open' | 'click' | 'download';
  createdAt: Date;
}

interface RecommendationsProps {
  resumes: Resume[];
  logs: TrackingLog[];
  events: ResumeEvent[];
}

function getChartData(events: ResumeEvent[]): ChartData[] {
  const groupedData = events.reduce((acc: { [key: string]: ChartData }, event) => {
    const date = format(event.createdAt, 'MM/dd/yyyy');
    if (!acc[date]) {
      acc[date] = {
        date,
        view: 0,
        send: 0,
        open: 0,
        click: 0,
        download: 0
      };
    }
    acc[date][event.type] = (acc[date][event.type] as number || 0) + 1;
    return acc;
  }, {});

  return Object.values(groupedData).sort((a, b) => {
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });
}

function getDeviceData(logs: TrackingLog[]): DeviceData[] {
  const devices = logs.reduce((acc: { [key: string]: number }, log) => {
    const device = log.deviceType.toLowerCase();
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(devices).map(([device, count]) => ({
    device,
    count
  }));
}

function getLocationData(logs: TrackingLog[]): LocationData[] {
  const locations = logs.reduce((acc: { [key: string]: number }, log) => {
    const location = log.location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(locations)
    .map(([location, count]) => ({
      location,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getLatestActivity(events: ResumeEvent[]): string {
  if (events.length === 0) return 'N/A';
  
  const latestEvent = events.reduce((latest, current) => {
    return current.createdAt > latest.createdAt ? current : latest;
  });

  return format(latestEvent.createdAt, 'MM/dd/yyyy');
}

export function Recommendations({ resumes, logs, events }: RecommendationsProps) {
  const chartData = getChartData(events);
  const deviceData = getDeviceData(logs);
  const locationData = getLocationData(logs);
  const uniqueLocations = new Set(logs.map(log => log.location)).size;
  const totalViews = events.filter(event => event.type === 'view').length;
  const latestActivity = getLatestActivity(events);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resumes</p>
                <h3 className="text-2xl font-bold">{resumes.length}</h3>
                <p className="text-xs text-muted-foreground">Active resumes being tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <h3 className="text-2xl font-bold">{totalViews}</h3>
                <p className="text-xs text-muted-foreground">Resume views tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Locations</p>
                <h3 className="text-2xl font-bold">{uniqueLocations}</h3>
                <p className="text-xs text-muted-foreground">Different viewing locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latest Activity</p>
                <h3 className="text-2xl font-bold">{latestActivity}</h3>
                <p className="text-xs text-muted-foreground">Most recent view</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>View trends in resume interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="view" stroke="#22c55e" name="View" />
                  <Line type="monotone" dataKey="send" stroke="#f97316" name="Send" />
                  <Line type="monotone" dataKey="open" stroke="#eab308" name="Open" />
                  <Line type="monotone" dataKey="click" stroke="#06b6d4" name="Click" />
                  <Line type="monotone" dataKey="download" stroke="#a855f7" name="Download" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Breakdown of viewing devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="device" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Viewing Locations</CardTitle>
            <CardDescription>Most active regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}