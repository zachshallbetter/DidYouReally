import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Copy, 
  Building2, 
  MapPin, 
  Link2, 
  ChartLine, 
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Eye
} from "lucide-react";
import { ResumeInsights } from "./ResumeInsights";
import { EventList } from "./EventList";
import { TrackingLogs } from "./TrackingLogs";
import { Resume } from "@/types/resume";
import { formatDistanceToNow } from "date-fns";
import { ResumeAnalytics } from "./ResumeAnalytics";

interface ResumeDetailsSheetProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyUrl: (url: string) => Promise<void>;
  defaultTab?: 'details' | 'insights';
}

export function ResumeDetailsSheet({ 
  resume, 
  open, 
  onOpenChange,
  onCopyUrl,
  defaultTab = 'details'
}: ResumeDetailsSheetProps) {
  if (!resume) return null;

  const recentLogs = resume.trackingLogs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const recentEvents = resume.events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] max-w-[1200px] sm:max-w-[800px]">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle>{resume.job_title}</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onCopyUrl(resume.job_listing_url || '')}
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{resume.company.name}</span>
              <span>•</span>
              <span className="text-muted-foreground">{resume.company.industry}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{resume.company.location}</span>
            </div>
            {resume.job_listing_url && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="h-4 w-4" />
                <a 
                  href={resume.job_listing_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  View Job Listing
                </a>
              </div>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue={defaultTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <ChartLine className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[calc(100vh-250px)] mt-4">
            <TabsContent value="details" className="m-0">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Recent Activity</h4>
                  <TrackingLogs logs={recentLogs} />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Events</h4>
                  <EventList events={recentEvents} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="m-0">
              <ResumeAnalytics resumeId={resume.id} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}