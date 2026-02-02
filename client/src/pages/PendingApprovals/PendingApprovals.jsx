import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Building,
  Users,
  AlertCircle,
  User,
  Calendar,
  ChevronRight,
  RefreshCw,
  Shield,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "../../api/axios";

export default function PendingApprovals({ user }) {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [stats, setStats] = useState({
    total: 0,
    employees: 0,
    teamAdmins: 0,
    groupAdmins: 0
  });

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/pending");
      setPendingUsers(response.data.data);
      
      // Calculate stats
      const employees = response.data.data.filter(u => u.role === 'employee').length;
      const teamAdmins = response.data.data.filter(u => u.role === 'team_admin').length;
      const groupAdmins = response.data.data.filter(u => u.role === 'group_admin').length;
      
      setStats({
        total: response.data.data.length,
        employees,
        teamAdmins,
        groupAdmins
      });
      
      showMessage("success", `Loaded ${response.data.data.length} pending approvals`);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      showMessage("error", "Failed to fetch pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/users/${selectedUser.id}/approve`);
      
      showMessage("success", `User ${selectedUser.name} approved successfully`);
      setApproveDialog(false);
      setSelectedUser(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error("Error approving user:", error);
      showMessage("error", error.response?.data?.message || "Failed to approve user");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/users/${selectedUser.id}/reject`, { reason: rejectReason });
      
      showMessage("success", `User ${selectedUser.name} rejected`);
      setRejectDialog(false);
      setSelectedUser(null);
      setRejectReason("");
      fetchPendingApprovals();
    } catch (error) {
      console.error("Error rejecting user:", error);
      showMessage("error", error.response?.data?.message || "Failed to reject user");
    }
  };

  const handleBulkApprove = async (userIds) => {
    try {
      // This would be a bulk API endpoint
      // For now, approve one by one
      for (const userId of userIds) {
        await api.post(`/users/${userId}/approve`);
      }
      
      showMessage("success", `${userIds.length} users approved`);
      fetchPendingApprovals();
    } catch (error) {
      console.error("Error bulk approving:", error);
      showMessage("error", "Failed to approve users");
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const filteredUsers = pendingUsers.filter(u => {
    return searchTerm === "" || 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRoleBadge = (role) => {
    const colors = {
      group_admin: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      team_admin: "bg-green-100 text-green-800 hover:bg-green-100",
      employee: "bg-slate-100 text-slate-800 hover:bg-slate-100"
    };

    const icons = {
      group_admin: <Building className="w-3 h-3 mr-1" />,
      team_admin: <Users className="w-3 h-3 mr-1" />,
      employee: <User className="w-3 h-3 mr-1" />
    };

    return (
      <Badge className={`${colors[role]} capitalize flex items-center gap-1`}>
        {icons[role]}
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge variant="warning" className="capitalize flex items-center gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Review and approve new user registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchPendingApprovals}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {filteredUsers.length > 0 && (
            <Button
              onClick={() => handleBulkApprove(filteredUsers.map(u => u.id))}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Approve All
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Pending</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Employees</p>
                <p className="text-2xl font-bold">{stats.employees}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Team Admins</p>
                <p className="text-2xl font-bold">{stats.teamAdmins}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Group Admins</p>
                <p className="text-2xl font-bold">{stats.groupAdmins}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSearchTerm("")}>
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("employee")}>
                    Employees
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("team_admin")}>
                    Team Admins
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("group_admin")}>
                    Group Admins
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending User Registrations</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} waiting for approval
              </CardDescription>
            </div>
            <Badge variant="warning" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Action Required
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No Pending Approvals
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md text-center">
                        All user registrations have been processed. You're all caught up!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((pendingUser) => (
                  <TableRow key={pendingUser.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {pendingUser.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {pendingUser.email}
                              </span>
                            </div>
                            {pendingUser.mobile && (
                              <>
                                <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {pendingUser.mobile}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {pendingUser.position && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {pendingUser.position}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {pendingUser.group_name ? (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span className="text-sm">{pendingUser.group_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No group assigned</span>
                        )}
                        {pendingUser.team_name && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span className="text-sm">{pendingUser.team_name}</span>
                          </div>
                        )}
                        {pendingUser.work_location && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {pendingUser.work_location}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getRoleBadge(pendingUser.role)}
                        {pendingUser.employee_id && (
                          <div className="text-xs text-slate-500">
                            ID: {pendingUser.employee_id}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{formatDate(pendingUser.created_at)}</div>
                        <div className="text-xs text-slate-500">
                          {formatTime(pendingUser.created_at)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {Math.floor((new Date() - new Date(pendingUser.created_at)) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(pendingUser.status)}
                        <div className="text-xs text-slate-500">
                          Awaiting {user?.role === 'team_admin' ? 'Team' : user?.role === 'group_admin' ? 'Group' : ''} Admin
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedUser(pendingUser);
                            setApproveDialog(true);
                          }}
                          className="gap-1 bg-green-600 hover:bg-green-700 dark:text-white"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(pendingUser);
                            setRejectDialog(true);
                          }}
                          className="gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Navigate to user details or team
                            if (pendingUser.team_id) {
                              navigate(`/teams/${pendingUser.team_id}/users`);
                            }
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approve All</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Approve all pending users at once
            </p>
            <Button 
              onClick={() => handleBulkApprove(filteredUsers.map(u => u.id))}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:text-white"
              disabled={filteredUsers.length === 0}
            >
              <CheckCircle className="w-4 h-4" />
              Approve All ({filteredUsers.length})
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">View Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Manage groups and teams
            </p>
            <Button 
              onClick={() => navigate("/groups")}
              className="w-full gap-2"
              variant="outline"
            >
              <Building className="w-4 h-4" />
              Go to Groups
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              View all users and manage permissions
            </p>
            <Button 
              onClick={() => navigate("/users")}
              className="w-full gap-2"
              variant="outline"
            >
              <Users className="w-4 h-4" />
              All Users
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this user?
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500">Organization</p>
                    <p className="font-medium">
                      {selectedUser.group_name || "No group"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500">Team</p>
                    <p className="font-medium">
                      {selectedUser.team_name || "No team"}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        This user will gain access to:
                      </p>
                      <ul className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 space-y-1">
                        <li>• System dashboard and features</li>
                        <li>• Team/group-specific tools</li>
                        <li>• Communication channels</li>
                        <li>• Role-based permissions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 gap-2">
              <CheckCircle className="w-4 h-4" />
              Approve User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a clear reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  This reason will be shared with the user via email.
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Important: Rejection cannot be undone
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      The user will need to register again if they wish to re-apply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              disabled={!rejectReason.trim()}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}