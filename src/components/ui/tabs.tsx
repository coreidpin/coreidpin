"use client";

import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      className={cn("flex flex-col gap-3 md:gap-4", className)}
      {...props}
    />
  );
});

Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-full items-center justify-center",
        "bg-gradient-to-br from-slate-50 to-slate-100/80",
        "dark:from-slate-900 dark:to-slate-800/80",
        "backdrop-blur-sm",
        "border border-slate-200/60 dark:border-slate-700/60",
        "rounded-xl shadow-sm",
        "p-1.5 gap-1",
        "transition-all duration-300",
        "hover:shadow-md hover:border-slate-300/60 dark:hover:border-slate-600/60",
        className,
      )}
      {...props}
    />
  );
});

TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "inline-flex flex-1 items-center justify-center gap-2",
        "rounded-lg px-3 py-2.5 md:px-4 md:py-3",
        "text-sm font-semibold tracking-wide",
        "whitespace-nowrap select-none",
        "transition-all duration-300 ease-out",
        
        // Default state
        "text-slate-600 dark:text-slate-400",
        "hover:text-slate-900 dark:hover:text-slate-100",
        "hover:bg-white/50 dark:hover:bg-slate-800/50",
        
        // Active state - Enhanced with gradient and shadow
        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800",
        "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white",
        "data-[state=active]:shadow-lg data-[state=active]:shadow-slate-900/5",
        "dark:data-[state=active]:shadow-slate-900/20",
        "data-[state=active]:border data-[state=active]:border-slate-200/80",
        "dark:data-[state=active]:border-slate-700/80",
        
        // Subtle scale effect on active
        "data-[state=active]:scale-[1.02]",
        
        // Focus styles
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
        
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        
        // Icon sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        
        // Hover effect with transform
        "hover:translate-y-[-1px]",
        "data-[state=active]:hover:translate-y-0",
        
        className,
      )}
      {...props}
    />
  );
});

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        className
      )}
      {...props}
    />
  );
});

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
