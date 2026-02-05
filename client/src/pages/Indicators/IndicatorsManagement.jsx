import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Upload,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Plus,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Share2,
  Clock,
  Target,
  Activity,
} from "lucide-react";
import api from "../../api/axios";
import CreateIndicatorModal from "../../components/IndicatorManagement/CreateIndicatorModal";
import AssignIndicatorModal from "../../components/IndicatorManagement/AssignIndicatorModal";
import IndicatorDetailsModal from "../../components/IndicatorManagement/IndicatorDetailsModal";
import AssignedIndicatorsList from "./AssignedIndicatorsList";
import PermissionChecker from "../../components/SystemAdministration/PermissionChecker"
import SafetyDashboard from "../../components/IndicatorManagement/SafetyDashboard";
import ComplianceTracker from "../../components/Compliance/ComplianceTracker";
import ReportGenerator from "../../components/Reporting/ReportGenerator";

export default function IndicatorsManagement({ user }) {
  const [indicators, setIndicators] = useState({ leading: [], lagging: [] });
  const [assignedIndicators, setAssignedIndicators] = useState({
    leading: [],
    lagging: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const canCreateIndicator = [
    "super_admin",
    "group_admin",
    "team_admin",
  ].includes(user.role);
  const canAssignIndicator = [
    "super_admin",
    "group_admin",
    "team_admin",
  ].includes(user.role);

  useEffect(() => {
    fetchIndicators();
    if (user.role === "employee") {
      fetchAssignedIndicators();
    }
  }, []);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const response = await api.get("/indicators/");

      console.log("RAW AXIOS RESPONSE:", response);

      if (response.status === 200 && response.data?.success) {
        const indicatorsData = response.data.data;

        setIndicators({
          leading: indicatorsData.leading || [],
          lagging: indicatorsData.lagging || [],
        });
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedIndicators = async () => {
    try {
      const response = await api.get("/indicators/assigned/me");

      if (response.status === 200 && response.data?.success) {
        setAssignedIndicators(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const groupId = user.group_id ? parseInt(user.group_id) : null;
    const teamId = user.team_id ? parseInt(user.team_id) : null;

    if (groupId) formData.append("groupId", groupId.toString());
    if (teamId) formData.append("teamId", teamId.toString());
    formData.append("documentType", file.type);

    try {
      setLoading(true);
      const response = await api.post("/indicators/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 && response.data?.success) {
        alert("Document uploaded and analyzed successfully!");
        fetchIndicators();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        "Upload failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndicator = async (data) => {
    try {
      const response = await api.post("/indicators/", data);
      if (response.status === 200 && response.data?.success) {
        alert("Indicator created successfully!");
        setShowCreateModal(false);
        fetchIndicators();
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("Failed to create indicator");
    }
  };

  const handleAssignIndicator = async (
    indicatorId,
    type,
    assignees,
    dueDate,
    notes,
  ) => {
    try {
      const response = await api.post(`/indicators/${indicatorId}/assign`, {
        assignees,
        type,
        due_date: dueDate,
        notes,
      });
      if (response.status === 200 && response.data?.success) {
        alert("Indicator assigned successfully!");
        setShowAssignModal(false);
        setSelectedIndicator(null);
      }
    } catch (error) {
      console.error("Assign error:", error);
      alert("Failed to assign indicator");
    }
  };

  const handleDeleteIndicator = async (id, type) => {
    if (!confirm("Are you sure you want to delete this indicator?")) return;

    try {
      const response = await api.delete(`/indicators/${id}?type=${type}`);
      if (response.status === 200 && response.data?.success) {
        alert("Indicator deleted successfully!");
        fetchIndicators();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete indicator");
    }
  };

  const handleViewDetails = (indicator, type) => {
    setSelectedIndicator({ ...indicator, type });
    setShowDetailsModal(true);
  };

  const handleAssignClick = (indicator, type) => {
    setSelectedIndicator({ ...indicator, type });
    setShowAssignModal(true);
  };

  const filteredLeading = (indicators.leading || []).filter(
    (indicator) =>
      indicator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredLagging = (indicators.lagging || []).filter(
    (indicator) =>
      indicator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getTabIndicators = () => {
    if (filterType === "leading") return filteredLeading;
    if (filterType === "lagging") return filteredLagging;
    return [...filteredLeading, ...filteredLagging];
  };

  console.log("Filtered indicators:", {
    filterType,
    leadingCount: filteredLeading.length,
    laggingCount: filteredLagging.length,
    totalFiltered: getTabIndicators().length,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Safety Indicators Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "employee"
              ? "View and complete assigned safety indicators"
              : "Manage leading and lagging indicators, upload documents for AI analysis"}
          </p>
        </div>
        <PermissionChecker permission="create_indicators">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              Create Indicator
            </Button>
          </div>
        </PermissionChecker>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leading</p>
                <p className="text-2xl font-bold">
                  {indicators.leading?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lagging</p>
                <p className="text-2xl font-bold">
                  {indicators.lagging?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.role === "employee" && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned</p>
                    <p className="text-2xl font-bold">
                      {(assignedIndicators.leading?.length || 0) +
                        (assignedIndicators.lagging?.length || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
                    <CheckCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {(assignedIndicators.leading?.filter(
                        (i) => i.status === "completed",
                      ).length || 0) +
                        (assignedIndicators.lagging?.filter(
                          (i) => i.status === "completed",
                        ).length || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Indicators</TabsTrigger>
          {user.role === "employee" && (
            <TabsTrigger value="assigned">My Assignments</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search indicators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "leading" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("leading")}
                className="gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Leading
              </Button>
              <Button
                variant={filterType === "lagging" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("lagging")}
                className="gap-1"
              >
                <TrendingDown className="w-3 h-3" />
                Lagging
              </Button>
            </div>
          </div>

          {/* Upload Card */}
          {canCreateIndicator && (
            <Card className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Upload Safety Documents for AI Analysis
                      </h3>
                      <p className="text-sm text-blue-800/80 dark:text-blue-300/80">
                        Upload incident reports, inspection forms, training
                        records to automatically extract indicators
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          PDF, DOC, DOCX, Images
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          AI Classification
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="gap-2"
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {/* Show leading indicators if filter matches */}
                {(filterType === "all" || filterType === "leading") &&
                  filteredLeading.map((indicator) => (
                    <IndicatorCard
                      key={`leading-${indicator.id}`}
                      indicator={{ ...indicator, type: "leading" }}
                      onView={handleViewDetails}
                      onAssign={handleAssignClick}
                      onDelete={handleDeleteIndicator}
                      canAssign={canAssignIndicator}
                      canDelete={canCreateIndicator}
                    />
                  ))}

                {/* Show lagging indicators if filter matches */}
                {(filterType === "all" || filterType === "lagging") &&
                  filteredLagging.map((indicator) => (
                    <IndicatorCard
                      key={`lagging-${indicator.id}`}
                      indicator={{ ...indicator, type: "lagging" }}
                      onView={handleViewDetails}
                      onAssign={handleAssignClick}
                      onDelete={handleDeleteIndicator}
                      canAssign={canAssignIndicator}
                      canDelete={canCreateIndicator}
                    />
                  ))}

                {/* No results message */}
                {!loading && getTabIndicators().length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No indicators found
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {canCreateIndicator
                        ? "Create your first indicator or upload a document"
                        : "No indicators available yet"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <AssignedIndicatorsList
            assignments={assignedIndicators}
            onRefresh={fetchAssignedIndicators}
          />
        </TabsContent>
      </Tabs>

      <SafetyDashboard user={user} />

      <ComplianceTracker user={user} />
      <ReportGenerator user={user} />

      {/* Modals */}
      {showCreateModal && (
        <CreateIndicatorModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateIndicator}
        />
      )}

      {showAssignModal && selectedIndicator && (
        <AssignIndicatorModal
          indicator={selectedIndicator}
          userRole={user.role}
          groupId={user.group_id}
          teamId={user.team_id}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedIndicator(null);
          }}
          onAssign={handleAssignIndicator}
        />
      )}

      {showDetailsModal && selectedIndicator && (
        <IndicatorDetailsModal
          indicator={selectedIndicator}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIndicator(null);
          }}
          onRefresh={fetchIndicators}
        />
      )}
    </div>
  );
}

function IndicatorCard({
  indicator,
  onView,
  onAssign,
  onDelete,
  canAssign,
  canDelete,
}) {
  const isLeading = indicator.type === "leading";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-2 rounded-lg ${
              isLeading
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}
          >
            {isLeading ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <Badge variant={isLeading ? "success" : "destructive"}>
            {indicator.type?.toUpperCase()}
          </Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2">{indicator.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {indicator.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category</span>
            <Badge variant="outline">{indicator.category}</Badge>
          </div>

          {isLeading && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-medium">
                {indicator.target_value} {indicator.measurement_unit}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(indicator, indicator.type)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {canAssign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssign(indicator, indicator.type)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(indicator.id, indicator.type)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
