"use client"

import { useState } from "react";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Mobile Sidebar */}
        {sidebar && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-[240px] sm:w-[240px] p-0">
              <div className="h-full py-6 pl-8 pr-6">
                {sidebar}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <div className="h-full py-6 pl-8 pr-6 lg:py-8">
              {sidebar}
            </div>
          </aside>
        )}

        <main className="flex w-full flex-col overflow-hidden">
          <div className="container flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 