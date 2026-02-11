import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';

// Sample data for charts
const harvestTrendData = [
  { month: 'Jan', harvest: 485, quality: 4.2, target: 500 },
  { month: 'Feb', harvest: 512, quality: 4.5, target: 500 },
  { month: 'Mar', harvest: 498, quality: 4.4, target: 520 },
  { month: 'Apr', harvest: 545, quality: 4.6, target: 520 },
  { month: 'May', harvest: 578, quality: 4.7, target: 550 },
  { month: 'Jun', harvest: 612, quality: 4.8, target: 550 },
];

const qualityDistributionData = [
  { name: 'Excellent (4.5+)', value: 35, color: '#10b981' },
  { name: 'Good (4.0-4.4)', value: 40, color: '#3b82f6' },
  { name: 'Average (3.5-3.9)', value: 18, color: '#f59e0b' },
  { name: 'Below Avg (<3.5)', value: 7, color: '#ef4444' },
];

const farmerPerformanceData = [
  { subject: 'Harvest Volume', Juan: 90, Maria: 85, Pedro: 75, fullMark: 100 },
  { subject: 'Quality Rating', Juan: 95, Maria: 88, Pedro: 82, fullMark: 100 },
  { subject: 'Consistency', Juan: 85, Maria: 90, Pedro: 78, fullMark: 100 },
  { subject: 'Efficiency', Juan: 88, Maria: 82, Pedro: 85, fullMark: 100 },
  { subject: 'Timeliness', Juan: 92, Maria: 87, Pedro: 80, fullMark: 100 },
  { subject: 'Tree Health', Juan: 78, Maria: 85, Pedro: 88, fullMark: 100 },
];

const payrollTrendData = [
  { week: 'W1', total: 38920, bonuses: 2100, deductions: 800 },
  { week: 'W2', total: 42180, bonuses: 2450, deductions: 650 },
  { week: 'W3', total: 45250, bonuses: 2800, deductions: 700 },
  { week: 'W4', total: 44100, bonuses: 2600, deductions: 900 },
];

const dailyHarvestData = [
  { day: 'Mon', volume: 82, pH: 5.4 },
  { day: 'Tue', volume: 95, pH: 5.6 },
  { day: 'Wed', volume: 78, pH: 5.3 },
  { day: 'Thu', volume: 102, pH: 5.7 },
  { day: 'Fri', volume: 88, pH: 5.5 },
  { day: 'Sat', volume: 75, pH: 5.4 },
  { day: 'Sun', volume: 65, pH: 5.2 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Harvest Trend Area Chart
export const HarvestTrendChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">Harvest Trend vs Target</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={harvestTrendData}>
          <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
          <XAxis dataKey="month" className="dark:text-gray-400" />
          <YAxis className="dark:text-gray-400" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '8px'
            }} 
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="harvest" 
            fill="#10b98140" 
            stroke="#10b981" 
            name="Actual Harvest (L)" 
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            name="Target (L)" 
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Quality Distribution Pie Chart
export const QualityDistributionChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">Quality Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={qualityDistributionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {qualityDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Percentage']}
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Farmer Performance Radar Chart
export const FarmerPerformanceRadarChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">Farmer Performance Comparison</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={farmerPerformanceData}>
          <PolarGrid className="dark:opacity-30" />
          <PolarAngleAxis dataKey="subject" className="text-xs" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar 
            name="Juan Dela Cruz" 
            dataKey="Juan" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Maria Santos" 
            dataKey="Maria" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Pedro Garcia" 
            dataKey="Pedro" 
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.3} 
          />
          <Legend />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '8px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Payroll Trend Bar Chart
export const PayrollTrendChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">Weekly Payroll Breakdown</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={payrollTrendData}>
          <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`₱${value.toLocaleString()}`, '']}
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="total" name="Total Payroll" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="bonuses" name="Bonuses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="deductions" name="Deductions" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Daily Harvest & pH Combined Chart
export const DailyHarvestChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">Daily Harvest Volume & pH Levels</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={dailyHarvestData}>
          <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" label={{ value: 'Volume (L)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" domain={[4, 7]} label={{ value: 'pH', angle: 90, position: 'insideRight' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="volume" name="Volume (L)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="pH" name="pH Level" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Quality Trend Line Chart
export const QualityTrendChart = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">Quality Rating Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={harvestTrendData}>
          <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
          <XAxis dataKey="month" />
          <YAxis domain={[3, 5]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="quality" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            name="Avg Quality Rating"
            dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Export all charts as a collection component
const AdvancedAnalyticsCharts = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <HarvestTrendChart />
    <QualityDistributionChart />
    <FarmerPerformanceRadarChart />
    <PayrollTrendChart />
    <DailyHarvestChart />
    <QualityTrendChart />
  </div>
);

export default AdvancedAnalyticsCharts;
