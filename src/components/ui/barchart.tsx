
"use client";
import TripleAreaChart from "../charts/TripleAreaChart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card"


export interface BarChartData {
  category: string;
  correct: number;
  incorrect: number;
  unanswered: number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  description?: string;
}



export function StackedBarChart({
  data,
  title = "TEST natijalar",
  description
}: BarChartProps) {
  return (
    <Card className="text-white border-white/10"> {/* bg-black/20 backdrop-blur-sm */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <TripleAreaChart

          data={data}
          xKey="category"
          totalKey="unanswered"
          successKey="correct"
          failedKey="incorrect"
          totalLabel="Javobsiz"
          successLabel="To'g'ri javob"
          failedLabel="Noto'g'ri javob"
        />
      </CardContent>
    </Card>
  )
}
