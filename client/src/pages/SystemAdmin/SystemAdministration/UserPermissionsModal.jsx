import React, { useState, useEffect } from "react";
import { X, User, Key, Plus, Trash2, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import api from "../../../api/axios";

export default function UserPermissionsModal({ user, permissions, onClose }) {
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({
    permissionId: "",
    reason: "",
    expiresAt: "",
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
      toast.error("Failed to fetch user permissions");
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
        expiresAt: grantForm.expiresAt || null,
      });

      if (response.status === 200 && response.data?.success) {
        toast.success("Permission granted successfully!");
        setShowGrant(false);
        setGrantForm({ permissionId: "", reason: "", expiresAt: "" });
        fetchUserPermissions();
      } else {
        const data = await response.data;
        toast.error(data.message || "Failed to grant permission");
      }
    } catch (error) {
      console.error("Grant error:", error);
      toast.error(error.response?.data?.message || "Failed to grant permission");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permissionKey) => {
    if (!confirm("Are you sure you want to revoke this permission override?")) return;

    try {
      const allPerms = permissions.flatMap((g) => g.permissions || []);
      const perm = allPerms.find((p) => p.permission_key === permissionKey);

      if (!perm) return;

      const response = await api.post("/rbac/permissions/revoke", {
        userId: user.id,
        permissionId: perm.id,
        reason: "Revoked by admin",
      });

      if (response.status === 200 && response.data?.success) {
        toast.success("Permission revoked successfully!");
        fetchUserPermissions();
      }
    } catch (error) {
      console.error("Revoke error:", error);
      toast.error(error.response?.data?.message || "Failed to revoke permission");
    }
  };

  const allPermissions = permissions.flatMap((g) => g.permissions || []);
  const overridePermissions = userPermissions.filter((p) => p.source === "override");
  const rolePermissions = userPermissions.filter((p) => p.source === "role");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">User Permissions</h2>
                <p className="text-white/90 text-sm sm:text-base">
                  {user.name} ({user.email})
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

        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Grant Permission Section */}
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Grant Permission Override</h3>
                  <p className="text-sm text-muted-foreground">
                    Add special permissions that override role defaults
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowGrant(!showGrant)}
                  variant={showGrant ? "outline" : "default"}
                  className={!showGrant ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""}
                >
                  {showGrant ? (
                    "Cancel"
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" /> Grant
                    </>
                  )}
                </Button>
              </div>

              {showGrant && (
                <form
                  onSubmit={handleGrant}
                  className="space-y-4 p-4 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-purple-50/50 dark:bg-purple-950/20"
                >
                  <div className="space-y-2">
                    <Label className="font-semibold">Permission *</Label>
                    <select
                      value={grantForm.permissionId}
                      onChange={(e) =>
                        setGrantForm({ ...grantForm, permissionId: e.target.value })
                      }
                      className="w-full p-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                      required
                    >
                      <option value="">Select permission...</option>
                      {allPermissions.map((perm) => (
                        <option key={perm.id} value={perm.id}>
                          {perm.permission_name} - {perm.permission_key}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Reason *</Label>
                    <Textarea
                      value={grantForm.reason}
                      onChange={(e) =>
                        setGrantForm({ ...grantForm, reason: e.target.value })
                      }
                      placeholder="Explain why this permission is being granted..."
                      rows={2}
                      required
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Expires At (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={grantForm.expiresAt}
                      onChange={(e) =>
                        setGrantForm({ ...grantForm, expiresAt: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for permanent override
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Granting...
                      </>
                    ) : (
                      "Grant Permission Override"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Permission Overrides */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">Permission Overrides</h3>
              <Badge variant="secondary" className="font-semibold">
                {overridePermissions.length}
              </Badge>
            </div>

            {overridePermissions.length > 0 ? (
              <div className="space-y-3">
                {overridePermissions.map((perm) => (
                  <Card
                    key={perm.permission_key}
                    className="border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50">
                            <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg mb-1">
                              {perm.permission_name}
                            </p>
                            <code className="text-xs text-purple-600 dark:text-purple-400 block mb-2">
                              {perm.permission_key}
                            </code>
                            {perm.expires_at && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Expires: {new Date(perm.expires_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevoke(perm.permission_key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No Permission Overrides</h4>
                  <p className="text-sm text-muted-foreground">
                    This user has no special permission overrides
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Role Permissions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">Permissions from Role</h3>
              <Badge variant="outline" className="font-semibold">
                {rolePermissions.length}
              </Badge>
            </div>

            {rolePermissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rolePermissions.map((perm) => (
                  <div
                    key={perm.permission_key}
                    className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <Key className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {perm.permission_name}
                      </p>
                      <code className="text-xs text-slate-500 truncate block">
                        {perm.permission_key}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="p-8 text-center">
                  <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No role permissions assigned
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-700 p-6 flex justify-end rounded-b-2xl">
          <Button onClick={onClose} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}