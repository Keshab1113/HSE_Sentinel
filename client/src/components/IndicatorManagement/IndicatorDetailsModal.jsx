import React, { useState, useEffect } from "react";
import { X, Share2, TrendingUp, TrendingDown, Users, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "../../api/axios";

export default function IndicatorDetailsModal({ indicator, onClose, onRefresh }) {
  const [details, setDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState(null);

  useEffect(() => {
    fetchDetails();
    fetchResults();
  }, []);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/indicators/${indicator.id}?type=${indicator.type}`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get(
        `/indicators/results/${indicator.id}?type=${indicator.type}`
      );
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setResults(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const handleShareResult = async (resultId) => {
    try {
      const response = await api.post(`/indicators/results/${resultId}/share`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setShareUrl(data.share_url);
        // Copy to clipboard
        navigator.clipboard.writeText(data.share_url);
        alert("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing result:", error);
      alert("Failed to generate share link");
    }
  };

  const isLeading = indicator.type === "leading";

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  isLeading
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                }`}
              >
                {isLeading ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">{indicator.name}</h2>
                  <Badge variant={isLeading ? "success" : "destructive"}>
                    {indicator.type?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{indicator.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline">{indicator.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Code: {indicator.indicator_code}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">
                Assignments ({details?.assignments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="results">
                Results ({results.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4">
                {isLeading ? (
                  <>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Target Value</p>
                      <p className="text-2xl font-bold">
                        {indicator.target_value} {indicator.measurement_unit}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Minimum Acceptable</p>
                      <p className="text-2xl font-bold">
                        {indicator.min_acceptable} {indicator.measurement_unit}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Weight</p>
                      <p className="text-2xl font-bold">{indicator.weight}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Measurement Unit</p>
                      <p className="text-2xl font-bold">{indicator.measurement_unit}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Severity Weight</p>
                      <p className="text-2xl font-bold">{indicator.severity_weight}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Financial Impact</p>
                      <p className="text-2xl font-bold">
                        {indicator.financial_impact_multiplier}x
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Recent Measurements */}
              {details?.recent_measurements && details.recent_measurements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Measurements</h3>
                  <div className="space-y-2">
                    {details.recent_measurements.map((measurement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="font-medium">{measurement.measured_value}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(measurement.measurement_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {measurement.group_name && (
                          <Badge variant="outline">{measurement.group_name}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4 mt-6">
              {!details?.assignments || details.assignments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {details.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{assignment.assignee_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.assignee_email}
                          </p>
                        </div>
                        <Badge
                          variant={
                            assignment.status === "completed"
                              ? "success"
                              : assignment.status === "in_progress"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>

                      {assignment.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                      )}

                      {assignment.notes && (
                        <p className="text-sm mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                          {assignment.notes}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Assigned by {assignment.assigned_by_name} on{" "}
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4 mt-6">
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No results recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl font-bold">{result.measured_value}</p>
                            {isLeading && indicator.measurement_unit && (
                              <span className="text-sm text-muted-foreground">
                                {indicator.measurement_unit}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(result.measurement_date).toLocaleDateString()}
                          </div>

                          {result.recorded_by_name && (
                            <p className="text-xs text-muted-foreground">
                              Recorded by {result.recorded_by_name}
                            </p>
                          )}

                          {result.group_name && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{result.group_name}</Badge>
                              {result.team_name && (
                                <Badge variant="outline">{result.team_name}</Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareResult(result.id)}
                          className="gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}