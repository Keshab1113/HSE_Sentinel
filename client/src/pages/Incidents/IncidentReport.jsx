import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, Upload, Camera, MapPin, Calendar,
  User, FileText, Shield, Send
} from 'lucide-react';

export default function IncidentReport({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    severity: 'medium',
    category: 'near_miss',
    witnesses: '',
    immediateActions: '',
    attachments: []
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/indicators/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          groupId: user.group_id,
          teamId: user.team_id,
          documentType: 'incident_report'
        })
      });

      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        alert('Incident reported successfully! AI analysis in progress.');
        // Reset form
        setFormData({
          title: '',
          description: '',
          location: '',
          incidentDate: new Date().toISOString().split('T')[0],
          incidentTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
          severity: 'medium',
          category: 'near_miss',
          witnesses: '',
          immediateActions: '',
          attachments: []
        });
      }
    } catch (error) {
      console.error('Error reporting incident:', error);
      alert('Failed to report incident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const severityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const categoryOptions = [
    { value: 'near_miss', label: 'Near Miss' },
    { value: 'first_aid', label: 'First Aid Case' },
    { value: 'property_damage', label: 'Property Damage' },
    { value: 'lost_time', label: 'Lost Time Injury' },
    { value: 'fatality', label: 'Fatality' },
    { value: 'environmental', label: 'Environmental Incident' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Report Safety Incident
          </h1>
          <p className="text-sm text-muted-foreground">
            Document incidents, near-misses, or safety observations for AI analysis and tracking
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="w-3 h-3" />
          Confidential Reporting
        </Badge>
      </div>

      {/* Incident Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Incident Details
            </CardTitle>
            <CardDescription>
              Provide accurate details for proper analysis and corrective actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Incident Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief description of the incident"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Building, floor, area"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Incident *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time of Incident *</label>
                <Input
                  type="time"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Severity and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Severity Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {severityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`p-3 rounded-lg border text-center ${
                        formData.severity === option.value
                          ? `${option.color} border-current`
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`p-3 rounded-lg border text-center ${
                        formData.category === option.value
                          ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, category: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Description *</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of what happened, including sequence of events..."
                rows={6}
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Include: What happened, how it happened, who was involved, what equipment/material was involved
              </p>
            </div>

            {/* Witnesses and Immediate Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Witnesses (if any)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    name="witnesses"
                    value={formData.witnesses}
                    onChange={handleChange}
                    placeholder="Names and contact information"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Immediate Actions Taken</label>
                <Textarea
                  name="immediateActions"
                  value={formData.immediateActions}
                  onChange={handleChange}
                  placeholder="First aid, isolation, notification..."
                  rows={3}
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Attachments</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Upload photos, videos, or documents related to the incident
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Choose Files
                  </Button>
                </label>
                {formData.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected files:</p>
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-sm text-blue-800/80 dark:text-blue-300/80">
                  Your incident report will be analyzed by our AI system to:
                </p>
                <ul className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-2 space-y-1">
                  <li>• Classify incident type and severity</li>
                  <li>• Identify patterns and root causes</li>
                  <li>• Generate predictive risk scores</li>
                  <li>• Recommend preventive actions</li>
                </ul>
                <p className="text-xs text-blue-700/60 dark:text-blue-400/60 mt-3">
                  Analysis typically completes within 2-3 minutes. You'll receive notifications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            className="gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Incident Report
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}