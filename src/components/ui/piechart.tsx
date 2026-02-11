"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Sector, Cell, Tooltip } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"

interface PieChartDataItem {
  name: string
  value: number
  color?: string
}

interface PieChartProps {
  title?: string
  description?: string
  data: PieChartDataItem[]
  activeIndex?: number
  innerRadius?: number
  strokeWidth?: number
  footerText?: string
  footerSubtext?: string
}

export function PieChartDonut({
  title = "Pie Chart",
  description,
  data,
  activeIndex = 0,
  innerRadius = 60,
  strokeWidth = 5,
  footerText,
  footerSubtext,
}: PieChartProps) {
  return (
    <Card className="flex flex-col bg-background text-foreground text-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 pb-0 flex justify-center">
        <PieChart width={250} height={250}>
          <Tooltip />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            strokeWidth={strokeWidth}
            activeIndex={activeIndex}
            activeShape={({ outerRadius = 0, ...props }) => (
              <Sector {...props} outerRadius={outerRadius + 10} />
            )}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
            ))}
          </Pie>
        </PieChart>
      </CardContent>

      {(footerText || footerSubtext) && (
        <CardFooter className="flex-col gap-2 text-sm">
          {footerText && (
            <div className="flex items-center gap-2 leading-none font-medium">
              {footerText}
              <TrendingUp className="h-4 w-4" />
            </div>
          )}
          {footerSubtext && (
            <div className="text-muted-foreground leading-none">
              {footerSubtext}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
