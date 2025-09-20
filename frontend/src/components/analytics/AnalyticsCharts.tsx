import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Clock, Target } from 'lucide-react';

// Mock data for charts
const productionTrendData = [
  { month: 'Jan', production: 120, efficiency: 85, defects: 5 },
  { month: 'Feb', production: 135, efficiency: 88, defects: 3 },
  { month: 'Mar', production: 150, efficiency: 92, defects: 2 },
  { month: 'Apr', production: 140, efficiency: 90, defects: 4 },
  { month: 'May', production: 165, efficiency: 94, defects: 1 },
  { month: 'Jun', production: 180, efficiency: 96, defects: 2 }
];

const departmentPerformanceData = [
  { name: 'Manufacturing', value: 35, color: '#0088FE' },
  { name: 'Quality Control', value: 25, color: '#00C49F' },
  { name: 'Assembly', value: 20, color: '#FFBB28' },
  { name: 'Packaging', value: 15, color: '#FF8042' },
  { name: 'Maintenance', value: 5, color: '#8884d8' }
];

const costAnalysisData = [
  { category: 'Materials', planned: 15000, actual: 14500 },
  { category: 'Labor', planned: 12000, actual: 12800 },
  { category: 'Equipment', planned: 8000, actual: 7500 },
  { category: 'Overhead', planned: 5000, actual: 5200 }
];

const qualityMetricsData = [
  { week: 'Week 1', defectRate: 2.5, reworkRate: 1.2, scrapRate: 0.8 },
  { week: 'Week 2', defectRate: 2.1, reworkRate: 1.0, scrapRate: 0.6 },
  { week: 'Week 3', defectRate: 1.8, reworkRate: 0.9, scrapRate: 0.5 },
  { week: 'Week 4', defectRate: 1.5, reworkRate: 0.7, scrapRate: 0.4 }
];

interface AnalyticsChartsProps {
  data?: any;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      
      {/* Production Trend Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Production Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="production" fill="#8884d8" name="Production (Units)" />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#82ca9d" name="Efficiency %" />
              <Line yAxisId="right" type="monotone" dataKey="defects" stroke="#ff7300" name="Defects" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Performance Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentPerformanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costAnalysisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#8884d8" name="Planned" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality Metrics Area Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quality Metrics Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={qualityMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="defectRate" stackId="1" stroke="#ff7300" fill="#ff7300" name="Defect Rate %" />
              <Area type="monotone" dataKey="reworkRate" stackId="1" stroke="#387908" fill="#387908" name="Rework Rate %" />
              <Area type="monotone" dataKey="scrapRate" stackId="1" stroke="#8884d8" fill="#8884d8" name="Scrap Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}