import React, { useState, useEffect } from "react";
import { X, User, Key, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import api from "../../../api/axios";

export default function UserPermissionsModal({ user, permissions, onClose }) {
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({
    permissionId: "",
    reason: "",
    expiresAt: ""
  });

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/rbac/permissions/user/${user.id}`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setUserPermissions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/rbac/permissions/grant", {
        userId: user.id,
        permissionId: parseInt(grantForm.permissionId),
        reason: grantForm.reason,
        expiresAt: grantForm.expiresAt || null
      });

      if (response.status === 200 && response.data?.success) {
        alert("Permission granted successfully!");
        setShowGrant(false);
        setGrantForm({ permissionId: "", reason: "", expiresAt: "" });
        fetchUserPermissions();
      } else {
        const data = await response.data;
        alert(data.message || "Failed to grant permission");
      }
    } catch (error) {
      console.error("Grant error:", error);
      alert("Failed to grant permission");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permissionKey) => {
    if (!confirm("Are you sure you want to revoke this permission override?")) return;

    try {
      const allPerms = permissions.flatMap(g => g.permissions || []);
      const perm = allPerms.find(p => p.permission_key === permissionKey);
      
      if (!perm) return;

      const response = await api.post("/rbac/permissions/revoke", {
        userId: user.id,
        permissionId: perm.id,
        reason: "Revoked by admin"
      });

      if (response.status === 200 && response.data?.success) {
        alert("Permission revoked successfully!");
        fetchUserPermissions();
      }
    } catch (error) {
      console.error("Revoke error:", error);
      alert("Failed to revoke permission");
    }
  };

  const allPermissions = permissions.flatMap(g => g.permissions || []);
  const overridePermissions = userPermissions.filter(p => p.source === 'override');
  const rolePermissions = userPermissions.filter(p => p.source === 'role');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">User Permissions</h2>
                <p className="text-white/80">{user.name} ({user.email})</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Grant Permission Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Grant Permission Override</h3>
                  <p className="text-sm text-muted-foreground">
                    Add special permissions that override role defaults
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowGrant(!showGrant)}
                  variant={showGrant ? "outline" : "default"}
                >
                  {showGrant ? "Cancel" : <><Plus className="w-4 h-4 mr-1" /> Grant</>}
                </Button>
              </div>

              {showGrant && (
                <form onSubmit={handleGrant} className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="space-y-2">
                    <Label>Permission *</Label>
                    <select
                      value={grantForm.permissionId}
                      onChange={(e) => setGrantForm({...grantForm, permissionId: e.target.value})}
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                      required
                    >
                      <option value="">Select permission...</option>
                      {allPermissions.map(perm => (
                        <option key={perm.id} value={perm.id}>
                          {perm.permission_name} - {perm.permission_key}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Textarea
                      value={grantForm.reason}
                      onChange={(e) => setGrantForm({...grantForm, reason: e.target.value})}
                      placeholder="Explain why this permission is being granted..."
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expires At (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={grantForm.expiresAt}
                      onChange={(e) => setGrantForm({...grantForm, expiresAt: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">Leave empty for permanent override</p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    Grant Permission Override
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Permission Overrides */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Permission Overrides</h3>
              <Badge variant="secondary">{overridePermissions.length}</Badge>
            </div>

            {overridePermissions.length > 0 ? (
              <div className="space-y-3">
                {overridePermissions.map((perm) => (
                  <Card key={perm.permission_key}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{perm.permission_name}</p>
                            <code className="text-xs text-purple-600 dark:text-purple-400 mt-1 block">
                              {perm.permission_key}
                            </code>
                            {perm.expires_at && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Calendar className="w-3 h-3" />
                                Expires: {new Date(perm.expires_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevoke(perm.permission_key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No permission overrides</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Role Permissions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Permissions from Role</h3>
              <Badge variant="outline">{rolePermissions.length}</Badge>
            </div>

            {rolePermissions.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {rolePermissions.map((perm) => (
                  <div
                    key={perm.permission_key}
                    className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <Key className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{perm.permission_name}</p>
                      <code className="text-xs text-slate-500">{perm.permission_key}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No role permissions assigned</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button onClick={onClose} size="lg">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}