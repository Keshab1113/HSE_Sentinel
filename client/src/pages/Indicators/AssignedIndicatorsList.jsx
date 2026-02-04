import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import api from "../../api/axios";

export default function AssignedIndicatorsList({ assignments, onRefresh }) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const allAssignments = [
    ...assignments.leading.map((a) => ({ ...a, type: "leading" })),
    ...assignments.lagging.map((a) => ({ ...a, type: "lagging" })),
  ].sort((a, b) => {
    // Sort by status (pending first) then by due date
    const statusOrder = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const handleStatusUpdate = (assignment, newStatus) => {
    setSelectedAssignment({ ...assignment, newStatus });
    if (newStatus === "completed") {
      setShowCompleteModal(true);
    } else {
      updateStatus(assignment.id, newStatus);
    }
  };

  const updateStatus = async (assignmentId, status, data = {}) => {
    try {
      const response = await api.put(`/indicators/assignments/${assignmentId}/status`, {
        status,
        ...data,
      });

      if (response.status === 200 && response.data?.success) {
        alert("Status updated successfully!");
        setShowCompleteModal(false);
        setSelectedAssignment(null);
        onRefresh();
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
      in_progress: { color: "bg-blue-100 text-blue-700", label: "In Progress" },
      completed: { color: "bg-green-100 text-green-700", label: "Completed" },
      cancelled: { color: "bg-slate-100 text-slate-700", label: "Cancelled" },
    };
    return variants[status] || variants.pending;
  };

  const isOverdue = (dueDate, status) => {
    if (status === "completed" || status === "cancelled") return false;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      {allAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No Assignments Yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You don't have any indicator assignments at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allAssignments.map((assignment) => {
            const isLeading = assignment.type === "leading";
            const statusBadge = getStatusBadge(assignment.status);
            const overdue = isOverdue(assignment.due_date, assignment.status);

            return (
              <Card
                key={`${assignment.type}-${assignment.id}`}
                className={`${overdue ? "border-red-300 dark:border-red-700" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
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

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {assignment.indicator_name}
                          </h3>
                          <Badge variant={isLeading ? "success" : "destructive"}>
                            {assignment.type?.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {assignment.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{assignment.category}</Badge>
                          </div>

                          {assignment.due_date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span
                                className={
                                  overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                                }
                              >
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                {overdue && " (Overdue)"}
                              </span>
                            </div>
                          )}

                          {assignment.assigned_by_name && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4 text-slate-500" />
                              <span className="text-muted-foreground">
                                Assigned by: {assignment.assigned_by_name}
                              </span>
                            </div>
                          )}
                        </div>

                        {assignment.notes && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <p className="text-sm font-medium mb-1">Assignment Notes:</p>
                            <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                          </div>
                        )}

                        {assignment.completion_notes && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm font-medium mb-1 text-green-700 dark:text-green-400">
                              Completion Notes:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.completion_notes}
                            </p>
                          </div>
                        )}

                        {isLeading && assignment.target_value && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Target: {assignment.target_value} {assignment.measurement_unit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-md ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      {overdue && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  {assignment.status !== "completed" && assignment.status !== "cancelled" && (
                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {assignment.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(assignment, "in_progress")}
                        >
                          Start Working
                        </Button>
                      )}
                      {assignment.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(assignment, "completed")}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(assignment, "cancelled")}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {assignment.status === "completed" && assignment.completed_at && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Completed on {new Date(assignment.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedAssignment && (
        <CompleteAssignmentModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedAssignment(null);
          }}
          onComplete={(data) =>
            updateStatus(selectedAssignment.id, "completed", data)
          }
        />
      )}
    </div>
  );
}

function CompleteAssignmentModal({ assignment, onClose, onComplete }) {
  const [measuredValue, setMeasuredValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      notes,
    };

    if (measuredValue) {
      data.measured_value = parseFloat(measuredValue);
    }

    onComplete(data);
  };

  const isLeading = assignment.type === "leading";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Complete Assignment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h3 className="font-semibold mb-1">{assignment.indicator_name}</h3>
            <p className="text-sm text-muted-foreground">{assignment.description}</p>
          </div>

          {isLeading && (
            <div className="space-y-2">
              <Label htmlFor="measured_value">
                Measured Value ({assignment.measurement_unit})
              </Label>
              <Input
                id="measured_value"
                type="number"
                step="0.01"
                value={measuredValue}
                onChange={(e) => setMeasuredValue(e.target.value)}
                placeholder={`Target: ${assignment.target_value}`}
              />
              <p className="text-xs text-muted-foreground">
                Target: {assignment.target_value} {assignment.measurement_unit}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about completing this assignment..."
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <CheckCircle className="w-4 h-4" />
              Complete Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}