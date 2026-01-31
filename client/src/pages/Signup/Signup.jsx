import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import {
  Building,
  Users,
  User,
  Shield,
  Mail,
  Lock,
  Phone,
  MapPin,
  Badge,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import api from "../../api/axios"; // Import axios instance

// Mock data for groups and teams - Using numeric IDs to match database
const mockGroupsData = [
  {
    id: 1, // Changed to number
    name: "Global Manufacturing Corp",
    code: "GMC-2024",
    teams: [
      { id: 1, name: "Production Floor", code: "GMC-PROD" }, // Changed to number
      { id: 2, name: "Quality Control", code: "GMC-QUALITY" },
      { id: 3, name: "Maintenance", code: "GMC-MAINT" },
      { id: 4, name: "Warehouse", code: "GMC-WHSE" },
    ],
  },
  {
    id: 2,
    name: "Tech Solutions Inc",
    code: "TSI-2024",
    teams: [
      { id: 5, name: "Site Operations", code: "TSI-OPS" },
      { id: 6, name: "Safety Department", code: "TSI-SAFETY" },
      { id: 7, name: "Engineering", code: "TSI-ENG" },
    ],
  },
  {
    id: 3,
    name: "Energy & Utilities Ltd",
    code: "EUL-2024",
    teams: [
      { id: 8, name: "Field Operations", code: "EUL-FIELD" },
      { id: 9, name: "Plant Safety", code: "EUL-PLANT" },
      { id: 10, name: "Distribution", code: "EUL-DIST" },
      { id: 11, name: "Maintenance Crew", code: "EUL-MAINT" },
      { id: 12, name: "Emergency Response", code: "EUL-ERT" },
    ],
  },
];

export default function Signup() {
  const [signupType, setSignupType] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    // Common fields
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    position: "",
    employeeId: "",
    workLocation: "",

    // Group/Team fields
    groupId: "",
    teamId: "",
    groupName: "",
    teamName: "",
  });

  const [groups] = useState(mockGroupsData);

  useEffect(() => {
    if (form.groupId) {
      const selectedGroup = groups.find((g) => g.id === form.groupId);
      if (selectedGroup) {
        setAvailableTeams(selectedGroup.teams);
        setForm((prev) => ({ ...prev, teamId: "" }));
      }
    } else {
      setAvailableTeams([]);
    }
  }, [form.groupId, groups]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    // Clear previous errors
    setError("");

    // Basic validations
    if (!form.name.trim()) {
      setError("Full name is required");
      return false;
    }
    
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid work email");
      return false;
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError("Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)");
      return false;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    // Type-specific validations
    if (signupType === "employee") {
      if (!form.groupId) {
        setError("Please select a group");
        return false;
      }
      if (!form.teamId) {
        setError("Please select a team");
        return false;
      }
    }
    
    if (signupType === "team") {
      if (!form.groupId) {
        setError("Please select a group");
        return false;
      }
      if (!form.teamName?.trim()) {
        setError("Please enter team name");
        return false;
      }
    }
    
    if (signupType === "group") {
      if (!form.groupName?.trim()) {
        setError("Please enter group name");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!validateForm()) return;

  setLoading(true);

  try {
    // Prepare data for API
    const payload = {
      signupType,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      mobile: form.mobile.trim(),
      position: form.position.trim(),
      employeeId: form.employeeId.trim(),
      workLocation: form.workLocation.trim(),
      groupId: form.groupId || null,
      teamId: form.teamId || null,
      groupName: form.groupName.trim() || null,
      teamName: form.teamName.trim() || null,
    };

    // Use axios for API call
    const response = await api.post("/auth/register", payload);

    if (response.data.success) {
      setSuccess(true);
    } else {
      setError(response.data.message || "Registration failed");
    }
  } catch (err) {
    // Handle axios errors
    if (err.response) {
      // Server responded with error status
      setError(err.response.data.message || "Registration failed");
    } else if (err.request) {
      // Request was made but no response
      setError("Network error. Please check your connection.");
    } else {
      // Something else happened
      setError(err.message || "An error occurred during registration");
    }
  } finally {
    setLoading(false);
  }
};

  const getSignupTypeLabel = (type) => {
    const labels = {
      group: "Group Admin",
      team: "Team Admin",
      employee: "Employee",
    };
    return labels[type] || type;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    const labels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];
    return { score, label: labels[score] };
  };

  const passwordStrength = getPasswordStrength(form.password);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-900/20 p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="pt-8 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Registration Successful!
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your account has been created and is pending approval.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  You will receive a confirmation email once approved by your administrator.
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {getSignupTypeLabel(signupType)} Account
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {form.name} • {form.email}
                  </p>
                  {form.groupName && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Group: {form.groupName}
                    </p>
                  )}
                  {form.teamName && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Team: {form.teamName}
                    </p>
                  )}
                </div>

                <Button asChild className="w-full">
                  <Link to="/login">Continue to Login</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-300/10 dark:bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Login */}
      <div className="absolute top-6 left-6 z-50">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/login">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-4xl shadow-2xl border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 overflow-hidden">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/30 dark:to-emerald-900/30 flex items-center justify-center border border-sky-200 dark:border-sky-800">
                <img src="/only_logo.png" alt="" className="h-[60%]" />
              </div>
              <Building className="absolute -bottom-2 -right-2 w-8 h-8 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Join ASES Platform
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced Safety and Efficiency Systems
              </p>
            </div>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in duration-300"
            >
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Account Type & Organization */}
            <div className="space-y-8">
              {/* Account Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-600" />
                  Account Type
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {["group", "team", "employee"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSignupType(type)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        signupType === type
                          ? "border-sky-500 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              signupType === type
                                ? "bg-gradient-to-r from-sky-600 to-emerald-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {type === "group" && (
                              <Building className="w-5 h-5" />
                            )}
                            {type === "team" && <Users className="w-5 h-5" />}
                            {type === "employee" && (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {getSignupTypeLabel(type)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {type === "group" && "Create new group"}
                              {type === "team" && "Add team to existing group"}
                              {type === "employee" && "Join existing team"}
                            </p>
                          </div>
                        </div>
                        {signupType === type && (
                          <ChevronRight className="w-5 h-5 text-sky-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  Organization Details
                </h3>

                {/* Group Selection/Input */}
                {signupType !== "group" ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Group</Label>
                    <Select
                      value={form.groupId}
                      onValueChange={(value) =>
                        handleSelectChange("groupId", value)
                      }
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Choose your group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                <Building className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {group.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Code: {group.code}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Group Name</Label>
                    <Input
                      name="groupName"
                      placeholder="Enter your group name"
                      value={form.groupName}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                )}

                {/* Team Selection/Input */}
                {signupType === "employee" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Team</Label>
                    <Select
                      value={form.teamId}
                      onValueChange={(value) =>
                        handleSelectChange("teamId", value)
                      }
                      disabled={!form.groupId}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue
                          placeholder={
                            form.groupId
                              ? "Choose your team"
                              : "Select group first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{team.name}</span>
                                <span className="text-xs text-slate-500">
                                  Code: {team.code}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {signupType === "team" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Team Name</Label>
                    <Input
                      name="teamName"
                      placeholder="Enter your team name"
                      value={form.teamName}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Work Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Mobile & Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-sm font-medium">
                        Mobile Number
                      </Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={form.mobile}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-sm font-medium">
                        Position / Designation
                      </Label>
                      <Input
                        id="position"
                        name="position"
                        placeholder="Safety Officer"
                        value={form.position}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Employee ID & Work Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="employeeId"
                        className="text-sm font-medium"
                      >
                        Employee ID (Optional)
                      </Label>
                      <Input
                        id="employeeId"
                        name="employeeId"
                        placeholder="EMP-001"
                        value={form.employeeId}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="workLocation"
                        className="text-sm font-medium"
                      >
                        Work Location
                      </Label>
                      <Input
                        id="workLocation"
                        name="workLocation"
                        placeholder="Headquarters, Site A, etc."
                        value={form.workLocation}
                        onChange={handleChange}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="space-y-4">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 8 characters with uppercase, lowercase, number & special character"
                          value={form.password}
                          onChange={handleChange}
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Password strength indicator */}
                      {form.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">
                              Password strength: {passwordStrength.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {passwordStrength.score}/5
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                passwordStrength.score <= 2
                                  ? "bg-red-500"
                                  : passwordStrength.score <= 3
                                  ? "bg-yellow-500"
                                  : passwordStrength.score <= 4
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Must contain: uppercase, lowercase, number, special character (@$!%*?&)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium"
                      >
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer disabled:cursor-not-allowed h-12 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 text-white">
                      <Shield className="w-5 h-5" />
                      Create {getSignupTypeLabel(signupType)} Account
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}