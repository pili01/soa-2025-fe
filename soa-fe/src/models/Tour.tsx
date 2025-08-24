export type TourDifficulty = "Easy" | "Medium" | "Hard";
export type TourStatus = "Draft" | "Published" | "Archived";

export interface Keypoint {
  id: number;
  tourId: number;
  name: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  ordinal: number;
}

export interface TourReview {
  id: number;
  tourId: number;
  touristId: number;
  rating: number;
  comment: string;
  visitDate: string | Date;
  commentDate: string | Date;
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
