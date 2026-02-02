import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function SafetyScoreCard({ score, trend, type = 'composite', subtitle = '' }) {
    const getTrendIcon = () => {
        switch (trend) {
            case 'improving':
                return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'declining':
                return <TrendingDown className="w-5 h-5 text-red-500" />;
            case 'critical':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default:
                return <Minus className="w-5 h-5 text-gray-500" />;
        }
    };

    const getColorClass = (score) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-amber-600';
        return 'text-red-600';
    };

    const getProgressColor = (score) => {
        if (score >= 85) return 'bg-green-500';
        if (score >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'leading':
                return 'Leading Indicators';
            case 'lagging':
                return 'Lagging Indicators';
            default:
                return 'Safety Score';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>{getTypeLabel()}</span>
                    {getTrendIcon()}
                </CardTitle>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${getColorClass(score)}`}>
                            {score.toFixed(1)}
                            <span className="text-lg text-gray-500">/100</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 capitalize">
                            {trend} trend
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{score}%</span>
                        </div>
                        <Progress 
                            value={score} 
                            className="h-2"
                            indicatorClassName={getProgressColor(score)}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0</span>
                            <span>Target: 85</span>
                            <span>100</span>
                        </div>
                    </div>
                    
                    {score < 70 && (
                        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            Requires immediate attention
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}