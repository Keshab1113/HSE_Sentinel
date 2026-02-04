import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, Bell, CheckCircle, Clock, Filter, 
  Search, TrendingUp, TrendingDown, Shield
} from 'lucide-react';
import { PredictiveAlertCard } from '../../components/alerts/PredictiveAlertCard';
import api from '../../api/axios';

export default function AlertsDashboard({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/indicators/alerts');
      
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setAlerts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await api.post(`/indicators/alerts/${alertId}/acknowledge`);
      
      if (response.status === 200 && response.data?.success) {
        // Update local state
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledged_by: user.id }
            : alert
        ));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Mock alerts for demonstration
  const mockAlerts = [
    {
      id: 1,
      title: "Forklift Safety Risk Increase",
      description: "AI detected 45% increased risk of forklift incidents in Warehouse Zone A based on recent patterns",
      alert_type: "leading_decline",
      severity: "high",
      status: "active",
      created_at: new Date().toISOString(),
      predicted_risk_score: 7.8,
      confidence: 0.85,
      acknowledged_by: null
    },
    {
      id: 2,
      title: "Delayed Equipment Maintenance",
      description: "Critical maintenance tasks overdue by 7+ days in Production Line 3",
      alert_type: "score_drop",
      severity: "medium",
      status: "active",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      predicted_risk_score: 6.2,
      confidence: 0.92,
      acknowledged_by: null
    },
    {
      id: 3,
      title: "PPE Compliance Decline",
      description: "15% drop in PPE compliance observed in Construction Zone B",
      alert_type: "lagging_spike",
      severity: "medium",
      status: "acknowledged",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      predicted_risk_score: 5.5,
      confidence: 0.78,
      acknowledged_by: 1
    }
  ];

  const displayAlerts = alerts.length > 0 ? filteredAlerts : mockAlerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Predictive Alerts Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-generated safety risk predictions and alerts requiring attention
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" className="gap-2" onClick={fetchAlerts}>
            <Bell className="w-4 h-4" />
            Refresh Alerts
          </Button>
          <Button size="sm" className="gap-2">
            <Shield className="w-4 h-4" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Alerts" 
          value="3" 
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-red-600 bg-red-50 dark:bg-red-900/20"
          trend="up"
        />
        <StatCard 
          title="Acknowledged" 
          value="1" 
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
          trend="same"
        />
        <StatCard 
          title="High Priority" 
          value="2" 
          icon={<Bell className="w-5 h-5" />}
          color="text-amber-600 bg-amber-50 dark:bg-amber-900/20"
          trend="up"
        />
        <StatCard 
          title="Avg Response Time" 
          value="4.2h" 
          icon={<Clock className="w-5 h-5" />}
          color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
          trend="down"
        />
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
            className="gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            Active
          </Button>
          <Button
            variant={filterStatus === 'acknowledged' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('acknowledged')}
            className="gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Acknowledged
          </Button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Filter className="w-4 h-4 text-slate-500" />
          <select className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 w-full">
            <option>Sort by: Newest</option>
            <option>Sort by: Priority</option>
            <option>Sort by: Severity</option>
          </select>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {displayAlerts.some(alert => alert.severity === 'critical' && alert.status === 'active') && (
        <Card className="border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-300">
                    Critical Alert Requiring Immediate Attention
                  </h3>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">
                    One or more critical alerts require immediate action to prevent potential incidents
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm">
                Take Action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Grid */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </CardContent>
            </Card>
          ))
        ) : displayAlerts.length > 0 ? (
          displayAlerts.map((alert) => (
            <div key={alert.id}>
              <PredictiveAlertCard alert={alert} />
              {alert.status === 'active' && (
                <div className="mt-2 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Acknowledge
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No alerts found
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No active alerts at this time. Great job!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alert Configuration */}
      {(user?.role === 'group_admin' || user?.role === 'super_admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Alert Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Threshold</label>
                  <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                    <option>High (70% risk score)</option>
                    <option>Medium (50% risk score)</option>
                    <option>Low (30% risk score)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification Frequency</label>
                  <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                    <option>Immediate</option>
                    <option>Daily Digest</option>
                    <option>Weekly Summary</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Escalation Level</label>
                  <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                    <option>Team Level</option>
                    <option>Group Level</option>
                    <option>Executive Level</option>
                  </select>
                </div>
              </div>
              <Button className="w-full md:w-auto">Save Configuration</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          {getTrendIcon(trend)}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}