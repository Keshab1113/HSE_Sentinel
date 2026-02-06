import React, { useState, useEffect } from "react";
import { Key, Plus, Loader2, Hash, FileText, Shield, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "../../../api/axios";

export default function CreatePermissionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    permission_key: "",
    permission_name: "",
    description: "",
    module: "",
    action: "",
    group_id: "",
  });

  useEffect(() => {
    fetchPermissionGroups();
  }, []);

  const fetchPermissionGroups = async () => {
    try {
      const response = await api.get("/rbac/permissions");
      if (response.status === 200 && response.data?.success) {
        const data = response.data;
        setGroups(data.data || []);
        // Set first group as default if available
        if (data.data && data.data.length > 0) {
          setFormData((prev) => ({ ...prev, group_id: data.data[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error("Error fetching permission groups:", error);
      toast.error("Failed to fetch permission groups");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate permission_key based on module and action
    if (field === "module" || field === "action") {
      const module = field === "module" ? value : formData.module;
      const action = field === "action" ? value : formData.action;
      if (module && action) {
        const key = `${module.toLowerCase().replace(/\s+/g, "_")}.${action.toLowerCase().replace(/\s+/g, "_")}`;
        setFormData((prev) => ({ ...prev, permission_key: key }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/rbac/permissions/create", {
        permission_key: formData.permission_key,
        permission_name: formData.permission_name,
        description: formData.description,
        module: formData.module,
        action: formData.action,
        group_id: parseInt(formData.group_id),
      });

      if (response.status === 200 && response.data?.success) {
        toast.success("Permission created successfully!");
        navigate("/system-admin");// Or your desired redirect path
      } else {
        toast.error(response.data?.message || "Failed to create permission");
      }
    } catch (error) {
      console.error("Create permission error:", error);
      toast.error(error.response?.data?.message || "Failed to create permission");
    } finally {
      setLoading(false);
    }
  };

  const actionOptions = [
    "create",
    "read",
    "update",
    "delete",
    "manage",
    "view",
    "edit",
    "approve",
    "reject",
    "export",
    "import",
  ];

  // Statistics for the preview
  const getGeneratedKey = () => {
    if (formData.module && formData.action) {
      return `${formData.module.toLowerCase().replace(/\s+/g, "_")}.${formData.action.toLowerCase().replace(/\s+/g, "_")}`;
    }
    return "Enter module and action...";
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Key className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Create New Permission
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Add a new permission to the system
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Permission Details</CardTitle>
                      <CardDescription>
                        Enter the permission's basic information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Permission Name */}
                  <div className="space-y-3">
                    <Label className="font-semibold flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" />
                      Permission Name *
                    </Label>
                    <Input
                      type="text"
                      value={formData.permission_name}
                      onChange={(e) => handleChange("permission_name", e.target.value)}
                      placeholder="e.g., View Users"
                      required
                      className="h-11 border-2 focus:border-purple-400"
                    />
                    <p className="text-xs text-muted-foreground">
                      A human-readable name for this permission
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Module */}
                    <div className="space-y-3">
                      <Label className="font-semibold flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4" />
                        Module *
                      </Label>
                      <Input
                        type="text"
                        value={formData.module}
                        onChange={(e) => handleChange("module", e.target.value)}
                        placeholder="e.g., users, roles, settings"
                        required
                        className="h-11 border-2 focus:border-purple-400"
                      />
                      <p className="text-xs text-muted-foreground">
                        The module or resource this permission applies to
                      </p>
                    </div>

                    {/* Action */}
                    <div className="space-y-3">
                      <Label className="font-semibold flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        Action *
                      </Label>
                      <select
                        value={formData.action}
                        onChange={(e) => handleChange("action", e.target.value)}
                        className="w-full h-11 p-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:border-purple-400 focus:outline-none"
                        required
                      >
                        <option value="">Select action...</option>
                        {actionOptions.map((action) => (
                          <option key={action} value={action}>
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        The action that can be performed
                      </p>
                    </div>
                  </div>

                  {/* Permission Key */}
                  <div className="space-y-3">
                    <Label className="font-semibold flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4" />
                      Permission Key *
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formData.permission_key}
                        onChange={(e) => setFormData({ ...formData, permission_key: e.target.value })}
                        placeholder="e.g., users.view"
                        required
                        className="h-11 border-2 focus:border-purple-400 font-mono text-sm pl-10"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        <Hash className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Auto-generated key:{" "}
                        <span className="font-mono text-purple-600 dark:text-purple-400">
                          {getGeneratedKey()}
                        </span>
                      </p>
                      {formData.permission_key !== getGeneratedKey() && formData.permission_key && (
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label className="font-semibold flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" />
                      Description *
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what this permission allows users to do..."
                      rows={4}
                      required
                      className="resize-none border-2 focus:border-purple-400 min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Clear description helps other administrators understand this permission
                    </p>
                  </div>

                  {/* Permission Group */}
                  <div className="space-y-3">
                    <Label className="font-semibold flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4" />
                      Permission Group *
                    </Label>
                    <select
                      value={formData.group_id}
                      onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                      className="w-full h-11 p-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:border-purple-400 focus:outline-none"
                      required
                    >
                      <option value="">Select group...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.group_name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        The category this permission belongs to
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {groups.length} groups available
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-6">
              {/* Preview Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <CardTitle className="text-xl">Permission Preview</CardTitle>
                  <CardDescription>
                    How the permission will appear
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {formData.permission_name || "Permission Name"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formData.module || "module"}.{formData.action || "action"}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Module:</span>
                        <Badge variant="outline" className="font-mono">
                          {formData.module || "Not set"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Action:</span>
                        <Badge variant="secondary" className="capitalize">
                          {formData.action || "Not set"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Key:</span>
                        <span className="text-sm font-mono font-semibold">
                          {formData.permission_key || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Group:</span>
                        <span className="text-sm font-semibold">
                          {groups.find(g => g.id.toString() === formData.group_id)?.group_name || "Not selected"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        💡 <strong>Tip:</strong> The permission key is used internally by the system. It should follow the format: <code className="font-mono">module.action</code>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <CardTitle className="text-xl">Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg h-11"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Permission
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                      className="w-full h-11"
                    >
                      Cancel
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/permissions")}
                        className="text-xs"
                      >
                        View All Permissions
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            permission_key: "",
                            permission_name: "",
                            description: "",
                            module: "",
                            action: "",
                            group_id: groups[0]?.id.toString() || "",
                          });
                        }}
                        className="text-xs"
                      >
                        Clear Form
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}