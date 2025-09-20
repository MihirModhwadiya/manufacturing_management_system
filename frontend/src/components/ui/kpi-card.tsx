import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPI } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardProps {
  kpi: KPI;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-error" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendText = () => {
    if (!kpi.change) return null;
    
    const sign = kpi.change > 0 ? '+' : '';
    const color = kpi.trend === 'up' ? 'text-success' : 
                  kpi.trend === 'down' ? 'text-error' : 'text-muted-foreground';
    
    return (
      <span className={cn("text-sm font-medium", color)}>
        {sign}{kpi.change}%
      </span>
    );
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.title}
        </CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatValue(kpi.value, kpi.format)}
        </div>
        {getTrendText() && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {getTrendText()} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}