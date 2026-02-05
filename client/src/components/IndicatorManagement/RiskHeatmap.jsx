import React from 'react';

const RiskHeatmap = ({ alerts, riskLevel }) => {
  const riskCategories = [
    { name: 'Incidents', count: alerts.filter(a => a.alert_type === 'incident').length },
    { name: 'Training', count: alerts.filter(a => a.alert_type === 'training').length },
    { name: 'Inspections', count: alerts.filter(a => a.alert_type === 'inspection').length },
    { name: 'Equipment', count: alerts.filter(a => a.alert_type === 'equipment').length },
    { name: 'Compliance', count: alerts.filter(a => a.alert_type === 'compliance').length },
    { name: 'Other', count: alerts.filter(a => !['incident', 'training', 'inspection', 'equipment', 'compliance'].includes(a.alert_type)).length }
  ];

  const getColor = (count) => {
    if (count === 0) return 'bg-green-100 text-green-700';
    if (count <= 2) return 'bg-yellow-100 text-yellow-700';
    if (count <= 5) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {riskCategories.map((category, index) => (
          <div key={index} className="text-center">
            <div className={`p-4 rounded-lg ${getColor(category.count)}`}>
              <div className="text-2xl font-bold">{category.count}</div>
              <div className="text-xs mt-1">{category.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Current Risk Level: <span className={`font-semibold ${getColor(riskLevel === 'critical' ? 10 : riskLevel === 'high' ? 5 : riskLevel === 'medium' ? 2 : 0).split(' ')[1]}`}>
          {riskLevel?.toUpperCase() || 'LOW'}
        </span>
      </div>
    </div>
  );
};

export default RiskHeatmap;