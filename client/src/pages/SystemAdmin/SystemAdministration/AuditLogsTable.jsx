import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, Calendar, User, Shield, Key, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import api from "../../../api/axios";

export default function AuditLogsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/rbac/audit-logs?limit=100");
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setLogs(data.data || []);
        toast.success("Audit logs refreshed");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (actionType) => {
    const badges = {
      role_created: {
        color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        label: "Role Created",
      },
      role_updated: {
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        label: "Role Updated",
      },
      role_deleted: {
        color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        label: "Role Deleted",
      },
      permission_granted: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        label: "Permission Granted",
      },
      permission_revoked: {
        color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
        label: "Permission Revoked",
      },
      user_override: {
        color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
        label: "User Override",
      },
    };
    return (
      badges[actionType] || {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        label: actionType,
      }
    );
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.performed_by_name?.toLowerCase().includes(filter.toLowerCase()) ||
      log.role_name?.toLowerCase().includes(filter.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(filter.toLowerCase()) ||
      log.permission_name?.toLowerCase().includes(filter.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action_type === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actionTypes = [
    "all",
    "role_created",
    "role_updated",
    "role_deleted",
    "permission_granted",
    "permission_revoked",
    "user_override",
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user, role, or permission..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white dark:bg-slate-900"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
            >
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Actions" : getActionBadge(type).label}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {logs.filter((l) => l.action_type.includes("role")).length}
            </p>
            <p className="text-xs text-muted-foreground">Role Actions</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {logs.filter((l) => l.action_type.includes("permission")).length}
            </p>
            <p className="text-xs text-muted-foreground">Permission Actions</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {new Set(logs.map((l) => l.performed_by)).size}
            </p>
            <p className="text-xs text-muted-foreground">Unique Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Audit Trail ({filteredLogs.length} logs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const badge = getActionBadge(log.action_type);

                return (
                  <div
                    key={log.id}
                    className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50">
                          {log.action_type.includes("role") ? (
                            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={`${badge.color} border`}>
                              {badge.label}
                            </Badge>
                            {log.role_name && (
                              <span className="text-sm font-semibold truncate">
                                {log.role_name}
                              </span>
                            )}
                            {log.permission_name && (
                              <span className="text-sm font-semibold truncate">
                                {log.permission_name}
                              </span>
                            )}
                            {log.user_name && (
                              <span className="text-sm font-semibold truncate">
                                {log.user_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.performed_by_name || "System"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                            {log.ip_address && <span>IP: {log.ip_address}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {log.reason && (
                      <div className="ml-12 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                        <span className="font-medium">Reason:</span> {log.reason}
                      </div>
                    )}

                    {(log.old_value || log.new_value) && (
                      <div className="mt-3 ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.old_value && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                            <p className="font-medium text-xs text-red-700 dark:text-red-400 mb-2">
                              Before:
                            </p>
                            <pre className="text-xs overflow-auto max-h-32 bg-white dark:bg-slate-900 p-2 rounded">
                              {JSON.stringify(JSON.parse(log.old_value), null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_value && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                            <p className="font-medium text-xs text-green-700 dark:text-green-400 mb-2">
                              After:
                            </p>
                            <pre className="text-xs overflow-auto max-h-32 bg-white dark:bg-slate-900 p-2 rounded">
                              {JSON.stringify(JSON.parse(log.new_value), null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Logs Found
                </h4>
                <p className="text-sm text-muted-foreground">
                  {filter || actionFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No audit logs available"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}