import React from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription 
} from '@/components/ui/card';
import { 
    AlertTriangle, 
    Bell, 
    TrendingDown, 
    TrendingUp,
    CheckCircle,
    Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PredictiveAlertCard({ alert }) {
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            default: return 'bg-blue-500 text-white';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'leading_decline': return <TrendingDown className="w-5 h-5" />;
            case 'lagging_spike': return <TrendingUp className="w-5 h-5" />;
            case 'score_drop': return <AlertTriangle className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className={`border-l-4 ${
            alert.severity === 'critical' ? 'border-l-red-500' :
            alert.severity === 'high' ? 'border-l-orange-500' :
            alert.severity === 'medium' ? 'border-l-yellow-500' :
            'border-l-blue-500'
        }`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                    </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(alert.created_at)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {alert.description}
                    </p>
                    
                    {alert.predicted_risk_score && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Predicted Risk:</span>
                            <Badge variant="outline" className="font-mono">
                                {alert.predicted_risk_score.toFixed(1)}/10
                            </Badge>
                            <span className="text-xs text-gray-500">
                                Confidence: {(alert.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}
                    
                    {alert.status === 'active' ? (
                        <div className="flex gap-2">
                            <Button size="sm" className="gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Acknowledge
                            </Button>
                            <Button size="sm" variant="outline">
                                View Details
                            </Button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            {alert.status === 'acknowledged' ? 'Acknowledged' : 'Resolved'} 
                            {alert.acknowledged_by && ` by Admin`}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}