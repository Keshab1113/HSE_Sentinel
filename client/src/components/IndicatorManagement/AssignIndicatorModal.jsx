import React, { useState, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import api from "../../api/axios";

export default function AssignIndicatorModal({
  indicator,
  userRole,
  groupId,
  teamId,
  onClose,
  onAssign,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      let endpoint = "/users/";
      
      // Fetch users based on role
      if (userRole === "super_admin") {
        // Can see all users
        endpoint = "/users/all";
      } else if (userRole === "group_admin") {
        // Can see team admins and employees in their group
        endpoint = `/users/?groupId=${groupId}`;
      } else if (userRole === "team_admin") {
        // Can see employees in their team
        endpoint = `/users/?teamId=${teamId}`;
      }

      const response = await api.get(endpoint);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setUsers(data.data || data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }
    onAssign(indicator.id, indicator.type, selectedUsers, dueDate, notes);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-700",
      group_admin: "bg-blue-100 text-blue-700",
      team_admin: "bg-green-100 text-green-700",
      employee: "bg-slate-100 text-slate-700",
    };
    return colors[role] || colors.employee;
  };

  const canAssignToUser = (user) => {
    if (userRole === "super_admin") return true;
    
    if (userRole === "group_admin") {
      return ["team_admin", "employee"].includes(user.role) && user.group_id === groupId;
    }
    
    if (userRole === "team_admin") {
      return user.role === "employee" && user.team_id === teamId;
    }
    
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Assign Indicator</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h3 className="font-semibold mb-1">{indicator.name}</h3>
            <p className="text-sm text-muted-foreground">{indicator.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search Users */}
          <div className="space-y-2">
            <Label>Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User List */}
          <div className="space-y-2">
            <Label>Select Assignees ({selectedUsers.length} selected)</Label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => {
                    const canAssign = canAssignToUser(user);
                    return (
                      <div
                        key={user.id}
                        className={`p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                          !canAssign ? "opacity-50" : ""
                        }`}
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                          disabled={!canAssign}
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-md ${getRoleBadgeColor(
                                  user.role
                                )}`}
                              >
                                {user.role?.replace("_", " ")}
                              </span>
                              {user.team_name && (
                                <span className="text-xs px-2 py-1 rounded-md bg-sky-100 text-sky-700">
                                  {user.team_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any instructions or context for the assignees..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={selectedUsers.length === 0}
            >
              <UserPlus className="w-4 h-4" />
              Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}