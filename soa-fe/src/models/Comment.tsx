export interface Comment {
  id: number;
  blogId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt?: Date;

  authorUsername?: string;
}