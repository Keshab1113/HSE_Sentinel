import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Calendar, Printer, Mail } from 'lucide-react';
import api from "../../api/axios";

const ReportGenerator = ({ user }) => {
  const [reportType, setReportType] = useState('safety_score');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({
    executiveSummary: true,
    leadingIndicators: true,
    laggingIndicators: true,
    compliance: true,
    recommendations: true
  });
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'safety_score', label: 'Safety Score Report' },
    { value: 'incident_analysis', label: 'Incident Analysis Report' },
    { value: 'compliance_report', label: 'Compliance Report' },
    { value: 'predictive_analysis', label: 'Predictive Analysis Report' },
    { value: 'training_report', label: 'Training Compliance Report' },
    { value: 'audit_report', label: 'Audit Report' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'word', label: 'Word' }
  ];

  const handleSectionToggle = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/analytics/reports/generate', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        format: format,
        sections: sections,
        group_id: user.group_id,
        team_id: user.team_id
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hse_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('Report generated successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    try {
      await api.post('/analytics/reports/email', {
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        recipient_email: user.email
      });
      alert('Report sent to your email!');
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send email');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generate Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map(fmt => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Sections to Include</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(sections).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`section-${key}`}
                  checked={value}
                  onCheckedChange={() => handleSectionToggle(key)}
                />
                <label
                  htmlFor={`section-${key}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={generateReport}
            disabled={generating}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
          
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print Preview
          </Button>
          
          <Button variant="outline" onClick={handleEmail} className="gap-2">
            <Mail className="w-4 h-4" />
            Email Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;