import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function IndicatorTrendChart({ data, title = 'Indicator Trends' }) {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                    <p className="font-semibold">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.dataKey}: {entry.value.toFixed(1)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#888"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <YAxis stroke="#888" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="leading"
                                name="Leading Indicators"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="lagging"
                                name="Lagging Indicators"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="composite"
                                name="Safety Score"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}