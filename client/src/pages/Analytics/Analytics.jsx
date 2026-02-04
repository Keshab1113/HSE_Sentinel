import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, TrendingDown, Activity, 
  Filter, Download, Calendar, AlertTriangle,
  Shield, CheckCircle, Users, Target
} from 'lucide-react';
import { SafetyScoreCard } from '../../components/dashboard/SafetyScoreCard';
import { IndicatorTrendChart } from '../../components/analytics/IndicatorTrendChart';
import api from '../../api/axios';

export default function Analytics({ user }) {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/indicators?timeRange=${timeRange}`);
      
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for indicators
  const indicatorTrends = [
    { date: '2024-01-01', leading: 85, lagging: 72, composite: 82 },
    { date: '2024-01-08', leading: 87, lagging: 70, composite: 83 },
    { date: '2024-01-15', leading: 90, lagging: 68, composite: 85 },
    { date: '2024-01-22', leading: 88, lagging: 65, composite: 84 },
    { date: '2024-01-29', leading: 92, lagging: 63, composite: 87 },
  ];

  // Performance metrics by department
  const departmentMetrics = [
    { name: 'Warehouse', score: 87, trend: 'up', incidents: 3 },
    { name: 'Production', score: 92, trend: 'up', incidents: 1 },
    { name: 'Maintenance', score: 78, trend: 'down', incidents: 5 },
    { name: 'Office', score: 95, trend: 'up', incidents: 0 },
    { name: 'Lab', score: 89, trend: 'same', incidents: 2 },
  ];

  // Leading indicators breakdown
  const leadingIndicators = [
    { name: 'Training Completion', value: 92, target: 95, status: 'good' },
    { name: 'Safety Inspections', value: 88, target: 90, status: 'good' },
    { name: 'PPE Compliance', value: 95, target: 100, status: 'excellent' },
    { name: 'Risk Assessments', value: 75, target: 85, status: 'warning' },
    { name: 'Safety Meetings', value: 80, target: 85, status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Safety Analytics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Advanced analytics and insights for safety performance • AI-powered predictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last quarter</option>
              <option value="year">Last year</option>
            </select>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Safety Scores Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SafetyScoreCard 
          score={87.5}
          trend="improving"
          type="composite"
          subtitle="Overall safety performance"
        />
        <SafetyScoreCard 
          score={92}
          trend="improving"
          type="leading"
          subtitle="Proactive safety measures"
        />
        <SafetyScoreCard 
          score={78}
          trend="declining"
          type="lagging"
          subtitle="Reactive incident metrics"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicator Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Indicator Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IndicatorTrendChart data={indicatorTrends} />
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentMetrics.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      dept.trend === 'up' ? 'bg-emerald-500' :
                      dept.trend === 'down' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dept.incidents} incident{dept.incidents !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{dept.score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <Button size="sm" variant="ghost">Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leading Indicators Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Leading Indicators Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadingIndicators.map((indicator, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{indicator.name}</span>
                    <Badge variant={
                      indicator.status === 'excellent' ? 'success' :
                      indicator.status === 'good' ? 'default' : 'warning'
                    } className="text-xs">
                      {indicator.status}
                    </Badge>
                  </div>
                  <span className="font-bold">
                    {indicator.value} / {indicator.target}
                  </span>
                </div>
                <Progress 
                  value={(indicator.value / indicator.target) * 100}
                  className="h-2"
                  indicatorClassName={
                    indicator.status === 'excellent' ? 'bg-emerald-500' :
                    indicator.status === 'good' ? 'bg-blue-500' : 'bg-amber-500'
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Target: {indicator.target}</span>
                  <span>100</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      {(user?.role === 'group_admin' || user?.role === 'super_admin') && (
        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Predictive Risk Analysis
              <Badge variant="outline" className="ml-2 text-xs">AI-Powered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border">
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-xl font-bold">Moderate</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">45% probability increase</p>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border">
                <p className="text-sm font-medium text-muted-foreground">Top Risk Area</p>
                <p className="text-xl font-bold mt-1">Warehouse</p>
                <p className="text-xs text-muted-foreground mt-1">Forklift operations</p>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border">
                <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
                <p className="text-xl font-bold mt-1">Immediate Review</p>
                <p className="text-xs text-muted-foreground mt-1">Within 7 days</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-white dark:bg-slate-800 border">
              <p className="text-sm font-medium text-muted-foreground mb-2">AI Analysis Summary</p>
              <p className="text-sm">
                Predictive analysis indicates a 45% increased risk of forklift-related incidents 
                in Warehouse Zone A based on recent near-misses, delayed maintenance, and increased traffic patterns. 
                Recommended actions include additional safety training and equipment inspections.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}