import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Settings,
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../../api/axios";
import CreateRoleModal from "./CreateRoleModal";
import EditRoleModal from "./EditRoleModal";
import RoleDetailsModal from "./RoleDetailsModal";
import UserPermissionsModal from "./UserPermissionsModal";
import AuditLogsTable from "./AuditLogsTable";

export default function SystemAdministration({ user }) {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("roles");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUserPermissions, setShowUserPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/rbac/roles");
      
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleCreateRole = async (roleData) => {
    try {
      const response = await api.post("/rbac/roles", roleData);
      if (response.status === 200 && response.data?.success) {
        alert("Role created successfully!");
        setShowCreateModal(false);
        fetchRoles();
      }
    } catch (error) {
      console.error("Create role error:", error);
      alert("Failed to create role");
    }
  };

  const handleUpdateRole = async (id, roleData) => {
    try {
      const response = await api.put(`/rbac/roles/${id}`, roleData);
      if (response.status === 200 && response.data?.success) {
        alert("Role updated successfully!");
        setShowEditModal(false);
        setSelectedRole(null);
        fetchRoles();
      }
    } catch (error) {
      console.error("Update role error:", error);
      alert("Failed to update role");
    }
  };

  const handleDeleteRole = async (id) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await api.delete(`/rbac/roles/${id}`);
      if (response.status === 200 && response.data?.success) {
        alert("Role deleted successfully!");
        fetchRoles();
      }
    } catch (error) {
      console.error("Delete role error:", error);
      const data = await error.response?.json();
      alert(data?.message || "Failed to delete role");
    }
  };

  const handleViewDetails = async (roleId) => {
    try {
      const response = await api.get(`/rbac/roles/${roleId}`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setSelectedRole(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Fetch role details error:", error);
    }
  };

  const handleEditClick = async (roleId) => {
    try {
      const response = await api.get(`/rbac/roles/${roleId}`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setSelectedRole(data.data);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Fetch role error:", error);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalRoles: roles.length,
    systemRoles: roles.filter(r => r.is_system).length,
    customRoles: roles.filter(r => !r.is_system).length,
    totalPermissions: permissions.reduce((sum, group) => sum + (group.permissions?.length || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage roles, permissions, and access control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{stats.totalRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{stats.systemRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custom Roles</p>
                <p className="text-2xl font-bold">{stats.customRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permissions</p>
                <p className="text-2xl font-bold">{stats.totalPermissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Roles Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  </CardContent>
                </Card>
              ))
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onView={handleViewDetails}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteRole}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No roles found
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {searchTerm ? "Try adjusting your search" : "Create your first custom role"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {permissions.map((group) => (
            <Card key={group.group_name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Key className="w-4 h-4" />
                  </div>
                  {group.group_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.permissions?.map((permission) => (
                    <div
                      key={permission.id}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{permission.permission_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {permission.action}
                        </Badge>
                      </div>
                      <code className="text-xs text-purple-600 dark:text-purple-400">
                        {permission.permission_key}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditLogsTable />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateModal && (
        <CreateRoleModal
          permissions={permissions}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRole}
        />
      )}

      {showEditModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          permissions={permissions}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onUpdate={handleUpdateRole}
        />
      )}

      {showDetailsModal && selectedRole && (
        <RoleDetailsModal
          role={selectedRole}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}

function RoleCard({ role, onView, onEdit, onDelete }) {
  const getHierarchyColor = (level) => {
    const colors = {
      0: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      3: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    };
    return colors[level] || colors[3];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${getHierarchyColor(role.hierarchy_level)}`}>
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex gap-2">
            {role.is_system && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
            <Badge
              variant={role.is_active ? "success" : "destructive"}
              className="text-xs"
            >
              {role.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2">{role.role_name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {role.description || "No description provided"}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role Key</span>
            <code className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
              {role.role_key}
            </code>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Permissions</span>
            <Badge variant="outline">{role.permission_count || 0}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Users</span>
            <Badge variant="outline">{role.user_count || 0}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hierarchy</span>
            <span className="font-medium">Level {role.hierarchy_level}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(role.id)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {!role.is_system && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(role.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(role.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}