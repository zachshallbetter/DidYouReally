"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Settings,
  BarChart
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Resumes",
      href: "/resumes",
      icon: FileText
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <nav className="flex flex-col space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.href}
            variant={pathname === link.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === link.href && "bg-muted"
            )}
            asChild
          >
            <Link href={link.href}>
              <Icon className="mr-2 h-4 w-4" />
              {link.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
} 