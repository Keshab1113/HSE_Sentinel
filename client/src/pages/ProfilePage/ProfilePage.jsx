import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Bell,
  Globe,
  Award,
  Activity,
  FileText,
  Download,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  CheckCircle,
  Edit2,
  Save,
  X,
  Camera,
  Briefcase,
  Building,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "../../api/axios";

export default function ProfilePage({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    position: "",
    work_location: "",
    bio: "",
    timezone: "UTC",
    language: "en",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true,
    teamUpdates: false,
    systemMaintenance: true,
  });

  const [activityLogs, setActivityLogs] = useState([]);
  const [safetyMetrics, setSafetyMetrics] = useState([]);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      console.log("initialUser: ", initialUser);

      setFormData({
        name: initialUser.name || "",
        email: initialUser.email || "",
        mobile: initialUser.mobile || "",
        position: initialUser.position || "",
        work_location: initialUser.work_location || "",
        bio: initialUser.bio || "",
        timezone: initialUser.timezone || "UTC",
        language: initialUser.language || "en",
      });

      if (initialUser.id) {
        fetchUserActivity();
        fetchSafetyMetrics();
      }
    }
  }, [initialUser]);

  const fetchUserActivity = async () => {
    try {
      const response = await api.get("/users/activity/data");
      setActivityLogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      // Set default activity logs
      setActivityLogs([
        {
          id: 1,
          action: "Login",
          description: "Logged in to ASES platform",
          timestamp: "2 hours ago",
          ip: "192.168.1.100",
        },
        {
          id: 2,
          action: "Profile Update",
          description: "Updated profile information",
          timestamp: "1 day ago",
          ip: "192.168.1.100",
        },
        {
          id: 3,
          action: "Dashboard Access",
          description: "Accessed safety dashboard",
          timestamp: "2 days ago",
          ip: "192.168.1.101",
        },
      ]);
    }
  };

  const fetchSafetyMetrics = async () => {
    try {
      const response = await api.get(`/users/${user?.id}/metrics`);
      setSafetyMetrics(response.data.data || []);
    } catch (error) {
      console.error("Error fetching safety metrics:", error);
      // Set default safety metrics
      setSafetyMetrics([
        { label: "Safety Score", value: 87, target: 90, trend: "up" },
        { label: "Training Completion", value: 92, target: 95, trend: "up" },
        { label: "Incidents Reported", value: 5, target: 3, trend: "down" },
        { label: "Compliance Rate", value: 94, target: 95, trend: "up" },
      ]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.put(`/users/${user.id}`, formData);

      if (response.data.success) {
        // Update with full user data from response
        setUser((prev) => ({ ...prev, ...response.data.data }));
        setIsEditing(false);
        showMessage("success", "Profile updated successfully");

        // Refresh form data with updated values
        setFormData({
          name: response.data.data.name || "",
          email: response.data.data.email || "",
          mobile: response.data.data.mobile || "",
          position: response.data.data.position || "",
          work_location: response.data.data.work_location || "",
          bio: response.data.data.bio || "",
          timezone: response.data.data.timezone || "UTC",
          language: response.data.data.language || "en",
        });
      } else {
        showMessage(
          "error",
          response.data.message || "Failed to update profile",
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile";
      showMessage("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      position: user.position || "",
      work_location: user.work_location || "",
      bio: user.bio || "",
      timezone: user.timezone || "UTC",
      language: user.language || "en",
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        showMessage("success", "Password changed successfully");
        form.reset();
      } else {
        showMessage(
          "error",
          response.data.message || "Failed to change password",
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role) => {
    const roles = {
      employee: {
        label: "Employee",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      team_admin: {
        label: "Team Admin",
        color:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      },
      group_admin: {
        label: "Group Admin",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
      super_admin: {
        label: "Super Admin",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
    };

    const roleInfo = roles[role] || roles.employee;
    return (
      <Badge className={`${roleInfo.color} font-medium`}>
        {roleInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getOrganizationInfo = () => {
    const parts = [];
    if (user.group_name) parts.push(user.group_name);
    if (user.team_name) parts.push(user.team_name);
    return parts.join(" • ") || "No organization assigned";
  };

  // Add this useEffect to fetch complete user details if initialUser is incomplete
  useEffect(() => {
    const fetchFullUserDetails = async () => {
      if (initialUser && initialUser.id) {
        try {
          setLoading(true);
          const response = await api.get(`/users/${initialUser.id}`);
          if (response.data.success) {
            const fullUser = response.data.data;
            setUser(fullUser);

            setFormData({
              name: fullUser.name || "",
              email: fullUser.email || "",
              mobile: fullUser.mobile || "",
              position: fullUser.position || "",
              work_location: fullUser.work_location || "",
              bio: fullUser.bio || "",
              timezone: fullUser.timezone || "UTC",
              language: fullUser.language || "en",
            });

            // Fetch additional data
            fetchUserActivity();
            fetchSafetyMetrics();
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          // Fall back to initialUser
          setUser(initialUser);
          setFormData({
            name: initialUser.name || "",
            email: initialUser.email || "",
            mobile: initialUser.mobile || "",
            position: initialUser.position || "",
            work_location: initialUser.work_location || "",
            bio: initialUser.bio || "",
            timezone: initialUser.timezone || "UTC",
            language: initialUser.language || "en",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFullUserDetails();
  }, [initialUser?.id]); // Only run when user.id changes

  console.log("formData: ", formData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="mt-2 text-sm text-slate-500">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg mb-6 ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-0 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-lg">
                  <AvatarImage src={user.profile_image} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-md">
                    <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="text-3xl font-bold h-auto p-0 border-0"
                      />
                    ) : (
                      user.name
                    )}
                  </h1>
                  {getRoleBadge(user.role)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {isEditing ? (
                    <Input
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="Position"
                      className="border-0 p-0 h-auto"
                    />
                  ) : (
                    user.position || "No position specified"
                  )}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {getOrganizationInfo()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
                {!user.is_approved && (
                  <Badge variant="warning" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Approval
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="gap-2"
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="gap-2 bg-gradient-to-r from-sky-600 to-emerald-600 text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-600" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Email</p>
                      {isEditing ? (
                        <Input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="h-8"
                        />
                      ) : (
                        <p className="font-medium truncate">{user.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Phone</p>
                      {isEditing ? (
                        <Input
                          value={formData.mobile}
                          onChange={(e) =>
                            setFormData({ ...formData, mobile: e.target.value })
                          }
                          className="h-8"
                        />
                      ) : (
                        <p className="font-medium">
                          {user.mobile || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Work Location</p>
                      {isEditing ? (
                        <Input
                          value={formData.work_location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              work_location: e.target.value,
                            })
                          }
                          className="h-8"
                        />
                      ) : (
                        <p className="font-medium">
                          {user.work_location || "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Employee ID</p>
                      <p className="font-medium">
                        {user.employee_id || "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Status */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-500" />
                    Account Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Status</span>
                      <Badge variant={user.is_approved ? "success" : "warning"}>
                        {user.is_approved ? "Active" : "Pending Approval"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Last Login</span>
                      <span className="text-sm">
                        {user.last_login
                          ? formatDate(user.last_login)
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Account Created
                      </span>
                      <span className="text-sm">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Performance - Only for approved users */}
            {user.is_approved && safetyMetrics.length > 0 && (
              <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Safety Performance
                  </CardTitle>
                  <CardDescription>
                    Your personal safety metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {safetyMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {metric.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {metric.value}
                            {metric.label.includes("Score") ||
                            metric.label.includes("Completion") ||
                            metric.label.includes("Rate")
                              ? "%"
                              : ""}
                          </span>
                          {metric.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={metric.value} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Current</span>
                          <span>
                            Target: {metric.target}
                            {metric.label.includes("Score") ||
                            metric.label.includes("Completion") ||
                            metric.label.includes("Rate")
                              ? "%"
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Detailed Analytics
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Security Status */}
            <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-sky-200 dark:border-sky-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sky-600" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Verified</span>
                    <Badge
                      variant={user.is_approved ? "success" : "warning"}
                      className="gap-1"
                    >
                      {user.is_approved ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {user.is_approved ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Authentication</span>
                    <Badge variant="outline">Not Set</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Password Change</span>
                    <span className="text-sm text-slate-500">
                      Not available
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Key className="w-4 h-4" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-4 w-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <TabsTrigger value="personal" className="gap-2">
                  <User className="w-4 h-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Personal Tab */}
              <TabsContent value="personal" className="space-y-6">
                <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bio">About Me</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
                          {user.bio || "No bio provided"}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        {isEditing ? (
                          <Select
                            value={formData.timezone}
                            onValueChange={(value) =>
                              setFormData({ ...formData, timezone: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="EST">
                                Eastern Time (EST)
                              </SelectItem>
                              <SelectItem value="CST">
                                Central Time (CST)
                              </SelectItem>
                              <SelectItem value="PST">
                                Pacific Time (PST)
                              </SelectItem>
                              <SelectItem value="GMT">GMT</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 border rounded-md">
                            {user.timezone || "UTC"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Language</Label>
                        {isEditing ? (
                          <Select
                            value={formData.language}
                            onValueChange={(value) =>
                              setFormData({ ...formData, language: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 border rounded-md">
                            {formData.language === "en"
                              ? "English"
                              : formData.language === "es"
                                ? "Español"
                                : formData.language === "fr"
                                  ? "Français"
                                  : "English"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* For pending approval users */}
                    {!user.is_approved && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your profile is pending approval. Some features may be
                          limited until an administrator approves your account.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-600" />
                      Account Security
                    </CardTitle>
                    <CardDescription>
                      Manage your password and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Change Password
                      </h4>
                      <form
                        onSubmit={handlePasswordChange}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            required
                            minLength={8}
                          />
                          <p className="text-xs text-slate-500">
                            Password must be at least 8 characters with
                            uppercase, lowercase, number, and special character
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </form>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Two-Factor Authentication
                      </h4>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                        <div className="space-y-1">
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-slate-500">
                            Use Google Authenticator or similar app
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Not Set
                        </Badge>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Key className="w-4 h-4" />
                        Setup 2FA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-600" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Email Notifications</h4>
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <p className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-sm text-slate-500">
                                {key === "emailAlerts" &&
                                  "Receive immediate email alerts for safety incidents"}
                                {key === "pushNotifications" &&
                                  "Push notifications for urgent matters"}
                                {key === "weeklyReports" &&
                                  "Weekly safety performance reports"}
                                {key === "securityAlerts" &&
                                  "Security and login alerts"}
                                {key === "teamUpdates" &&
                                  "Team activity and updates"}
                                {key === "systemMaintenance" &&
                                  "System maintenance notifications"}
                              </p>
                            </div>
                            <Switch
                              checked={value}
                              onCheckedChange={() =>
                                handleNotificationChange(key)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Notification Schedule</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Quiet Hours Start</Label>
                          <Select defaultValue="21:00">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20:00">8:00 PM</SelectItem>
                              <SelectItem value="21:00">9:00 PM</SelectItem>
                              <SelectItem value="22:00">10:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quiet Hours End</Label>
                          <Select defaultValue="07:00">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="06:00">6:00 AM</SelectItem>
                              <SelectItem value="07:00">7:00 AM</SelectItem>
                              <SelectItem value="08:00">8:00 AM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Your account activity and access logs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLogs.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-slate-500">
                            No activity logs available
                          </p>
                        </div>
                      ) : (
                        activityLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{log.action}</p>
                                <span className="text-sm text-slate-500">
                                  {log.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {log.description}
                              </p>
                              {log.ip && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>IP: {log.ip}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full">
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Activity Logs
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <FileText className="w-4 h-4" />
                        View Full History
                      </Button>
                    </div>
                    <div className="text-center text-sm text-slate-500 w-full">
                      Activity logs are retained for 90 days for security
                      purposes
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
