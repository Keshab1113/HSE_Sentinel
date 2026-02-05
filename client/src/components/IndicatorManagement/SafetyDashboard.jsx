import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Calendar, 
  BarChart3,
  Target,
  Activity,
  Shield,
  FileText,
  Download,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import api from "../../api/axios";
import SafetyScoreChart from './SafetyScoreChart';
import IndicatorTrendChart from './IndicatorTrendChart';
import RiskHeatmap from './RiskHeatmap';
import ComplianceStatus from './ComplianceStatus';

const SafetyDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    scores: {},
    trends: [],
    alerts: [],
    compliance: {},
    metrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch safety scores
      const scoresResponse = await api.get('/indicators/scores/all', {
        params: {
          groupId: user.group_id,
          teamId: user.team_id
        }
      });

      // Fetch trends
      const trendsResponse = await api.get('/analytics/trends', {
        params: { timeframe }
      });

      // Fetch alerts
      const alertsResponse = await api.get('/indicators/alerts/all', {
        params: { limit: 5, status: 'active' }
      });

      // Fetch compliance
      const complianceResponse = await api.get('/analytics/compliance', {
        params: { groupId: user.group_id }
      });

      setDashboardData({
        scores: scoresResponse.data?.data || {},
        trends: trendsResponse.data?.data || [],
        alerts: alertsResponse.data?.data || [],
        compliance: complianceResponse.data?.data || {},
        metrics: calculateMetrics(scoresResponse.data?.data || {})
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (scores) => {
    return {
      leadingProgress: scores.leadingScore || 0,
      laggingProgress: scores.laggingScore || 0,
      daysIncidentFree: scores.daysIncidentFree || 0,
      completionRate: scores.completionRate || 0,
      riskLevel: scores.riskLevel || 'low'
    };
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
      critical: 'bg-red-500 text-white'
    };
    return colors[level] || colors.low;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of safety performance and key indicators
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Score</p>
                <p className="text-3xl font-bold mt-2">
                  {dashboardData.scores.compositeScore?.toFixed(1) || 'N/A'}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {dashboardData.scores.trend === 'improving' ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Improving</span>
                    </>
                  ) : dashboardData.scores.trend === 'declining' ? (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">Declining</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Stable</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-sky-100 dark:bg-sky-900/30">
                <Shield className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leading Indicators</p>
                <p className="text-3xl font-bold mt-2">
                  {dashboardData.metrics.leadingProgress?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Proactive measures
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Incident Free</p>
                <p className="text-3xl font-bold mt-2">
                  {dashboardData.metrics.daysIncidentFree || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  No lagging incidents
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-3xl font-bold mt-2">
                  {dashboardData.metrics.riskLevel?.toUpperCase() || 'LOW'}
                </p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-md ${getRiskColor(dashboardData.metrics.riskLevel)}`}>
                    {dashboardData.metrics.riskLevel}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Safety Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SafetyScoreChart 
              data={dashboardData.trends}
              timeframe={timeframe}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leading vs Lagging Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <IndicatorTrendChart 
              leadingScore={dashboardData.scores.leadingScore}
              laggingScore={dashboardData.scores.laggingScore}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHeatmap 
              alerts={dashboardData.alerts}
              riskLevel={dashboardData.metrics.riskLevel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Badge variant="destructive">
                {dashboardData.alerts.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alerts.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                </div>
              ) : (
                dashboardData.alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.severity} • {alert.alert_type}
                        </p>
                      </div>
                      <Badge variant={
                        alert.severity === 'high' ? 'destructive' : 
                        alert.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceStatus 
              data={dashboardData.compliance}
              user={user}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyDashboard;