import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, AreaChart, LineChart } from "recharts";
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Area } from "recharts";

interface RecommendationsProps {
  resumes: any[];
  logs: any[];
}

const EVENT_COLORS = {
  view: "#22c55e",    // Green
  send: "#3b82f6",    // Blue
  open: "#f59e0b",    // Amber
  click: "#ec4899",   // Pink
  download: "#8b5cf6"  // Purple
} as const;

const chartConfig = {
  primary: {
    color: "hsl(var(--primary))"
  },
  secondary: {
    color: "hsl(var(--secondary))"
  },
  muted: {
    color: "hsl(var(--muted))"
  }
};

const getChartData = (logs: any[]) => {
  const eventsByDate = new Map();
  const deviceStats = new Map();
  const locationStats = new Map();

  logs.forEach(log => {
    if (!log.timestamp || !log.event_type) return;

    // Process events by date
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!eventsByDate.has(date)) {
      eventsByDate.set(date, {
        date,
        view: 0,
        send: 0,
        open: 0,
        click: 0,
        download: 0
      });
    }
    const dateStats = eventsByDate.get(date);
    dateStats[log.event_type]++;

    // Process device stats
    const device = log.device_type || 'unknown';
    deviceStats.set(device, (deviceStats.get(device) || 0) + 1);

    // Process location stats
    if (log.city && log.country) {
      const location = `${log.city}, ${log.country}`;
      locationStats.set(location, (locationStats.get(location) || 0) + 1);
    }
  });

  // Sort dates chronologically
  const timelineData = Array.from(eventsByDate.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get top 5 locations
  const locationData = Array.from(locationStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  // Get device distribution
  const deviceData = Array.from(deviceStats.entries())
    .map(([device, count]) => ({ device, count }));

  return {
    timelineData,
    locationData,
    deviceData
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="font-semibold">{label}</div>
      {payload.map((item: any) => (
        <div key={item.name} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: EVENT_COLORS[item.name as keyof typeof EVENT_COLORS] }} 
          />
          <span className="capitalize">{item.name}:</span>
          <span className="ml-2 font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export function Recommendations({ resumes, logs }: RecommendationsProps) {
  const { timelineData, locationData, deviceData } = getChartData(logs);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Engagement Over Time */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
          <CardDescription>View trends in resume interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={timelineData} height={300}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries(EVENT_COLORS).map(([event, color]) => (
                <Line
                  key={event}
                  type="monotone"
                  dataKey={event}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Device Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
          <CardDescription>Breakdown of viewing devices</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={deviceData} height={300}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Viewing Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Viewing Locations</CardTitle>
          <CardDescription>Most active regions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={locationData} height={300} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="location" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
} 