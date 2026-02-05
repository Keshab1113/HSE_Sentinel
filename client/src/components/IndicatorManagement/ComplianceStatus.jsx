import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const ComplianceStatus = ({ data, user }) => {
  const complianceItems = [
    { 
      name: 'OSHA Compliance', 
      status: data.oshaStatus || 'pending',
      dueDate: 'Monthly',
      requirement: 'OSHA 300 Log'
    },
    { 
      name: 'ISO 45001', 
      status: data.isoStatus || 'pending',
      dueDate: 'Quarterly',
      requirement: 'Management Review'
    },
    { 
      name: 'Training Compliance', 
      status: data.trainingStatus || 'compliant',
      dueDate: 'Annual',
      requirement: '100% Completion'
    },
    { 
      name: 'Equipment Inspection', 
      status: data.equipmentStatus || 'compliant',
      dueDate: 'Monthly',
      requirement: 'Regular Inspections'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'non-compliant':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-700';
      case 'non-compliant':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const overallCompliance = complianceItems.filter(item => item.status === 'compliant').length / complianceItems.length * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Compliance</span>
          <span className="font-semibold">{overallCompliance.toFixed(0)}%</span>
        </div>
        <Progress value={overallCompliance} className="h-2" />
      </div>

      <div className="space-y-3">
        {complianceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.requirement}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(item.status)}`}>
                {item.status?.replace('-', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{item.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceStatus;