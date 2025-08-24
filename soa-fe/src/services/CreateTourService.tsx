import axios from "axios";
import { Keypoint, Tour } from "../models/Tour";

const token = localStorage.getItem("jwt");

interface ApiTourResponse {
  tours: Tour[];
}


export async function getTours(signal?: AbortSignal): Promise<Tour[]> {
    const token = localStorage.getItem("jwt");

    const res = await axios.get<ApiTourResponse>(
      "http://localhost:8080/api/tours/my-tours",
      {
        signal,
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    return res.data.tours;
}

  export async function createTourKeyPoint(
    tourId: number,
    keypoint: Omit<Keypoint, "id">,
    signal?: AbortSignal
  ) {
    const token = localStorage.getItem("jwt");

    const res = await axios.post<Keypoint>(
      `http://localhost:8080/api/tours/${tourId}/create-keypoint`,
      keypoint,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
      }
    );

    return res.data;
}

export async function getTourKeyPoints(tourId: number, signal?: AbortSignal) {
  const token = localStorage.getItem("jwt");

  const res = await axios.get<Keypoint[]>(
    `http://localhost:8080/api/tours/${tourId}/keypoints`,
    {
      signal,
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  return res.data;
}

export async function deleteTourKeyPoint(keypointId: number, signal?: AbortSignal) {
  const token = localStorage.getItem("jwt");

  const res = await axios.delete<string>(
    `http://localhost:8080/api/tours/keypoints/${keypointId}`,
    {
      signal,
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  return res.data;
}

export async function updateTourKeyPoints(kp: Omit<Keypoint, "id">, keypointId: number, signal?: AbortSignal) {
  const token = localStorage.getItem("jwt");

  const res = await axios.put<Keypoint>(
    `http://localhost:8080/api/tours/keypoints/${keypointId}`,
    kp,
    {
      signal,
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  return res.data;
}