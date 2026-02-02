import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  ClipboardList,
  Shield,
  Truck,
  Wrench,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Bell,
  TrendingUp,
  BarChart3,
  Activity,
  HardHat,
  FileCheck,
  Calendar,
  MessageSquare,
  Award,
  Target,
  Zap,
  BookOpen,
  Briefcase,
  Home,
  AlertCircle,
  FileWarning,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  PieChart,
  Building,
  UserPlus,
  Users2,
  CheckCircle,
  Clock,
  Eye,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";

const navConfig = {
  employee: [
    {
      label: "Home",
      icon: Home,
      path: "/app",
      exact: true,
      badge: null,
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      badge: null,
    },
    {
      label: "My Tasks",
      icon: CheckSquare,
      path: "/app/tasks",
      badge: "3",
    },
    {
      label: "Report Incident",
      icon: AlertTriangle,
      path: "/incidents/report",
      badge: null,
    },
    {
      label: "My Trainings",
      icon: BookOpen,
      path: "/trainings",
      badge: "2",
    },
    {
      label: "Safety Alerts",
      icon: Bell,
      path: "/alerts",
      badge: "2",
    },
    {
      label: "Calendar",
      icon: Calendar,
      path: "/calendar",
      badge: null,
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/messages",
      badge: "5",
    },
  ],

  team_admin: [
    {
      label: "Home",
      icon: Home,
      path: "/app",
      exact: true,
      badge: null,
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      badge: null,
    },
    {
      label: "Incidents",
      icon: AlertTriangle,
      path: "/incidents",
      badge: "4",
    },
    {
      label: "Tasks",
      icon: CheckSquare,
      path: "/app/tasks",
      badge: "8",
    },
    {
      label: "Team Users",
      icon: Users,
      path: "#",
      badge: null,
      subItems: [
        {
          label: "Manage Users",
          icon: Users2,
          path: "/teams/:teamId/users",
          badge: "pending",
        },
        {
          label: "Pending Approvals",
          icon: Clock,
          path: "/pending-approvals",
          badge: "3",
        },
      ],
    },
    {
      label: "Inspections",
      icon: ClipboardList,
      path: "/inspections",
      badge: "3",
    },
    {
      label: "Risk Assessment",
      icon: Shield,
      path: "/risk-assessment",
      badge: null,
    },
    {
      label: "Equipment",
      icon: Wrench,
      path: "/equipment",
      badge: "2",
    },
    {
      label: "Safety Meetings",
      icon: Users,
      path: "/meetings",
      badge: null,
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/reports",
      badge: null,
    },
  ],

  group_admin: [
    {
      label: "Home",
      icon: Home,
      path: "/app",
      exact: true,
      badge: null,
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      badge: null,
    },
    {
      label: "Executive Summary",
      icon: BarChart3,
      path: "/app/executive",
      badge: null,
    },
    {
      label: "Groups & Teams",
      icon: Building,
      path: "#",
      badge: null,
      subItems: [
        {
          label: "My Group",
          icon: Building,
          path: "/groups",
          badge: "active",
        },
        {
          label: "Group Teams",
          icon: Users2,
          path: "/groups/:groupId/teams",
          badge: "manage",
        },
      ],
    },
    {
      label: "User Management",
      icon: UsersIcon,
      path: "#",
      badge: "pending",
      subItems: [
        {
          label: "All Users",
          icon: Users,
          path: "/users",
          badge: null,
        },
        {
          label: "Pending Approvals",
          icon: Clock,
          path: "/pending-approvals",
          badge: "5",
        },
        {
          label: "Team Admins",
          icon: UserPlus,
          path: "/team-admins",
          badge: null,
        },
      ],
    },
    {
      label: "Compliance",
      icon: ShieldIcon,
      path: "/compliance",
      badge: "94%",
    },
    {
      label: "Audits",
      icon: FileCheck,
      path: "/audits",
      badge: "2",
    },
    {
      label: "Training Management",
      icon: Users,
      path: "/training-management",
      badge: "12",
    },
    {
      label: "Equipment & Assets",
      icon: Wrench,
      path: "/assets",
      badge: null,
    },
    {
      label: "Reports & Analytics",
      icon: PieChart,
      path: "/reports-analytics",
      badge: null,
    },
  ],

  super_admin: [
    {
      label: "Home",
      icon: Home,
      path: "/app",
      exact: true,
      badge: null,
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      badge: null,
    },
    {
      label: "Executive Overview",
      icon: Target,
      path: "/app/executive",
      badge: null,
    },
    {
      label: "Admin Dashboard",
      icon: Activity,
      path: "/app/admin",
      badge: null,
    },
    {
      label: "Organization Management",
      icon: Building,
      path: "#",
      badge: null,
      subItems: [
        {
          label: "All Groups",
          icon: Building,
          path: "/groups",
          badge: "manage",
        },
        {
          label: "All Teams",
          icon: Users2,
          path: "/app/teams",
          badge: "view",
        },
      ],
    },
    {
      label: "User Management",
      icon: UsersIcon,
      path: "#",
      badge: "",
      subItems: [
        {
          label: "All Users",
          icon: Users,
          path: "/users",
          badge: null,
        },
        {
          label: "Pending Approvals",
          icon: Clock,
          path: "/pending-approvals",
          badge: "",
        },
      ],
    },
    {
      label: "System Administration",
      icon: Settings,
      path: "/system-admin",
      badge: null,
    },
    {
      label: "Audit & Logs",
      icon: FileText,
      path: "/audit-logs",
      badge: "127",
    },
    {
      label: "System Health",
      icon: Activity,
      path: "/system-health",
      badge: "100%",
    },
  ],
};

