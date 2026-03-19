import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/usaspending/formatters";

interface StatCardProps {
  title: string;
  amount: number;
  delta?: number;
  subtitle?: string;
}

export function StatCard({ title, amount, delta, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(amount, true)}</div>
        <div className="flex items-center gap-2 mt-1">
          {delta !== undefined && (
            <Badge variant={delta >= 0 ? "default" : "destructive"} className="text-xs">
              {delta >= 0 ? "+" : ""}{delta.toFixed(1)}% YoY
            </Badge>
          )}
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}
