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

// Import the new pages I created
import Analytics from "./pages/Analytics/Analytics";
import IncidentReport from "./pages/Incidents/IncidentReport";
import IndicatorsManagement from "./pages/Indicators/IndicatorsManagement";
import AlertsDashboard from "./pages/Alerts/AlertsDashboard";
import DummyDashboard from "./pages/Dummy/Dashboard";
import DummyGroups from "./pages/Dummy/Groups";
import DummyTeams from "./pages/Dummy/Teams";
import DummyUsers from "./pages/Dummy/Users";
import DummyIncidents from "./pages/Dummy/Incidents";
import DummyIncidentDetail from "./pages/Dummy/IncidentDetail";
import DummyTasks from "./pages/Dummy/Tasks";
import DummyTraining from "./pages/Dummy/Training";
import DummyInspections from "./pages/Dummy/Inspections";
import DummyJSA from "./pages/Dummy/JSA";
import DummyEquipment from "./pages/Dummy/Equipment";
import DummyVehicles from "./pages/Dummy/Vehicles";
import DummyWorkersComp from "./pages/Dummy/WorkersComp";
import DummyAnalytics from "./pages/Dummy/Analytics";
import SharedIndicatorResult from "./pages/Indicators/SharedIndicatorResult";
import SystemAdministration from "./pages/SystemAdmin/SystemAdministration/SystemAdministration";
import CreateRolePage from "./pages/SystemAdmin/SystemAdministration/CreateRoleModal";
import CreatePermissionPage from "./pages/SystemAdmin/SystemAdministration/CreatePermissionsModal";

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
          group_name: payload.group_name,
          team_name: payload.team_name,
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
          <Route
            path="user-dashboard"
            element={<AdminDashboard user={user} />}
          />
          <Route
            path="alert-dashboard"
            element={<AlertsDashboard user={user} />}
          />
          <Route path="users" element={<UserManagement user={user} />} />
          <Route
            path="pending-approvals"
            element={<PendingApprovals user={user} />}
          />
          <Route
            path="analytics-dashboard"
            element={<Analytics user={user} />}
          />
          <Route
            path="indicators-dashboard"
            element={<IndicatorsManagement user={user} />}
          />
        </Route>

        <Route element={<ProtectedRoute user={user} />}>
          <Route
            path="/dummy"
            element={<AppShell user={user} onLogout={handleLogout} />}
          >
            <Route
              index
              path="dashboard"
              element={<DummyDashboard user={user} />}
            />
            <Route path="groups" element={<DummyGroups />} />
            <Route path="teams" element={<DummyTeams />} />
            <Route path="users" element={<DummyUsers />} />
            <Route path="incidents" element={<DummyIncidents />} />
            <Route path="incidents/:id" element={<DummyIncidentDetail />} />
            <Route path="tasks" element={<DummyTasks />} />
            <Route path="training" element={<DummyTraining />} />
            <Route path="inspections" element={<DummyInspections />} />
            <Route path="jsa" element={<DummyJSA />} />
            <Route path="equipment" element={<DummyEquipment />} />
            <Route path="vehicles" element={<DummyVehicles />} />
            <Route path="workers-comp" element={<DummyWorkersComp />} />
            <Route path="analytics" element={<DummyAnalytics />} />
          </Route>
        </Route>

        <Route
          path="/shared-indicator/:shareToken"
          element={<SharedIndicatorResult />}
        />
        <Route
          path="/system-admin"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <SystemAdministration user={user} />
            </AppShell>
          }
        />
        <Route
          path="/system-admin/create-role"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <CreateRolePage user={user} />
            </AppShell>
          }
        />
        <Route
          path="/system-admin/create-permission"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <CreatePermissionPage user={user} />
            </AppShell>
          }
        />
        {/* Incident Report route */}
        <Route
          path="/incidents/report"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <IncidentReport user={user} />
            </AppShell>
          }
        />

        {/* Other existing routes */}
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

        {/* Additional routes from sidebar */}
        <Route
          path="/trainings"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">My Trainings</h1>
                <p className="text-muted-foreground">
                  Training management page
                </p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/calendar"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Calendar</h1>
                <p className="text-muted-foreground">Safety events calendar</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/messages"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Messages</h1>
                <p className="text-muted-foreground">Safety communications</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/incidents"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Incidents</h1>
                <p className="text-muted-foreground">Incident management</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/inspections"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Inspections</h1>
                <p className="text-muted-foreground">Safety inspections</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/risk-assessment"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Risk Assessment</h1>
                <p className="text-muted-foreground">Risk assessment tools</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/equipment"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Equipment</h1>
                <p className="text-muted-foreground">Equipment management</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/meetings"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Safety Meetings</h1>
                <p className="text-muted-foreground">Meeting management</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/reports"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Safety reports</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/compliance"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Compliance</h1>
                <p className="text-muted-foreground">Compliance tracking</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/audits"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Audits</h1>
                <p className="text-muted-foreground">Safety audits</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/training-management"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Training Management</h1>
                <p className="text-muted-foreground">Training administration</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/assets"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Equipment & Assets</h1>
                <p className="text-muted-foreground">Asset management</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/reports-analytics"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">Advanced analytics</p>
              </div>
            </AppShell>
          }
        />
        
        <Route
          path="/audit-logs"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Audit & Logs</h1>
                <p className="text-muted-foreground">System logs</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/system-health"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">System Health</h1>
                <p className="text-muted-foreground">System monitoring</p>
              </div>
            </AppShell>
          }
        />
        <Route
          path="/team-admins"
          element={
            <AppShell user={user} onLogout={handleLogout}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Team Admins</h1>
                <p className="text-muted-foreground">Team admin management</p>
              </div>
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
