import React, { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "../../../api/axios";

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    role_key: "",
    role_name: "",
    description: "",
    hierarchy_level: 3,
    permissions: [],
  });

  // State to track expanded/collapsed permission groups
  const [expandedGroups, setExpandedGroups] = useState(new Set());

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
      formData.permissions.includes(id),
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((id) => !groupPermIds.includes(id))
        : [...new Set([...prev.permissions, ...groupPermIds])],
    }));
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  

  const fetchPermissions = async () => {
    try {
      const response = await api.get("/rbac/permissions");
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setPermissions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.role_key || !formData.role_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await api.post("/rbac/roles", formData);
      if (response.status === 200 && response.data?.success) {
        toast({
          title: "Success",
          description: "Role created successfully!",
        });
        navigate("/system-admin");
      }
    } catch (error) {
      console.error("Create role error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hierarchyInfo = {
    0: {
      label: "Super Admin",
      desc: "Highest authority - full system access",
      icon: "👑",
    },
    1: {
      label: "Group Admin",
      desc: "Group-level management capabilities",
      icon: "🏢",
    },
    2: {
      label: "Team Admin",
      desc: "Team-level management capabilities",
      icon: "👥",
    },
    3: { label: "Employee", desc: "Standard employee access", icon: "👤" },
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Create New Role
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Define a custom role with specific permissions
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateRole}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info & Permissions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Basic Information
                      </CardTitle>
                      <CardDescription>
                        Enter the role's basic details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="role_key"
                        className="text-sm font-semibold"
                      >
                        Role Key *
                      </Label>
                      <Input
                        id="role_key"
                        value={formData.role_key}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role_key: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          })
                        }
                        placeholder="e.g., safety_officer"
                        pattern="[a-z_]+"
                        title="Only lowercase letters and underscores"
                        required
                        className="font-mono h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Unique identifier (lowercase, underscores only)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="role_name"
                        className="text-sm font-semibold"
                      >
                        Role Name *
                      </Label>
                      <Input
                        id="role_name"
                        value={formData.role_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Safety Officer"
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Display name shown in the interface
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the responsibilities and purpose of this role..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Permissions Selection Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Select Permissions
                        </CardTitle>
                        <CardDescription>
                          Choose permissions for this role
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-sm ml-2">
                        {formData.permissions.length} selected
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData({ ...formData, permissions: [] })
                        }
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {permissions.map((group) => {
                      const groupPermIds =
                        group.permissions?.map((p) => p.id) || [];
                      const selectedCount = groupPermIds.filter((id) =>
                        formData.permissions.includes(id),
                      ).length;
                      const isExpanded = expandedGroups.has(group.group_name);

                      return (
                        <div
                          key={group.group_name}
                          className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                        >
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleGroup(group.group_name)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <h4 className="font-semibold text-base">
                                {group.group_name}
                              </h4>
                              <Badge
                                variant={
                                  selectedCount === groupPermIds.length
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  selectedCount === groupPermIds.length
                                    ? "bg-green-500"
                                    : ""
                                }
                              >
                                {selectedCount}/{groupPermIds.length}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleGroup(group.group_name)
                                    }
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="w-4 h-4 mr-2" />
                                        Collapse
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                        Expand
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSelectAll(group.permissions)
                                    }
                                  >
                                    {selectedCount === groupPermIds.length ? (
                                      <>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Deselect All
                                      </>
                                    ) : (
                                      <>
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        Select All
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSelectAll(group.permissions)
                                }
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                {selectedCount === groupPermIds.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                              {group.permissions?.map((perm) => (
                                <label
                                  key={perm.id}
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                                >
                                  <Checkbox
                                    checked={formData.permissions.includes(
                                      perm.id,
                                    )}
                                    onCheckedChange={() =>
                                      handlePermissionToggle(perm.id)
                                    }
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium">
                                        {perm.permission_name}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Hierarchy & Actions */}
            <div className="space-y-6">
              {/* Hierarchy Level Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Hierarchy Level</CardTitle>
                      <CardDescription>Set the authority level</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[0, 1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, hierarchy_level: level })
                          }
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            formData.hierarchy_level === level
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                              : "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {hierarchyInfo[level].icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold mb-1">
                                Level {level}
                              </div>
                              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {hierarchyInfo[level].label}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {hierarchyInfo[level].desc}
                              </div>
                            </div>
                            {formData.hierarchy_level === level && (
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        💡 <strong>Tip:</strong> Lower numbers = higher
                        authority. Roles can only manage roles at their level +1
                        and below.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg py-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b pt-4">
                  <CardTitle className="text-xl">Role Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Role Key:
                      </span>
                      <span className="font-mono text-sm font-semibold">
                        {formData.role_key || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Role Name:
                      </span>
                      <span className="text-sm font-semibold">
                        {formData.role_name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Hierarchy Level:
                      </span>
                      <span className="text-sm font-semibold">
                        {formData.hierarchy_level !== undefined
                          ? `Level ${formData.hierarchy_level}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Permissions:
                      </span>
                      <span className="text-sm font-semibold">
                        {formData.permissions.length}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="w-full mt-3 h-11"
                    >
                      Cancel
                    </Button>
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
