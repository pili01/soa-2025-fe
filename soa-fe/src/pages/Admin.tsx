import React, { useState, useEffect } from 'react';
import { RefreshCw, UserCheck, UserX, Shield, Crown } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const usersData = await AuthService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async (userId: number, isBlocked: boolean) => {
    try {
      setError('');
      setSuccess('');
      
      await AuthService.blockUser(userId, isBlocked);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_blocked: isBlocked }
            : user
        )
      );
      
      const action = isBlocked ? 'blocked' : 'unblocked';
      setSuccess(`User ${action} successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const getCurrentUserId = (): number | null => {
    const token = AuthService.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={loadUsers}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">User Management</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={loadUsers}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      <div className="row">
        {users.map((user) => (
          <div key={user.id} className="col-md-6 col-lg-4 mb-4">
            <div className={`card h-100 ${user.is_blocked ? 'border-danger' : 'border-success'}`}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-shrink-0 me-3">
                    {user.photo_url ? (
                      <img 
                        src={user.photo_url} 
                        alt={`${user.name} ${user.surname}`}
                        className="rounded-circle"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/60x60?text=' + user.name.charAt(0);
                        }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: '#6c757d',
                          fontSize: '24px'
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="card-title mb-1">
                      {user.name} {user.surname}
                    </h6>
                    <p className="card-text text-muted mb-0">
                      @{user.username}
                    </p>
                    <span className={`badge ${user.role === 'Admin' ? 'bg-danger' : user.role === 'Guide' ? 'bg-primary' : 'bg-success'}`}>
                      {user.role === 'Admin' && <Crown size={12} className="me-1" />}
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="card-text small text-muted mb-1">
                    <strong>Email:</strong> {user.email}
                  </p>
                  {user.biography && (
                    <p className="card-text small text-muted mb-1">
                      <strong>Bio:</strong> {user.biography.length > 50 ? user.biography.substring(0, 50) + '...' : user.biography}
                    </p>
                  )}
                  {user.moto && (
                    <p className="card-text small text-muted mb-1">
                      <strong>Moto:</strong> {user.moto}
                    </p>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  {/* Uklonjen Active/Blocked badge */}
                  
                  {user.id !== currentUserId && user.role !== 'Admin' && (
                    <button
                      className={`btn btn-sm ${user.is_blocked ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                      disabled={user.role === 'Admin'}
                    >
                      {user.is_blocked ? <UserCheck size={14} className="me-1" /> : <UserX size={14} className="me-1" />}
                      {user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                  
                  {user.id === currentUserId && (
                    <span className="text-muted small">
                      <Shield size={12} className="me-1" />
                      Current User
                    </span>
                  )}
                  
                  {user.role === 'Admin' && user.id !== currentUserId && (
                    <span className="text-muted small">
                      <Crown size={12} className="me-1" />
                      Admin User
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center mt-5">
          <p className="text-muted">No users found.</p>
        </div>
      )}
    </div>
  );
}
