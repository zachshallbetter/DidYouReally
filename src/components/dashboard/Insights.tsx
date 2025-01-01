import { Resume } from "@/types/resume";
import { Users, Clock, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface InsightsProps {
  resumes: Resume[];
  loading?: boolean;
  onResumeClick?: (resume: Resume, tab: 'details' | 'insights') => void;
}

function getInsightCard(resume: Resume) {
  const viewsPerDay = resume.viewCount / Math.max(1, getDaysSinceCreation(resume.createdAt));
  const engagementScore = calculateEngagementScore(resume);

  return {
    title: resume.job_title,
    company: resume.company,
    state: resume.state,
    metrics: {
      viewsPerDay: viewsPerDay.toFixed(1),
      locations: resume.uniqueLocations,
      score: engagementScore
    }
  };
}

function getDaysSinceCreation(createdAt: Date) {
  return Math.ceil((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24));
}

function calculateEngagementScore(resume: Resume) {
  let score = 0;
  score += resume.viewCount * 2;
  score += resume.uniqueLocations * 3;
  score += resume.cloudAccessCount * 1.5;
  score += resume.deviceAccessCount * 1.5;
  return Math.round(score);
}

function getStateStyles(state: string): string {
  const styles = {
    not_opened: 'bg-amber-100 text-amber-800',
    recently_viewed: 'bg-blue-100 text-blue-800', 
    frequently_accessed: 'bg-emerald-100 text-emerald-800',
    multi_device_viewed: 'bg-purple-100 text-purple-800',
    under_consideration: 'bg-indigo-100 text-indigo-800',
    expired: 'bg-gray-100 text-gray-800',
    cloud_accessed: 'bg-sky-100 text-sky-800'
  };
  return styles[state as keyof typeof styles] || 'bg-gray-100 text-gray-800';
}

function formatState(state: string): string {
  return state.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function Insights({ resumes = [], loading, onResumeClick }: InsightsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Skeleton className="h-[140px] w-full" />
        <Skeleton className="h-[140px] w-full" />
      </div>
    );
  }

  const handleClick = (resume: Resume) => {
    if (onResumeClick) {
      onResumeClick(resume, 'insights');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {resumes.map((resume) => {
          const insight = getInsightCard(resume);
          return (
            <Card 
              key={resume.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleClick(resume)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate max-w-[200px]">{insight.title}</span>
                    <Badge variant="outline" className={`text-xs ${getStateStyles(resume.state)}`}>
                      {formatState(resume.state)}
                    </Badge>
                  </div>
                  <Badge variant="secondary">
                    Score: {insight.metrics.score}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{insight.company.name}</span>
                  <span>•</span>
                  <span>{insight.company.industry}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{insight.metrics.viewsPerDay} views/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-3 w-3" />
                    <span>{insight.metrics.locations} locations</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 