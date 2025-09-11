import type { User } from "./User";

export type Author = Pick<User, "id" | "username" | "name" | "surname" | "photo_url">;

/*export interface Comment {
  id: number;
  blogId: number;
  userId: number;
  content: string;
  createdAt: string;
  author?: Author;
}*/

export interface Blog {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;

  likes: number;
  //comments: Comment[];

  author?: Author;
}
