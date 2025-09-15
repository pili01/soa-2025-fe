export type TourDifficulty = "Easy" | "Medium" | "Hard";
export type TourStatus = "Draft" | "Published" | "Archived";
export type TourExecutionStatus = "pending" | "in_progress" | "completed" | "failed" | "aborted";

export interface Keypoint {
  id: number;
  tourId: number;
  name: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  ordinal: number;
  isReached?: boolean;
}

export interface TourReview {
  id: number;
  tourId: number;
  touristId: number;
  rating: number;
  comment: string;
  visitDate: string | Date;
  commentDate: string | Date;
  images: string[];
  imageUrls: string[];
}

export interface Tour {
  id: number;
  authorId: number;
  name: string;
  description: string;
  difficulty: TourDifficulty;
  tags: string[];
  status: TourStatus;
  price: number;
  keypoints?: Keypoint[];
  reviews?: TourReview[];
}

export interface FinishedKeypoint {
  keypoint_id: number;
  completed_at: string | Date;
}

export interface TourExecution {
  id: number;
  tour_id: number;
  user_id: number;
  started_at: string | Date;
  last_activity: string | Date;
  status: TourExecutionStatus;
  ended_at: string | Date;
  finished_keypoints: FinishedKeypoint[];
}