import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Activity, Clock, 
  Target, Award, AlertTriangle, CheckCircle,
  DollarSign, Users, Zap, BarChart3
} from 'lucide-react';

interface KPIMetric {
  label: string;
  value: string | number;
  change: number;
  target?: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const kpiMetrics: KPIMetric[] = [
  {
    label: 'Overall Equipment Effectiveness (OEE)',
    value: 87.5,
    change: 2.3,
    target: 90,
    unit: '%',
    trend: 'up',
    status: 'good',
    icon: <Target className="h-5 w-5" />
  },
  {
    label: 'Production Efficiency',
    value: 94.2,
    change: -1.2,
    target: 95,
    unit: '%',
    trend: 'down',
    status: 'warning',
    icon: <Activity className="h-5 w-5" />
  },
  {
    label: 'Quality Score',
    value: 98.7,
    change: 0.8,
    target: 99,
    unit: '%',
    trend: 'up',
    status: 'good',
    icon: <Award className="h-5 w-5" />
  },
  {
    label: 'Average Cycle Time',
    value: 4.2,
    change: -0.3,
    target: 4.0,
    unit: 'hrs',
    trend: 'down',
    status: 'good',
    icon: <Clock className="h-5 w-5" />
  },
  {
    label: 'Cost per Unit',
    value: 45.67,
    change: 2.1,
    target: 42.00,
    unit: '$',
    trend: 'up',
    status: 'warning',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    label: 'Labor Utilization',
    value: 78.3,
    change: 1.7,
    target: 80,
    unit: '%',
    trend: 'up',
    status: 'good',
    icon: <Users className="h-5 w-5" />
  },
  {
    label: 'Energy Efficiency',
    value: 82.1,
    change: -0.5,
    target: 85,
    unit: '%',
    trend: 'down',
    status: 'warning',
    icon: <Zap className="h-5 w-5" />
  },
  {
    label: 'Throughput',
    value: 156,
    change: 8.2,
    target: 150,
    unit: 'units/day',
    trend: 'up',
    status: 'good',
    icon: <BarChart3 className="h-5 w-5" />
  }
];

export function AdvancedKPIs() {
  const getStatusColor = (status: KPIMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: KPIMetric['status']) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: KPIMetric['trend'], change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getProgressValue = (value: number, target?: number) => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  {metric.icon}
                </div>
                <Badge className={`px-2 py-1 text-xs ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </Badge>
              </div>
              {getTrendIcon(metric.trend, metric.change)}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold">
                    {typeof metric.value === 'number' 
                      ? `${metric.unit === '$' ? '$' : ''}${metric.value}${metric.unit !== '$' ? ` ${metric.unit || ''}` : ''}`
                      : metric.value
                    }
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {metric.label}
                  </p>
                </div>
                
                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Target: {metric.unit === '$' ? '$' : ''}{metric.target}{metric.unit !== '$' ? ` ${metric.unit || ''}` : ''}</span>
                      <span>{getProgressValue(typeof metric.value === 'number' ? metric.value : 0, metric.target).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={getProgressValue(typeof metric.value === 'number' ? metric.value : 0, metric.target)} 
                      className="h-2"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(metric.trend, metric.change)}
                  <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}