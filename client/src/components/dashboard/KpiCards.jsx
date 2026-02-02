import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function KpiCards({ metrics = [] }) {
  if (metrics.length === 0) {
    // Default metrics
    metrics = [
      { title: 'Safety Score', value: '87', unit: '/100', trend: 'up', progress: 87, status: 'good' },
      { title: 'Open High-Risk Tasks', value: '3', trend: 'same', status: 'warning' },
      { title: 'Predictive Alerts', value: '2', trend: 'up', status: 'critical' },
      { title: 'Compliance Status', value: '94%', trend: 'up', subtitle: 'On Track', status: 'good' },
    ];
  }

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'warning':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                {/* Icon would come from metric.icon */}
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold">{metric.value}</p>
                {metric.unit && (
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                )}
              </div>
              {metric.subtitle && (
                <p className="text-sm text-muted-foreground">{metric.subtitle}</p>
              )}
              
              {metric.progress && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{metric.progress}%</span>
                  </div>
                  <Progress value={metric.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}