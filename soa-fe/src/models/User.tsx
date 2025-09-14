export interface RegisterUserRequest {
  username: string;
  password: string;
  email: string;
  role: string;
  name: string;
  surname: string;
  biography: string;
  moto: string;
  photo_url: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
  surname: string;
  biography: string;
  moto: string;
  photo_url: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
}

export interface Follower {
  id: number;
  username: string;
  name: string;
  surname: string;
  followedByMe: boolean;
}