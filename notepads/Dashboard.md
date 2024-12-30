# **Resume Tracking Dashboard Implementation**

## **Technical Requirements**

### **Core Stack**

- Next.js for all pages and routing
- TypeScript for all code
- Tailwind CSS for styling
- Shadcn UI for components
- Supabase for database and real-time updates
- Vercel for deployment and edge functions

### **Component Guidelines**

- Use Shadcn UI components via `npx shadcn@latest add [component]`
- Implement proper TypeScript types for all props and state
- Follow mobile-first responsive design
- Ensure accessibility compliance
- Maintain consistent error boundaries

## **1. Core Components**

### **Layout Structure**

```tsx
// src/components/layout/DashboardLayout.tsx
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ThemeProvider } from './ThemeProvider';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
```

### **Resume Management**

```tsx
// src/components/resumes/ResumeList.tsx
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../ui/data-table';
import { columns } from './columns';
import { useResumeSubscription } from '@/hooks/useResumeSubscription';

export function ResumeList() {
  const { data, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const res = await fetch('/api/resumes');
      if (!res.ok) throw new Error('Failed to fetch resumes');
      return res.json();
    },
  });

  useResumeSubscription();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">Resumes</h3>
        <UploadButton />
      </div>
      <DataTable
        columns={columns}
        data={data?.resumes || []}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## **2. Analytics Components**

### **Stats Overview**

```tsx
// src/components/analytics/StatsOverview.tsx
import { Card } from '../ui/card';
import { useStats } from '@/hooks/useStats';

export function StatsOverview() {
  const { data, isLoading } = useStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Views"
        value={data?.totalViews}
        change={data?.viewsChange}
      />
      <StatCard
        title="Unique Viewers"
        value={data?.uniqueViewers}
        change={data?.uniqueViewersChange}
      />
      <StatCard
        title="Avg. View Duration"
        value={data?.avgViewDuration}
        suffix="sec"
      />
      <StatCard
        title="Response Rate"
        value={data?.responseRate}
        suffix="%"
      />
    </div>
  );
}
```

### **Charts**

```tsx
// src/components/analytics/ViewsChart.tsx
import { LineChart } from '../ui/line-chart';
import { useViewsData } from '@/hooks/useViewsData';

export function ViewsChart() {
  const { data, isLoading } = useViewsData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Views Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data}
          categories={['views', 'uniqueViews']}
          index="date"
          colors={['blue', 'green']}
          valueFormatter={(value) => `${value} views`}
          loading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
```

## **3. Real-time Updates**

### **Supabase Subscription**

```tsx
// src/hooks/useResumeSubscription.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('resume_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resumes' },
        (payload) => {
          queryClient.invalidateQueries(['resumes']);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);
}
```

## **4. Error Handling**

### **Error Boundary**

```tsx
// src/components/error/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center">
            <h2>Something went wrong</h2>
            <button
              className="mt-4"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## **5. Performance Optimizations**

### **Query Configuration**

```tsx
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### **Virtualized Lists**

```tsx
// src/components/resumes/VirtualizedList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].title}
          </div>
        ))}
      </div>
    </div>
  );
}
```
