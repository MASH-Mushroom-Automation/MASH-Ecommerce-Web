"use client"

import * as React from "react"
import { ChartTooltip as BaseChartTooltip, ChartTooltipContent as BaseChartTooltipContent } from "@/components/ui/chart"

import type { Formatter } from "recharts/types/component/DefaultTooltipContent"

interface ChartTooltipProps {
  formatter?: Formatter<any, any>
  labelFormatter?: (label: string) => string
  hideLabel?: boolean
  cursor?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  formatter,
  labelFormatter,
  hideLabel,
}: {
  active?: boolean
  payload?: any[]
  formatter?: ChartTooltipProps["formatter"]
  labelFormatter?: ChartTooltipProps["labelFormatter"]
  hideLabel?: boolean
}) {
  if (!active || !payload?.length) return null

  return (
    <BaseChartTooltipContent
      active={active}
      payload={payload}
      formatter={formatter}
      labelFormatter={labelFormatter}
      hideLabel={hideLabel}
    />
  )
}

export function ChartTooltip({
  formatter,
  labelFormatter,
  hideLabel = false,
  cursor = false,
}: ChartTooltipProps) {
  return (
    <BaseChartTooltip
      content={(props) => (
        <ChartTooltipContent
          {...props}
          formatter={formatter}
          labelFormatter={labelFormatter}
          hideLabel={hideLabel}
        />
      )}
      cursor={cursor}
    />
  )
}
