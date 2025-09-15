import axios from "axios";
import { Keypoint, Tour, TourReview } from "../models/Tour";
import AuthService from "./AuthService";
import { Position } from "../models/Position";

// Backend returns array directly, not wrapped in object
type ApiTourResponse = Tour[];

export type CreateReviewDto = {
  tourId: number;
  rating: number;
  comment: string;
  visitDate: string;
};

interface ApiPositionResponse {
  position: Position;
}

interface TourResponse {
  tour: any;
  firstKeypoint?: Keypoint;
  keypoints?: Keypoint[];
  reviews: TourReview[];
  message: string;
}

export async function getTours(signal?: AbortSignal): Promise<Tour[]> {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      console.log('Calling getTours with token:', token.substring(0, 20) + '...');
      
      const res = await axios.get<ApiTourResponse>(
        "http://localhost:8080/api/tours/my-tours",
        {
          signal,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('getTours response:', res);
      console.log('getTours response.data:', res.data);
      console.log('getTours response.data (tours array):', res.data);

      if (!Array.isArray(res.data)) {
        console.error('Response is not an array:', res.data);
        throw new Error('Invalid response format: expected array of tours');
      }

      return res.data;
    } catch (error) {
      console.error('getTours error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response);
        console.error('Axios error status:', error.response?.status);
        console.error('Axios error data:', error.response?.data);
      }
      throw error;
    }
}

  export async function createTourKeyPoint(
    tourId: number,
    keypoint: Omit<Keypoint, "id">,
    signal?: AbortSignal
  ) {
    const token = AuthService.getToken();

    if (!token) {
      throw new Error('No authentication token');
    }

    const res = await axios.post<Keypoint>(
      `http://localhost:8080/api/tours/${tourId}/create-keypoint`,
      keypoint,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      }
    );

    return res.data;
}

export async function getTourKeyPoints(tourId: number, signal?: AbortSignal) {
  const token = AuthService.getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const res = await axios.get<Keypoint[]>(
    `http://localhost:8080/api/tours/${tourId}/keypoints`,
    {
      signal,
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data;
}

export async function deleteTourKeyPoint(keypointId: number, signal?: AbortSignal) {
  const token = AuthService.getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const res = await axios.delete<string>(
    `http://localhost:8080/api/tours/keypoints/${keypointId}`,
    {
      signal,
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data;
}

export async function updateTourKeyPoints(kp: Omit<Keypoint, "id">, keypointId: number, signal?: AbortSignal) {
  const token = AuthService.getToken();

  if (!token) {
    throw new Error('No authentication token');
  }

  const res = await axios.put<Keypoint>(
    `http://localhost:8080/api/tours/keypoints/${keypointId}`,
    kp,
    {
      signal,
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data;
}

export async function getTourReview(tourId: number, signal?: AbortSignal){
  const token = AuthService.getToken();

  if(!token){
    throw new Error('No authentication token');
  }

  const res = await axios.get<TourReview[]>(
    `http://localhost:8080/api/tours/${tourId}/reviews`,
    {
      signal,
      headers: {Authorization: `Bearer ${token}`}
    }
  );
  return res.data;
}

export async function createTourReview(
  review: CreateReviewDto,
  files: File[] = [],
  signal?: AbortSignal
): Promise<any> {
  const token = AuthService.getToken();
  if (!token) throw new Error("No authentication token");

  const form = new FormData();
  form.append("tourId", String(review.tourId));
  form.append("rating", String(review.rating));
  form.append("comment", review.comment);
  form.append("visitDate", String(review.visitDate));
  form.append("commentDate", new Date().toISOString());

  files.forEach((f) => form.append("images", f));

  const res = await axios.post(
    "http://localhost:8080/api/tours/reviews",
    form,
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function fetchTourInfo(tourId: number, signal?: AbortSignal): Promise<TourResponse> {
  const token = AuthService.getToken();
  if (!token) throw new Error("No authentication token");
  const res = await axios.get<TourResponse>(`http://localhost:8080/api/tours/${tourId}/purchased-keypoints`, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
