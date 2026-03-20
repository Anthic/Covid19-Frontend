import axiosClient from "./axiosClient";
import type {
  PredictInput,
  PredictionAPIResponse,
  IDoctorsResponse,
  PredictionHistoryResponse,
  AnalyticsData,
} from "../types/auth.prediction";

// POST /prediction — ML model চালাও
export const runPredictionApi = async (input: PredictInput) => {
  const res = await axiosClient.post<PredictionAPIResponse>("/prediction", input);
  // res.data.data = { prediction (DB record), mlResponse (ML result) }
  return res.data.data;
};

export const getDoctorsApi = async (
  region: number,
  risk_level: string,
  limit = 5
): Promise<IDoctorsResponse> => {
  const res = await axiosClient.get<{ success: boolean; data: IDoctorsResponse }>("/prediction/doctors", {
    params: { region, risk_level, limit },
  });
  return res.data.data;
};

// GET /prediction/history?page=1&limit=10
export const getMyHistoryApi = async (
  page = 1,
  limit = 10
): Promise<PredictionHistoryResponse> => {
  const res = await axiosClient.get<{ success: boolean; data: PredictionHistoryResponse }>(
    "/prediction/history",
    { params: { page, limit } }
  );
  return res.data.data;
};

// GET /prediction/analytics
export const getMyAnalyticsApi = async (): Promise<AnalyticsData> => {
  const res = await axiosClient.get<{ success: boolean; data: AnalyticsData }>(
    "/prediction/analytics"
  );
  return res.data.data;
};

// GET /prediction/regions
export const getRegionsApi = async (): Promise<Record<string, string>> => {
  const res = await axiosClient.get<{
    success: boolean;
    data: { regions: Record<string, string> };
  }>("/prediction/regions");
  return res.data.data.regions;
};