import axios from "axios";
import { Position } from "../models/Position";
import AuthService from "./AuthService";

interface ApiTourResponse {
  position: Position;
}

function authHeader(required = true) {
  const token = AuthService.getToken();
  if (!token && required) throw new Error("No authentication token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}


export async function getPosition(signal?: AbortSignal) {
  const { data } = await axios.get(
    "http://localhost:8080/api/stakeholders/position",
    { signal, headers: authHeader() }
  );
  const pos = (data as any)?.position ?? data;
  return {
    id: Number(pos.id ?? 0),
    userId: Number(pos.userId ?? 0),
    latitude: Number(pos.latitude ?? 0),
    longitude: Number(pos.longitude ?? 0),
  };
}

type CreatePositionRequest = { latitude: number; longitude: number };

export async function createNewPosition(body: CreatePositionRequest, signal?: AbortSignal) {
  const { data } = await axios.post(
    "http://localhost:8080/api/stakeholders/position",
    body,
    { headers: { ...authHeader(), "Content-Type": "application/json" }, signal }
  );
  return data;
}
