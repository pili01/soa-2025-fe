import React, { useEffect, useState } from 'react';
import { Follower, User } from '../models/User';
import * as FollowersService from '../services/FollowingsService';
import AuthService from '../services/AuthService';

// Mock data
const myFollowings: Follower[] = [];
const myFollowers: Follower[] = [];
const recommended: Follower[] = [];
const allUsers: User[] = [];

export default function Followings() {
    const [search, setSearch] = useState('');
    const [followings, setFollowings] = useState<Follower[]>(myFollowings);
    const [followers, setFollowers] = useState<Follower[]>(myFollowers);
    const [suggested, setSuggested] = useState<Follower[]>(recommended);
    const [searchUsers, setAllUsers] = useState<User[]>(allUsers);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [followers, followings, suggestions, allUsers] = await Promise.all([
                    FollowersService.getFollowers(),
                    FollowersService.getFollowings(),
                    FollowersService.getSuggestions(),
                    AuthService.getUsersForSearch(),
                ]);
                for (const follower of followers) {
                    const user = await AuthService.getProfileById(follower.id);
                    follower.name = user.name + " " + user.surname;
                    follower.surname = user.surname;
                };
                for (const follower of followings) {
                    const user = await AuthService.getProfileById(follower.id);
                    follower.name = user.name + " " + user.surname;
                    follower.surname = user.surname;
                };
                for (const follower of suggestions) {
                    const user = await AuthService.getProfileById(follower.id);
                    follower.name = user.name + " " + user.surname;
                    follower.surname = user.surname;
                };
                setFollowers(followers);
                setFollowings(followings);
                setSuggested(suggestions);
                setAllUsers(allUsers);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Search users (mock)
    const searchResults = searchUsers.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);

    // Follow/unfollow handlers (mock)
    const handleFollow = async (user: Follower) => {
        setLoading(true);
        const result = await FollowersService.followUser(user.id, user.username);
        if (result) {
            setFollowings([...followings, { ...user, followedByMe: true }]);
            setSuggested(suggested.filter(u => u.id !== user.id));
            setFollowers(prevFollowers =>
                prevFollowers.map(f =>
                    f.id === user.id ? { ...f, followedByMe: true } : f
                )
            );
        }
        setLoading(false);
    };
    const handleUnfollow = async (user: Follower) => {
        setLoading(true);
        const result = await FollowersService.unfollowUser(user.id, user.username);
        if (result) {
            setFollowings(followings.filter(u => u.id !== user.id));
            setFollowers(prevFollowers =>
                prevFollowers.map(f =>
                    f.id === user.id ? { ...f, followedByMe: false } : f
                )
            );
        }
        setLoading(false);
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Social Connections</h2>
            <div className="row mb-4">
                <div className="col-md-6">
                    <h4>People I Follow</h4>
                    <ul className="list-group">
                        {followings.map(u => (
                            <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{u.name} (@{u.username})</span>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnfollow(u)}>Unfollow</button>
                            </li>
                        ))}
                        {followings.length === 0 && <li className="list-group-item text-muted">You don't follow anyone yet.</li>}
                    </ul>
                </div>
                <div className="col-md-6">
                    <h4>People Following Me</h4>
                    <ul className="list-group">
                        {followers.map(u => (
                            <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{u.name} (@{u.username})</span>
                                {!u.followedByMe && <button className="btn btn-sm btn-outline-success" onClick={() => handleFollow(u)}>Follow back</button>}
                            </li>
                        ))}
                        {followers.length === 0 && <li className="list-group-item text-muted">No followers yet.</li>}
                    </ul>
                </div>
            </div>
            <div className="mb-4">
                <h4>Recommended to Follow</h4>
                <ul className="list-group">
                    {suggested.slice(0, 5).map(u => (
                        <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{u.name} (@{u.username})</span>
                            {!u.followedByMe ? (
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleFollow(u)}>Follow</button>
                            ) : (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnfollow(u)}>Unfollow</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-4">
                <h4>Search Users</h4>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Search by username or name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <ul className="list-group">
                    {search && searchResults.length === 0 && <li className="list-group-item text-muted">No users found.</li>}
                    {searchResults.map(u => (
                        <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{u.name + ' ' + u.surname} (@{u.username})</span>
                            {!followings.some((t: Follower) => t.id === u.id) ? (
                                (u.id===AuthService.getCurrentUserId()) ? null : <button className="btn btn-sm btn-outline-primary" onClick={() => handleFollow({ id: u.id, username: u.username, name: u.name, surname: u.surname, followedByMe: false })}>Follow</button>
                            ) : (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnfollow({ id: u.id, username: u.username, name: u.name, surname: u.surname, followedByMe: true })}>Unfollow</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
