import axios from "axios";
import { Position } from "../models/Position";

interface ApiTourResponse {
  position: Position;
}

export async function getPosition(userId: number, signal?: AbortSignal): Promise<Position> {
  const token = localStorage.getItem("jwt");

  const res = await axios.get(`http://localhost:8080/api/stakeholders/position`, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const raw = res.data;

  const pos = raw.position ?? raw;

  return {
    id: Number(pos.id ?? 0),
    userId: Number(pos.userId ?? 0),
    latitude: Number(pos.latitude ?? 0),
    longitude: Number(pos.longitude ?? 0),
  };
}


export async function createNewPosition(
    position: Omit<Position, "id">,
    signal?: AbortSignal
  ) {
    const token = localStorage.getItem("jwt");

    const res = await axios.post<Position>(
      `http://localhost:8080/api/stakeholders/position`,
      position,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
      }
    );

    return res.data;
}