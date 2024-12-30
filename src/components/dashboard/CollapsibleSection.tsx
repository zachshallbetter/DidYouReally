import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  showAdd?: boolean;
  onAdd?: () => void;
}

export function CollapsibleSection({
  title,
  description,
  children,
  isExpanded,
  onToggle,
  showAdd,
  onAdd
}: CollapsibleSectionProps) {
  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {showAdd && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="h-8 w-8"
                title="Add new"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  );
} 