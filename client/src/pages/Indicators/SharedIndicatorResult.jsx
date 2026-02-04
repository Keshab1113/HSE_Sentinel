import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building,
  Activity,
  Share2,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

export default function SharedIndicatorResult() {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedResult();
  }, [shareToken]);

  const fetchSharedResult = async () => {
    try {
      const response = await api.get(`/indicators/shared/${shareToken}`);
      if (response.status === 200 && response.data?.success) {
        const result = await response.data;
        setData(result.data);
      } else {
        setError("This shared result is not available or has expired");
      }
    } catch (error) {
      console.error("Error fetching shared result:", error);
      setError("Failed to load shared result");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared result...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Result Not Available</h2>
            <p className="text-muted-foreground">
              {error || "This shared result could not be found or has expired."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { indicator, measurement, shared_at } = data;
  const isLeading = measurement.measurement_date; // Simple check

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Share2 className="w-6 h-6 text-sky-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              Shared Safety Indicator Result
            </h1>
          </div>
          <p className="text-muted-foreground">
            This result was shared on {new Date(shared_at).toLocaleDateString()}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  indicator.category?.includes("training") ||
                  indicator.category?.includes("inspection")
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                }`}
              >
                {indicator.category?.includes("training") ||
                indicator.category?.includes("inspection") ? (
                  <TrendingUp className="w-8 h-8" />
                ) : (
                  <TrendingDown className="w-8 h-8" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{indicator.name}</CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {indicator.category?.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{indicator.description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Measurement Value */}
            <div className="mb-8 p-6 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
              <div className="flex items-center gap-4">
                <Activity className="w-8 h-8 text-sky-600" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Measured Value</p>
                  <p className="text-4xl font-bold text-sky-600 dark:text-sky-400">
                    {measurement.measured_value}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-muted-foreground">Measurement Date</p>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(measurement.measurement_date).toLocaleDateString()}
                </p>
              </div>

              {measurement.recorded_by_name && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-muted-foreground">Recorded By</p>
                  </div>
                  <p className="text-lg font-semibold">{measurement.recorded_by_name}</p>
                </div>
              )}

              {measurement.group_name && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-muted-foreground">Group</p>
                  </div>
                  <p className="text-lg font-semibold">{measurement.group_name}</p>
                </div>
              )}

              {measurement.team_name && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-muted-foreground">Team</p>
                  </div>
                  <p className="text-lg font-semibold">{measurement.team_name}</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            {measurement.metadata && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Additional Information</p>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {JSON.stringify(measurement.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This is a read-only view of a shared safety indicator result.
            <br />
            For full access and functionality, please log in to the HSE platform.
          </p>
        </div>
      </div>
    </div>
  );
}