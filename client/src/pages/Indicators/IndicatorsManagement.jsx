import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Upload,
  AlertTriangle,
  Shield,
  CheckCircle,
  BarChart3,
  Plus,
} from "lucide-react";
import api from "../../api/axios";

export default function IndicatorsManagement({ user }) {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const response = await api.get("/indicators/scores");

      if (response.ok) {
        const data = await response.json();
        setIndicators(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  const runPredictiveAnalysis = async () => {
    try {
      const response = await api.post("/api/indicators/predictive", {
        groupId: user.group_id,
        teamId: user.team_id,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Predictive analysis completed successfully!");
        fetchIndicators(); // Refresh data
      }
    } catch (error) {
      console.error("Error running predictive analysis:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Ensure group_id and team_id are numbers, not strings
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

      if (response.ok) {
        alert("Document uploaded and analyzed successfully!");
        fetchIndicators(); // Refresh the indicators
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

  const filteredIndicators = indicators.filter((indicator) => {
    const matchesSearch =
      indicator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || indicator.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Safety Indicators Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage leading and lagging indicators, upload documents for AI
            analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={runPredictiveAnalysis}
          >
            <TrendingUp className="w-4 h-4" />
            Run Predictive Analysis
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Indicator
          </Button>
        </div>
      </div>

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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Filter className="w-4 h-4 text-slate-500" />
          <select className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300">
            <option>Sort by: Recent</option>
            <option>Sort by: Score</option>
            <option>Sort by: Name</option>
          </select>
        </div>
      </div>

      {/* Upload Card */}
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
                  Upload incident reports, inspection forms, training records,
                  or safety meeting minutes. Our AI will extract and analyze
                  safety indicators automatically.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    Supported: PDF, DOC, DOCX, Images
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Automatic classification
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              className="gap-2"
              onClick={() => document.getElementById("file-upload").click()}
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

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
              </CardContent>
            </Card>
          ))
        ) : filteredIndicators.length > 0 ? (
          filteredIndicators.map((indicator, index) => (
            <IndicatorCard key={index} indicator={indicator} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No indicators found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Upload safety documents to automatically generate indicators"}
            </p>
          </div>
        )}
      </div>

      {/* Predictive Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Predictive Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">High Risk Prediction</p>
                    <p className="text-sm text-muted-foreground">
                      Forklift operations in Warehouse Zone A
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="destructive">Critical</Badge>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IndicatorCard({ indicator }) {
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
        <p className="text-sm text-muted-foreground mb-4">
          {indicator.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Score</span>
            <span className="font-bold text-lg">
              {indicator.score || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Target</span>
            <span className="font-medium">{indicator.target || "100"}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Status</span>
            <Badge
              variant={
                indicator.status === "good"
                  ? "success"
                  : indicator.status === "warning"
                    ? "warning"
                    : "secondary"
              }
            >
              {indicator.status || "Active"}
            </Badge>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
