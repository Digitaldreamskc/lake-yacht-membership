'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple placeholder for resizable component to avoid module system conflicts
const ResizableComponent = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <div {...props}>{children}</div>
);

export const ResizablePanel = ResizableComponent;
export const ResizablePanelGroup = ResizableComponent;
export const ResizableHandle = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <div
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-4 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:h-4',
      className
    )}
    {...props}
  >
    <GripVertical className="h-4 w-3" />
  </div>
);
