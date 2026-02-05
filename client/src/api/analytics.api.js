import api from "./axios";

export const getIndicatorTrends = () =>
  api.get("/analytics/trends");
