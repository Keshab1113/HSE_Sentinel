import React, { useState, useEffect } from "react";
import { X, Shield, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function EditRoleModal({ role, permissions, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    role_name: "",
    description: "",
    hierarchy_level: 3,
    permissions: [],
  });

  useEffect(() => {
    if (role) {
      setFormData({
        role_name: role.role_name || "",
        description: role.description || "",
        hierarchy_level: role.hierarchy_level || 3,
        permissions: role.permissions?.map((p) => p.id) || [],
      });
    }
  }, [role]);

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSelectAll = (groupPermissions) => {
    const groupPermIds = groupPermissions.map((p) => p.id);
    const allSelected = groupPermIds.every((id) =>
      formData.permissions.includes(id)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((id) => !groupPermIds.includes(id))
        : [...new Set([...prev.permissions, ...groupPermIds])],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(role.id, formData);
  };

  const hierarchyInfo = {
    0: { label: "Super Admin", desc: "Highest authority - full system access", icon: "👑" },
    1: { label: "Group Admin", desc: "Group-level management capabilities", icon: "🏢" },
    2: { label: "Team Admin", desc: "Team-level management capabilities", icon: "👥" },
    3: { label: "Employee", desc: "Standard employee access", icon: "👤" },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 border-2 border-blue-200/50 dark:border-blue-800/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Edit Role</h2>
                <p className="text-white/90 text-sm mt-1">
                  {role?.is_system ? "System role - Edit with caution" : "Modify custom role settings"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* System Role Warning */}
          {role?.is_system && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                  System Role - Edit Carefully
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  This is a system role that may affect core functionality. Ensure you understand the implications before making changes.
                </p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_name" className="text-sm font-semibold">
                  Role Name *
                </Label>
                <Input
                  id="role_name"
                  value={formData.role_name}
                  onChange={(e) =>
                    setFormData({ ...formData, role_name: e.target.value })
                  }
                  placeholder="e.g., Safety Officer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_key" className="text-sm font-semibold">
                  Role Key (Read-only)
                </Label>
                <Input
                  id="role_key"
                  value={role?.role_key || ""}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this role..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Hierarchy Level */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Hierarchy Level
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, hierarchy_level: level })
                  }
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.hierarchy_level === level
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="text-2xl mb-2">{hierarchyInfo[level].icon}</div>
                  <div className="font-semibold mb-1">Level {level}</div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                    {hierarchyInfo[level].label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hierarchyInfo[level].desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Permissions
                <Badge variant="secondary" className="ml-2">
                  {formData.permissions.length} selected
                </Badge>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, permissions: [] })}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {permissions.map((group) => {
                const groupPermIds = group.permissions?.map((p) => p.id) || [];
                const selectedCount = groupPermIds.filter((id) =>
                  formData.permissions.includes(id)
                ).length;
                const allSelected = selectedCount === groupPermIds.length;

                return (
                  <div
                    key={group.group_name}
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-base">{group.group_name}</h4>
                        <Badge
                          variant={allSelected ? "default" : "outline"}
                          className={allSelected ? "bg-green-500" : ""}
                        >
                          {selectedCount}/{groupPermIds.length}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAll(group.permissions)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-slate-900/50">
                      {group.permissions?.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        >
                          <Checkbox
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={() => handlePermissionToggle(perm.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {perm.permission_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {perm.action}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {perm.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none sm:w-32"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}