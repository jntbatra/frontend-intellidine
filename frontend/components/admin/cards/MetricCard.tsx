import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    percentage: number;
    direction: "UP" | "DOWN";
  };
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  subtext,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          </div>
          {icon && <div className="text-3xl">{icon}</div>}
        </div>

        {trend && (
          <div className="flex items-center gap-1">
            {trend.direction === "UP" ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend.direction === "UP" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.direction === "UP" ? "+" : "-"}
              {Math.abs(trend.percentage)}%
            </span>
          </div>
        )}

        {subtext && (
          <p className="text-xs text-slate-500 mt-2">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
