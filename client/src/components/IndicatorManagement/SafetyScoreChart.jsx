import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SafetyScoreChart = ({ data, timeframe }) => {
  // Process data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.score || 0,
    leading: item.leading || 0,
    lagging: item.lagging || 0
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            name="Safety Score"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="leading" 
            stroke="#10b981" 
            strokeWidth={1.5}
            name="Leading"
            strokeDasharray="3 3"
          />
          <Line 
            type="monotone" 
            dataKey="lagging" 
            stroke="#ef4444" 
            strokeWidth={1.5}
            name="Lagging"
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SafetyScoreChart;