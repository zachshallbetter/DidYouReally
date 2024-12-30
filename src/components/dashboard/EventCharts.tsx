import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { ReactNode, ReactElement } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp, AlertTriangle, Lightbulb, BarChart as BarChartIcon, Monitor, Smartphone, Tablet, Cloud } from "lucide-react";

interface ChartTab {
  value: string;
  label: string;
  content: ReactElement<{ data?: ChartData }>;
}

interface ChartSectionProps {
  title: string;
  description: string;
  children?: ReactElement<{ data?: ChartData }>;
  tabs?: ChartTab[];
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

interface ChartData {
  events: Array<{
    type: string;
    createdAt: Date;
    metadata: any;
  }>;
  logs: Array<{
    deviceType: string;
    isCloudService: boolean;
    location: string;
    createdAt: Date;
    geoLocation?: any;
  }>;
}

export function ChartSection({ 
  title, 
  description, 
  children,
  tabs,
  defaultTab,
  onTabChange,
  className,
  data
}: ChartSectionProps & { data?: ChartData }) {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-orange-500" />;
      default:
        return <Cloud className="h-4 w-4 text-purple-500" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'insight':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'analytics':
        return <BarChartIcon className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const content = tabs ? (
    <Tabs defaultValue={defaultTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start">
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="min-w-[100px]"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent 
          key={tab.value} 
          value={tab.value}
          className="mt-4"
        >
          <ChartContainer
            config={{
              [tab.value]: {
                label: tab.label,
                color: '#10b981' // Default color for charts
              }
            }}
          >
            {React.cloneElement(tab.content, { data })}
          </ChartContainer>
        </TabsContent>
      ))}
    </Tabs>
  ) : children ? (
    <ChartContainer
      config={{
        default: {
          label: title,
          color: '#10b981'
        }
      }}
    >
      {React.cloneElement(children, { data })}
    </ChartContainer>
  ) : null;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
