import axios from "axios";
import AuthService from "./AuthService";
import { Blog, Author } from "../models/Blog";

const API = "http://localhost:8080/api";
const BASE = `${API}/blogs`;

function authHeader(required = true) {
  const token = AuthService.getToken();
  if (!token && required) throw new Error("No authentication token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function normalizeBlog(raw: any): Blog {
  return {
    id: Number(raw.id),
    userId: Number(raw.userId),
    title: String(raw.title ?? ""),
    content: String(raw.content ?? ""),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    likes: Number.isFinite(raw.likes) ? Number(raw.likes) : 0,
    //comments: Array.isArray(raw.comments) ? raw.comments : [],
    author: raw.author as Author | undefined,
  };
}

export async function getBlogs(signal?: AbortSignal): Promise<Blog[]> {
  const res = await axios.get(`${BASE}/all`, {
    signal,
    headers: authHeader(false),
  });

  const payload = (res.data as any)?.data ?? res.data;
  if (!Array.isArray(payload)) {
    throw new Error("Invalid response format: expected Blog[]");
  }
  const blogs = payload.map(normalizeBlog);

  const token = AuthService.getToken();
  if (!token) return blogs;

  try {
    const me = await AuthService.getMyProfile();
    return blogs.map(b =>
      b.userId === me.id
        ? {
            ...b,
            author: {
              id: me.id,
              username: me.username,
              name: me.name,
              surname: me.surname,
              photo_url: me.photo_url,
            },
          }
        : b
    );
  } catch {
    return blogs;
  }
}

export async function getBlogById(id: number, signal?: AbortSignal): Promise<Blog> {
  const res = await axios.get(`${BASE}/${id}`, {
    signal,
    headers: authHeader(false),
  });
  const payload = (res.data as any)?.data ?? res.data;
  let blog = normalizeBlog(payload);

  const token = AuthService.getToken();
  if (!token) return blog;

  try {
    const me = await AuthService.getMyProfile();
    if (blog.userId === me.id) {
      blog = {
        ...blog,
        author: {
          id: me.id,
          username: me.username,
          name: me.name,
          surname: me.surname,
          photo_url: me.photo_url,
        },
      };
    }
  } catch {}
  return blog;
}

export async function likeBlog(id: number, signal?: AbortSignal): Promise<void> {
  await axios.post(`${BASE}/${id}/likes`, null, {
    signal,
    headers: authHeader(true),
  });
}

export async function dislikeBlog(id: number, userId: number, signal?: AbortSignal): Promise<void> {
  await axios.post(`${BASE}/${id}/likes/${userId}`, null, {
    signal,
    headers: authHeader(true),
  });
}

export async function getBlogLikesCount(blogId: number, signal?: AbortSignal): Promise<number> {
  const res = await axios.get(`${BASE}/${blogId}/likes/count`, {
    signal,
    headers: authHeader(false),
  });
  return ((res.data as any)?.data?.count ?? 0) as number;
}

export async function getMyLikeStatus(blogId: number, signal?: AbortSignal): Promise<{ liked: boolean; count: number }> {
  const res = await axios.get(`${BASE}/${blogId}/likes/me`, {
    signal,
    headers: authHeader(true),
  });
  return (res.data as any).data as { liked: boolean; count: number };
}

export async function toggleLike(blogId: number, signal?: AbortSignal): Promise<{ liked: boolean; count: number }> {
  const res = await axios.post(`${BASE}/${blogId}/likes/toggle`, null, {
    signal,
    headers: authHeader(true),
  });
  return (res.data as any).data as { liked: boolean; count: number };
}
