"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center gap-6 border-b border-border bg-transparent p-0",
        className
      )}
      {...props}
    />
  )
}


function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `
        relative inline-flex items-center gap-1
        pb-3 text-sm font-medium
        text-muted-foreground
        transition-colors

        hover:text-foreground

        data-[state=active]:text-primary
        data-[state=active]:font-semibold

        after:absolute after:bottom-[-1px] after:left-0 after:right-0
        after:h-[2px] after:bg-primary
        after:scale-x-0 after:transition-transform
        data-[state=active]:after:scale-x-100
        `,
        className
      )}
      {...props}
    />
  )
}


function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("pt-4 outline-none", className)}
      {...props}
    />
  )
}


export { Tabs, TabsList, TabsTrigger, TabsContent }
