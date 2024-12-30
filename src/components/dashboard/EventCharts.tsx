import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode, ReactElement } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp, AlertTriangle, Lightbulb, BarChart as BarChartIcon } from "lucide-react";

interface ChartTab {
  value: string;
  label: string;
  content: ReactElement;
}

interface ChartSectionProps {
  title: string;
  description: string;
  children?: ReactElement;
  tabs?: ChartTab[];
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

export function ChartSection({ 
  title, 
  description, 
  children,
  tabs,
  defaultTab,
  onTabChange,
  className
}: ChartSectionProps) {
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
                label: tab.label
              }
            }}
          >
            {tab.content}
          </ChartContainer>
        </TabsContent>
      ))}
    </Tabs>
  ) : children ? (
    <ChartContainer
      config={{}}
    >
      {children}
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
