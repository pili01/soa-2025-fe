import axios from "axios";
import AuthService from "./AuthService";
import { TourExecution, TourExecutionStatus } from "../models/Tour";

const API = "http://localhost:8080/api";
const BASE = `${API}/tours/execution`;

type ApiResponse<T> = { success: boolean; data: T };

function authHeader(required = true) {
  const token = AuthService.getToken();
  if (!token && required) throw new Error("No authentication token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function normalizeExecution(raw: any): TourExecution {
  return {
    id: Number(raw.id),
    tour_id: Number(raw.tour_id),
    user_id: Number(raw.user_id),
    started_at: raw.started_at ?? new Date().toISOString(),
    last_activity: raw.last_activity ?? new Date().toISOString(),
    status: (raw.status ?? "pending") as TourExecutionStatus,
    ended_at: raw.ended_at ?? null,
    finished_keypoints: Array.isArray(raw.finished_keypoints)
      ? raw.finished_keypoints.map((fk: any) => ({
        keypoint_id: Number(fk.keypoint_id),
        completed_at: fk.completed_at ?? new Date().toISOString(),
      }))
      : [],
  };
}

class ExecutionService {

  static async getExecutions(signal?: AbortSignal): Promise<TourExecution[]> {
    const res = await axios.get(`${BASE}/my-executions`, {
      signal,
      headers: authHeader(true),
    });

    const payload = (res.data as any)?.data ?? res.data;
    if (payload === null) return [];
    if (!Array.isArray(payload)) {
      throw new Error("Invalid response format: expected TourExecution[]");
    }
    const executions = payload.map(normalizeExecution);
    console.log("Fetched executions:", executions);
    return executions;
  }

  static async getExecutionByTourId(tourId: number, signal?: AbortSignal): Promise<TourExecution | null> {
    const res = await axios.get(`${BASE}/tour/${tourId}`, {
      signal,
      headers: authHeader(true),
    });

    const payload = (res.data as any)?.data ?? res.data;

    console.log("Fetched executions:", normalizeExecution(payload));
    return normalizeExecution(payload);
  }

  static async startTour(tourId: number, signal?: AbortSignal): Promise<Boolean> {
    const res = await axios.post(`${BASE}/start/${tourId}`, {}, {
      signal,
      headers: authHeader(true),
    });

    if (res.status >= 200 && res.status < 300) {
      return true;
    }
    console.error("Failed to start tour:", res);
    return false;
  }

  static async isKeypointReached(tourId: number, signal?: AbortSignal): Promise<Boolean> {
    const res = await axios.post(`${BASE}/is-keypoint-reached/${tourId}`, {}, {
      signal,
      headers: authHeader(true),
    });

    if (res.status >= 200 && res.status < 300) {
      if (res.data && res.data.keyPointId) {
        return true;
      }
      return false;
    }
    console.error("Failed to check is key point reached:", res);
    return false;
  }

  static async abortTour(tourId: number, signal?: AbortSignal): Promise<Boolean> {
    const res = await axios.post(`${BASE}/abort/${tourId}`, {}, {
      signal,
      headers: authHeader(true),
    });

    if (res.status >= 200 && res.status < 300) {
      return true;
    }
    console.error("Failed to abort tour:", res);
    return false;
  }

};
export default ExecutionService;