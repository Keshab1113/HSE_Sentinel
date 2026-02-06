import React from "react";
import { X, Shield, Key, Users, Calendar, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function RoleDetailsModal({ role, onClose }) {
  if (!role) return null;

  const permissionsByGroup = role.permissions?.reduce((acc, perm) => {
    const group = perm.group_name || "Other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(perm);
    return acc;
  }, {}) || {};

  const hierarchyInfo = {
    0: { label: "Super Admin", desc: "Highest authority - full system access", color: "from-purple-600 to-pink-600" },
    1: { label: "Group Admin", desc: "Group-level management capabilities", color: "from-blue-600 to-cyan-600" },
    2: { label: "Team Admin", desc: "Team-level management capabilities", color: "from-emerald-600 to-teal-600" },
    3: { label: "Employee", desc: "Standard employee access", color: "from-slate-600 to-gray-600" },
  };

  const currentHierarchy = hierarchyInfo[role.hierarchy_level] || hierarchyInfo[3];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-r ${currentHierarchy.color} text-white p-6 rounded-t-2xl z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-bold">{role.role_name}</h2>
                  {role.is_system && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      System Role
                    </Badge>
                  )}
                  <Badge
                    className={
                      role.is_active
                        ? "bg-green-500/20 text-white border-green-300/30"
                        : "bg-red-500/20 text-white border-red-300/30"
                    }
                  >
                    {role.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  {role.description || "No description provided"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50">
                    <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Role Key</p>
                    <code className="text-sm font-mono font-semibold truncate block">
                      {role.role_key}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Hierarchy</p>
                    <p className="text-sm font-semibold truncate">Level {role.hierarchy_level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Users</p>
                    <p className="text-sm font-semibold">{role.user_count || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Created</p>
                    <p className="text-sm font-semibold truncate">
                      {new Date(role.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hierarchy Description */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 text-blue-900 dark:text-blue-300">
                    {currentHierarchy.label} - Level {role.hierarchy_level}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                    {currentHierarchy.desc}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-500">
                    💡 This role can manage roles at level {role.hierarchy_level + 1} and below
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                Permissions
              </h3>
              <Badge variant="secondary" className="text-sm font-semibold">
                {role.permissions?.length || 0} total permissions
              </Badge>
            </div>

            {Object.keys(permissionsByGroup).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(permissionsByGroup).map(([groupName, perms]) => (
                  <Card key={groupName} className="border-2 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b-2 border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">{groupName}</h4>
                        <Badge variant="outline" className="font-semibold">
                          {perms.length} permissions
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-start gap-3 p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                          >
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 flex-shrink-0">
                              <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold truncate">
                                  {perm.permission_name}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {perm.action}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {perm.description}
                              </p>
                              <code className="text-xs text-purple-600 dark:text-purple-400 block truncate">
                                {perm.permission_key}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <Key className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Permissions Assigned
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This role has no permissions configured
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Metadata */}
          {role.created_by_name && (
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Created By</p>
                    <p className="font-semibold">{role.created_by_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created At</p>
                    <p className="font-semibold">
                      {new Date(role.created_at).toLocaleString()}
                    </p>
                  </div>
                  {role.updated_at && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground mb-1">Last Updated</p>
                      <p className="font-semibold">
                        {new Date(role.updated_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-700 p-6 flex justify-end rounded-b-2xl">
          <Button onClick={onClose} size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}