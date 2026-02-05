import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Calendar, 
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import api from "../../api/axios";

const ComplianceTracker = ({ user }) => {
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    regulation: '',
    requirement: '',
    due_date: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchComplianceItems();
  }, []);

  const fetchComplianceItems = async () => {
    try {
      const response = await api.get('/compliance', {
        params: { groupId: user.group_id }
      });
      if (response.data?.success) {
        setComplianceItems(response.data.data);
      }
    } catch (error) {
      console.error('Compliance fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const regulations = [
    'OSHA 29 CFR 1910',
    'OSHA 29 CFR 1926',
    'ISO 45001:2018',
    'EPA Regulations',
    'DOT Regulations',
    'NFPA Standards',
    'ANSI Standards',
    'Local Regulations'
  ];

  const handleAddCompliance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/compliance', {
        ...newItem,
        group_id: user.group_id,
        team_id: user.team_id,
        assigned_to: user.id
      });
      setShowAddForm(false);
      setNewItem({
        regulation: '',
        requirement: '',
        due_date: '',
        status: 'pending',
        notes: ''
      });
      fetchComplianceItems();
      alert('Compliance item added successfully');
    } catch (error) {
      console.error('Add compliance error:', error);
      alert('Failed to add compliance item');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/compliance/${id}/status`, { status });
      fetchComplianceItems();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleUploadEvidence = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('compliance_id', id);

    try {
      await api.post('/compliance/upload-evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchComplianceItems();
      alert('Evidence uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload evidence');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'non_compliant': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700';
      case 'non_compliant': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div>Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compliance Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Track regulatory compliance requirements and deadlines
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Add Compliance Item
        </Button>
      </div>

      {/* Add Compliance Form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleAddCompliance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regulation</label>
                  <Select 
                    value={newItem.regulation} 
                    onValueChange={(value) => setNewItem({...newItem, regulation: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select regulation" />
                    </SelectTrigger>
                    <SelectContent>
                      {regulations.map(reg => (
                        <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Requirement</label>
                  <Input
                    value={newItem.requirement}
                    onChange={(e) => setNewItem({...newItem, requirement: e.target.value})}
                    placeholder="Specific requirement"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newItem.due_date}
                    onChange={(e) => setNewItem({...newItem, due_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={newItem.status} 
                    onValueChange={(value) => setNewItem({...newItem, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Compliance Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Compliance List */}
      <div className="space-y-4">
        {complianceItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No compliance items yet</p>
            </CardContent>
          </Card>
        ) : (
          complianceItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold text-lg">{item.regulation}</h3>
                      <p className="text-sm text-muted-foreground">{item.requirement}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline">{item.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg mb-4">
                    {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    {['pending', 'in_progress', 'compliant', 'non_compliant'].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={item.status === status ? "default" : "outline"}
                        onClick={() => handleUpdateStatus(item.id, status)}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleUploadEvidence(item.id, e.target.files[0])}
                      />
                      Evidence
                    </Button>
                    {item.evidence_url && (
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="w-3 h-3" />
                        Evidence
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplianceTracker;