// services/indicatorService.js - Add getRiskPredictions method
import api from "../api/axios";

class IndicatorService {
  // Get all indicators
  async getIndicators() {
    const response = await api.get("/indicators/");
    return response.data.data;
  }

  // Get single indicator
  async getIndicator({ id, type }) {
    const response = await api.get(`/indicators/${id}?type=${type}`);
    return response.data.data;
  }

  // Get indicator details
  async getIndicatorDetails({ id, type }) {
    const response = await api.get(`/indicators/${id}/details?type=${type}`);
    return response.data.data;
  }

  // Get indicator results
  async getIndicatorResults({ id, type }) {
    const response = await api.get(`/indicators/results/${id}?type=${type}`);
    return response.data.data || [];
  }

  // Get risk predictions
  async getRiskPredictions({ id, type }) {
    try {
      const response = await api.get(
        `/indicators/${id}/predictions?type=${type}`,
      );
      return response.data.data || [];
    } catch (error) {
      console.log("Using mock predictions");
      // Return empty array to trigger mock data generation in hook
      return [];
    }
  }

  // Create indicator
  async createIndicator(data) {
    const response = await api.post("/indicators/", data);
    return response.data.data;
  }

  // Update indicator
  async updateIndicator({ id, type, data }) {
    const response = await api.put(`/indicators/${id}?type=${type}`, data);
    return response.data.data;
  }

  // Delete indicator
  async deleteIndicator({ id, type }) {
    const response = await api.delete(`/indicators/${id}?type=${type}`);

    if (response.data?.success === false) {
      throw new Error(response.data.message || "Indicator not found");
    }

    return response.data.data;
  }

  // Assign indicator
  async assignIndicator({ id, data }) {
    const response = await api.post(`/indicators/${id}/assign`, data);
    return response.data.data;
  }

  // Get assigned indicators for current user
  async getMyAssignments() {
    const response = await api.get("/indicators/assigned/me");
    return response.data.data;
  }

  // Update assignment status
  async updateAssignmentStatus({ id, status, data = {} }) {
    const response = await api.put(`/indicators/assignments/${id}/status`, {
      status,
      ...data,
    });
    return response.data.data;
  }

  // Get available users for assignment
  async getAvailableUsers(params) {
    let endpoint = "/users/";

    if (params.role === "super_admin") {
      endpoint = "/users";
    } else if (params.role === "group_admin" && params.groupId) {
      endpoint = `/users/?groupId=${params.groupId}`;
    } else if (params.role === "team_admin" && params.teamId) {
      endpoint = `/users/?teamId=${params.teamId}`;
    }

    const response = await api.get(endpoint);
    return response.data.data || [];
  }

  // Upload document
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/indicators/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Share result
  async shareResult(resultId) {
    const response = await api.post(`/indicators/results/${resultId}/share`);
    return response.data;
  }

  // Get shared result
  async getSharedResult(shareToken) {
    const response = await api.get(`/indicators/shared/${shareToken}`);
    return response.data.data;
  }
}

export default new IndicatorService();
