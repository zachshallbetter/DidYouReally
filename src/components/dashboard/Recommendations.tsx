import { Resume } from "@/types/resume";
import { Share2, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationsProps {
  resumes: Resume[];
  loading?: boolean;
  onResumeClick?: (resume: Resume, tab: 'details' | 'insights') => void;
}

function getRecommendations(resume: Resume) {
  const recommendations: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action: {
      label: string;
      onClick: () => void;
    };
  }> = [];

  // Multi-Platform Review
  if (resume.deviceAccessCount > 1) {
    recommendations.push({
      icon: <Share2 className="h-4 w-4" />,
      title: "Multi-Platform Review",
      description: "Your resume is being viewed across different platforms - ensure consistent formatting.",
      action: {
        label: "Check Format",
        onClick: () => console.log("Check format action")
      }
    });
  }

  // Improve Engagement
  if (resume.avgViewDuration < 60) {
    recommendations.push({
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Improve Engagement", 
      description: "Brief viewing sessions detected - consider reformatting to highlight key information.",
      action: {
        label: "Review Layout",
        onClick: () => console.log("Review layout action")
      }
    });
  }

  // Low View Count
  if (resume.viewCount < 10 && resume.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    recommendations.push({
      icon: <Users className="h-4 w-4" />,
      title: "Low Visibility",
      description: "Your resume has received few views in the past week. Consider optimizing for better reach.",
      action: {
        label: "Optimize",
        onClick: () => console.log("Optimize visibility action")
      }
    });
  }

  // Stale Resume
  const lastUpdate = new Date(resume.updatedAt).getTime();
  if (lastUpdate < Date.now() - 30 * 24 * 60 * 60 * 1000) {
    recommendations.push({
      icon: <Clock className="h-4 w-4" />,
      title: "Resume Update Needed",
      description: "Your resume hasn't been updated in over a month. Consider refreshing your information.",
      action: {
        label: "Update Now",
        onClick: () => console.log("Update resume action")
      }
    });
  }

  return recommendations;
}

export function Recommendations({ resumes = [], loading, onResumeClick }: RecommendationsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    );
  }

  const handleClick = (resume: Resume, action?: () => void) => {
    if (action) {
      action();
    } else if (onResumeClick) {
      onResumeClick(resume, 'insights');
    }
  };

  const allRecommendations = resumes.flatMap(resume => {
    const recommendations = getRecommendations(resume);
    return recommendations.map(rec => ({
      ...rec,
      resume
    }));
  });

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {allRecommendations.map((rec, index) => (
          <div 
            key={index} 
            className="flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-4 rounded-lg"
            onClick={() => handleClick(rec.resume)}
          >
            <div className="text-primary">{rec.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{rec.title}</p>
                <Badge variant="outline" className="text-xs">
                  {rec.resume.company.name}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(rec.resume, rec.action.onClick);
              }}
              className="shrink-0"
            >
              {rec.action.label}
            </Button>
          </div>
        ))}
        {allRecommendations.length === 0 && (
          <p className="text-sm text-muted-foreground">No recommendations available yet.</p>
        )}
      </div>
    </div>
  );
}
