import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IndicatorTrendChart = ({ leadingScore, laggingScore }) => {
  const data = [
    { name: 'Leading', value: leadingScore || 0, color: '#10b981' },
    { name: 'Lagging', value: laggingScore || 0, color: '#ef4444' }
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(1)}%`, 'Score']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            name="Score"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-emerald-600">{leadingScore?.toFixed(1) || 0}%</div>
          <div className="text-xs text-muted-foreground">Leading</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-600">{laggingScore?.toFixed(1) || 0}%</div>
          <div className="text-xs text-muted-foreground">Lagging</div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorTrendChart;