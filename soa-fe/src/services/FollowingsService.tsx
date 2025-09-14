import axios from "axios";
import AuthService from "./AuthService";
import { Follower, User } from "../models/User";

const API = "http://localhost:8080/api";
const BASE = `${API}/follow`;

function authHeader(required = true) {
    const token = AuthService.getToken();
    if (!token && required) throw new Error("No authentication token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getFollowers(signal?: AbortSignal): Promise<Follower[]> {
    const res = await axios.get(`${BASE}/myFollowers`, {
        signal,
        headers: authHeader(false),
    });

    if (res.status !== 200) {
        throw new Error(`Failed to fetch followers: ${res.statusText}`);
    }

    const payload = (res.data as any)?.data ?? res.data;
    const followers: Follower[] = payload.map((c: Follower) => ({
        id: Number(c.id),
        username: String(c.username ?? ""),
        name: String(c.name ?? ""),
        surname: String(c.surname ?? ""),
        followedByMe: Boolean(c.followedByMe ?? false),
    }));
    console.log("Followers:", followers);
    return followers;
}

export async function getFollowings(signal?: AbortSignal): Promise<Follower[]> {
    const res = await axios.get(`${BASE}/followedByMe`, {
        signal,
        headers: authHeader(false),
    });

    if (res.status !== 200) {
        throw new Error(`Failed to fetch followings: ${res.statusText}`);
    }

    const payload = (res.data as any)?.data ?? res.data;
    const followers: Follower[] = payload.map((c: any) => ({
        id: Number(c.id),
        username: String(c.username ?? ""),
        name: String(c.name ?? ""),
        surname: String(c.surname ?? ""),
        followedByMe: true,
    }));
    console.log("Followers:", followers);
    return followers;
}

export async function getSuggestions(signal?: AbortSignal): Promise<Follower[]> {
    const res = await axios.get(`${BASE}/suggestions/5`, {
        signal,
        headers: authHeader(false),
    });

    if (res.status !== 200) {
        throw new Error(`Failed to fetch suggestions: ${res.statusText}`);
    }

    const payload = (res.data as any)?.data ?? res.data;
    const Suggestions: Follower[] = payload.map((c: any) => ({
        id: Number(c.id),
        username: String(c.username ?? ""),
        name: String(c.name ?? ""),
        surname: String(c.surname ?? ""),
        followedByMe: false,
    }));
    console.log("Suggestions:", Suggestions);
    return Suggestions;
}

export async function followUser(userId: number, username: string): Promise<boolean> {
    const follower = { id: userId, username: username };
    const res = await axios.post(
        `${BASE}/followUser`,
        follower,
        { headers: authHeader() }
    );
    if (res.status > 200 && res.status < 300) {
        return true;
    }
    throw new Error(`Failed to follow user: ${res.statusText}`);
}

export async function unfollowUser(userId: number, username: string): Promise<boolean> {
    const res = await axios.post(
        `${BASE}/unfollowUser`,
        { id: userId, username: username },
        { headers: authHeader() }
    );
    if (res.status > 200 && res.status < 300) {
        return true;
    }
    throw new Error(`Failed to unfollow user: ${res.statusText}`);
}
