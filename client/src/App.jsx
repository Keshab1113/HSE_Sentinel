import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import AppShell from "./layout/AppShell";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Landing from "./pages/Landing/Landing";
import ExecutiveSummary from "./pages/ExecutiveSummary/ExecutiveSummary";
import Tasks from "./pages/Tasks/Tasks";
import Signup from "./pages/Signup/Signup";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import Groups from "./pages/Groups/Groups";
import Teams from "./pages/Teams/Teams";
import Users from "./pages/Users/Users";
import AdminDashboard from "./pages/UserManagementAdminDashboard/UserManagementAdminDashboard";
import TeamManagement from "./pages/Teams/TeamManagement";
import UserManagement from "./pages/UserManagement/UserManagement";
import PendingApprovals from "./pages/PendingApprovals/PendingApprovals";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      // For demo, decode token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          group_id: payload.group_id,
          team_id: payload.team_id,
          is_approved: payload.is_approved,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Landing />} />

      {/* ---------- PROTECTED ROUTES ---------- */}
      <Route element={<ProtectedRoute user={user} />}>
        {/* All app routes */}
        <Route
          path="/app"
          element={<AppShell user={user} onLogout={handleLogout} />}
        >
          <Route index element={<Home user={user} />} />
          <Route path="dashboard" element={<Dashboard user={user} />} />
          <Route path="executive" element={<ExecutiveSummary user={user} />} />
          <Route path="tasks" element={<Tasks user={user} />} />
          <Route path="profile" element={<ProfilePage user={user} />} />
          <Route path="admin" element={<AdminDashboard user={user} />} />
          <Route path="users" element={<UserManagement user={user} />} />
          <Route
            path="pending-approvals"
            element={<PendingApprovals user={user} />}
          />
        </Route>

        <Route
          path="/pending-approvals"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <PendingApprovals user={user} />
            </AppShell>
          }
        />
        <Route
          path="/groups"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <Groups user={user} />
            </AppShell>
          }
        />
        
        <Route
          path="/users"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <UserManagement user={user} />
            </AppShell>
          }
        />
        
        <Route
          path="/groups/:groupId/teams"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <TeamManagement user={user} />
            </AppShell>
          }
        />
        <Route
          path="/teams/:teamId/users"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <Users user={user} />
            </AppShell>
          }
        />
      </Route>

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
