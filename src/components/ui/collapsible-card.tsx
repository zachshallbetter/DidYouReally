"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./card"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface CollapsibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  defaultOpen?: boolean
  trigger?: React.ReactNode
}

export function CollapsibleCard({
  title,
  description,
  defaultOpen = false,
  trigger,
  children,
  className,
  ...props
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Card className={cn("relative overflow-hidden", className)} {...props}>
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {trigger}
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
              <span className="sr-only">Toggle {title}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <div
        className={cn(
          "grid transition-all",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="pb-6">{children}</CardContent>
        </div>
      </div>
    </Card>
  )
} 