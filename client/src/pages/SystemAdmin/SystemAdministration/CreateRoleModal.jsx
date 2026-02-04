// ==================================================================
// CreateRoleModal.jsx
// ==================================================================
import React, { useState } from "react";
import { X, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function CreateRoleModal({ permissions, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    role_key: "",
    role_name: "",
    description: "",
    hierarchy_level: 3,
    permissions: []
  });

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAll = (groupPermissions) => {
    const groupPermIds = groupPermissions.map(p => p.id);
    const allSelected = groupPermIds.every(id => formData.permissions.includes(id));
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(id => !groupPermIds.includes(id))
        : [...new Set([...prev.permissions, ...groupPermIds])]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold">Create New Role</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role_key">Role Key *</Label>
              <Input
                id="role_key"
                value={formData.role_key}
                onChange={(e) => setFormData({...formData, role_key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                placeholder="safety_officer"
                pattern="[a-z_]+"
                title="Only lowercase letters and underscores"
                required
              />
              <p className="text-xs text-muted-foreground">Use lowercase and underscores only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_name">Role Name *</Label>
              <Input
                id="role_name"
                value={formData.role_name}
                onChange={(e) => setFormData({...formData, role_name: e.target.value})}
                placeholder="Safety Officer"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the responsibilities and purpose of this role..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hierarchy_level">Hierarchy Level</Label>
            <select
              id="hierarchy_level"
              value={formData.hierarchy_level}
              onChange={(e) => setFormData({...formData, hierarchy_level: parseInt(e.target.value)})}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              <option value={1}>Level 1 (Group Admin equivalent)</option>
              <option value={2}>Level 2 (Team Admin equivalent)</option>
              <option value={3}>Level 3 (Employee equivalent)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Lower numbers = higher privileges. Level 0 is reserved for super_admin.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Permissions ({formData.permissions.length} selected)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({...formData, permissions: []})}
              >
                Clear All
              </Button>
            </div>

            {permissions.map((group) => {
              const groupPermIds = group.permissions?.map(p => p.id) || [];
              const selectedCount = groupPermIds.filter(id => formData.permissions.includes(id)).length;

              return (
                <div key={group.group_name} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{group.group_name}</h3>
                      <Badge variant="outline">{selectedCount}/{groupPermIds.length}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(group.permissions)}
                    >
                      {selectedCount === groupPermIds.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {group.permissions?.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.permissions.includes(perm.id)}
                          onCheckedChange={() => handlePermissionToggle(perm.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{perm.permission_name}</span>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              Create Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}