export default function Sidebar({
  role = "employee",
  user,
  onLogout,
  onClose,
  notificationCount = 0,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const items = navConfig[role] || [];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleItemClick = (item) => {
    if (item.subItems) {
      setExpandedItems((prev) => ({
        ...prev,
        [item.label]: !prev[item.label],
      }));
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Close all expanded items when collapsing
    if (!collapsed) {
      setExpandedItems({});
    }
  };

  // Get role display name
  const getRoleDisplayName = () => {
    const roleNames = {
      employee: "Employee",
      team_admin: "Team Administrator",
      group_admin: "Group Administrator",
      super_admin: "System Administrator",
    };
    return roleNames[role] || role.replace("_", " ").toUpperCase();
  };

  // Get role color
  const getRoleColor = () => {
    const colors = {
      employee: "from-blue-500 to-cyan-500",
      team_admin: "from-emerald-500 to-green-500",
      group_admin: "from-purple-500 to-pink-500",
      super_admin: "from-amber-500 to-orange-500",
    };
    return colors[role] || "from-slate-500 to-slate-700";
  };

  // Get user's group/team info
  const getUserOrganizationInfo = () => {
    if (!user) return null;

    let info = [];
    if (user.group_name) {
      info.push(user.group_name);
    }
    if (user.team_name) {
      info.push(user.team_name);
    }
    return info.join(" • ");
  };

  // Check if path is active
  const isActive = (path, exact = false) => {
    if (path === "#") return false;

    // Replace dynamic parameters
    const normalizedPath = path
      .replace("/:groupId", `/${user?.group_id || ""}`)
      .replace("/:teamId", `/${user?.team_id || ""}`);

    if (exact) {
      return location.pathname === normalizedPath;
    }
    return location.pathname.startsWith(
      normalizedPath.split("/:")[0] || normalizedPath,
    );
  };

  return (
    <>
      <aside
        className={`
        ${collapsed ? "w-16" : "w-64"} 
        bg-gradient-to-b from-white to-slate-50 
        dark:from-slate-900 dark:to-slate-800 
        border-r border-slate-200 dark:border-slate-700
        flex flex-col transition-all duration-300 ease-in-out
        h-screen sticky top-0 overflow-hidden
        shadow-lg z-40
      `}
      >
        {/* Header */}
        <div
          className={`px-4 py-4 border-b border-slate-200 dark:border-slate-700 ${collapsed ? "px-3" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}
            >
              <div className="relative">
                <div
                  className={`${collapsed ? "w-10 h-10" : "w-10 h-10"} rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/30 dark:to-emerald-900/30 flex items-center justify-center transition-all`}
                >
                  <img
                    src="/only_logo.png"
                    alt="ASES Logo"
                    className={collapsed ? "w-8 h-8" : "w-8 h-8"}
                  />
                </div>
                
              </div>

              {!collapsed && (
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                    ASES
                  </h1>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRoleColor()}`}
                    ></div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {getRoleDisplayName()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Collapse button - Always visible */}
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${collapsed ? "hidden" : ""}`}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile */}
        {!collapsed && user && (
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border border-slate-200 dark:border-slate-700">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900 dark:to-emerald-900 flex items-center justify-center">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${user.is_approved ? "bg-emerald-500" : "bg-yellow-500"}`}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
                {getUserOrganizationInfo() && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1">
                    {getUserOrganizationInfo()}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.role === "super_admin"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : user.role === "group_admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : user.role === "team_admin"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {getRoleDisplayName()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {items.map((item, idx) => (
            <div key={idx}>
              <NavItem
                item={item}
                collapsed={collapsed}
                active={isActive(item.path, item.exact)}
                onClick={() => handleItemClick(item)}
                expanded={expandedItems[item.label]}
              />
              {!collapsed && item.subItems && expandedItems[item.label] && (
                <div className="ml-8 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-1 mt-1">
                  {item.subItems.map((subItem, subIdx) => (
                    <NavItem
                      key={subIdx}
                      item={subItem}
                      collapsed={collapsed}
                      active={isActive(subItem.path)}
                      isSubItem={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Safety Status for non-employee roles */}
        {!collapsed && role !== "employee" && (
          <div className="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/20 dark:to-sky-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <HardHat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Safety Overview
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {role === "super_admin"
                    ? "Total Groups"
                    : role === "group_admin"
                      ? "Active Teams"
                      : "Team Members"}
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {role === "super_admin"
                    ? "12"
                    : role === "group_admin"
                      ? "8"
                      : "24"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {role === "super_admin"
                    ? "Pending Approvals"
                    : role === "group_admin"
                      ? "Pending Users"
                      : "Active Users"}
                </span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                  {role === "super_admin"
                    ? "7"
                    : role === "group_admin"
                      ? "5"
                      : "22"}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                  style={{ width: role === "team_admin" ? "92%" : "94%" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={`p-1.5 py-4 border-t flex justify-center items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${collapsed ? "" : " hidden"}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          )}
        </button>
        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-3">
          {!collapsed ? (
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                text-sm font-medium text-slate-700 dark:text-slate-300 
                hover:bg-red-50 dark:hover:bg-red-900/20 
                hover:text-red-600 dark:hover:text-red-400 
                transition-all duration-200
                border border-slate-200 dark:border-slate-700
                hover:border-red-200 dark:hover:border-red-800
              `}
            >
              <LogOut className="w-4 h-4" />
              Logout
              <span className="ml-auto text-xs text-slate-400">⌘Q</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className={`
                w-full p-2.5 rounded-lg
                text-slate-600 dark:text-slate-400 
                hover:bg-red-50 dark:hover:bg-red-900/20 
                hover:text-red-600 dark:hover:text-red-400 
                transition-colors
                flex items-center justify-center
              `}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {onClose && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

function NavItem({
  item,
  collapsed,
  active,
  onClick,
  expanded,
  isSubItem = false,
}) {
  const { icon: Icon, label, path, badge, subItems } = item;

  const handleClick = (e) => {
    if (subItems) {
      e.preventDefault();
      onClick?.();
    }
  };

  // Get the actual path for navigation
  const getActualPath = () => {
    if (path.includes(":teamId") || path.includes(":groupId")) {
      // Return a placeholder, the actual navigation should be handled by the component
      return "#";
    }
    return path;
  };

  const content = (
    <div
      onClick={handleClick}
      className={`
        group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
        text-sm transition-all duration-200 relative
        ${
          active && !isSubItem
            ? "bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-semibold shadow-sm"
            : isSubItem && active
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }
        ${collapsed ? "justify-center px-2" : ""}
        ${isSubItem ? "py-2 text-xs" : ""}
        select-none cursor-pointer
      `}
    >
      <div className={`relative ${collapsed ? "" : ""}`}>
        <Icon
          className={`${isSubItem ? "w-4 h-4" : "w-5 h-5"} ${
            active
              ? "text-sky-600 dark:text-sky-400"
              : "text-slate-500 group-hover:text-sky-500"
          }`}
        />
        {active && !collapsed && !isSubItem && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {!collapsed && <span className="flex-1 truncate">{label}</span>}

      {/* Badge */}
      {badge && !collapsed && (
        <span
          className={`
          px-1.5 py-0.5 rounded-md text-xs font-medium min-w-[20px] text-center flex-shrink-0
          ${
            active
              ? badge === "pending" || badge === "new"
                ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                : "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300"
              : badge === "pending" || badge === "new"
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }
        `}
        >
          {badge}
        </span>
      )}

      {badge && collapsed && !isSubItem && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      )}

      {/* SubItems arrow */}
      {subItems && !collapsed && (
        <ChevronRight
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      )}

      {/* Active indicator for collapsed state */}
      {active && collapsed && !isSubItem && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"></div>
      )}

      {/* Hover tooltip for collapsed state */}
      {collapsed && !isSubItem && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {label}
          {badge && <span className="ml-1 text-red-300">({badge})</span>}
        </div>
      )}
    </div>
  );

  // If it's a sub-item with dynamic parameters, we need to handle navigation differently
  if (isSubItem || !subItems) {
    if (path.includes(":teamId") || path.includes(":groupId")) {
      // These should be handled by the parent component
      return <div className="block">{content}</div>;
    }

    return (
      <Link to={path} className="block">
        {content}
      </Link>
    );
  }

  // If it has sub-items, make it a button
  return content;
}

// Add custom scrollbar styles
const styles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #475569;
  }
  
  .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
  
  /* Prevent content overflow */
  aside {
    overflow: hidden !important;
  }
  
  nav {
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  /* Smooth transitions */
  * {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
`;

// Add styles to document head
if (typeof document !== "undefined") {
  // Remove existing style if present
  const existingStyle = document.getElementById("sidebar-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleSheet = document.createElement("style");
  styleSheet.id = "sidebar-styles";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
