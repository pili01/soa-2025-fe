import axios from 'axios';
import { LoginCredentials, RegisterUserRequest, AuthResponse, User } from '../models/User';

const API_BASE_URL = 'http://localhost:8080'; // Gateway port

class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      this.removeToken(); // Clear any existing token before login
      const response = await axios.post(`${API_BASE_URL}/api/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid username or password');
        } else if (error.response?.status === 403) {
          throw new Error('Account is blocked. Please contact administrator.');
        } else {
          throw new Error('Login failed. Please try again.');
        }
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async register(userData: FormData): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid role. Role must be Guide or Tourist.');
        } else if (error.response?.status === 409) {
          throw new Error('Username already exists');
        } else {
          throw new Error('Registration failed. Please try again.');
        }
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async getProfilePhoto(imgUrl: string): Promise<string> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      const response = await axios.get(`${API_BASE_URL}/api/image/img/${imgUrl}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to fetch profile photo');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async updateProfile(userData: FormData): Promise<{ message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      const response = await axios.put(`${API_BASE_URL}/api/stakeholders/updateProfile`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid role. Role must be Guide or Tourist.');
        } else if (error.response?.status === 409) {
          throw new Error('Username already exists');
        } else {
          throw new Error('Update failed. Please try again.');
        }
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async logout(): Promise<void> {
    this.removeToken();
  }

  static async updatePhoto(photo: File): Promise<{ message: string; photo_url: string; photoName: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      formData.append('image', photo);

      const response = await axios.post(`${API_BASE_URL}/api/image/save-image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid photo format');
        } else {
          throw new Error('Failed to update photo');
        }
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.get(`${API_BASE_URL}/api/stakeholders/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied. Admin role required.');
        } else {
          throw new Error('Failed to retrieve users.');
        }
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async blockUser(userId: number, isBlocked: boolean): Promise<{ message: string; user_id: number }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.put(`${API_BASE_URL}/api/stakeholders/admin/users/block`, {
        user_id: userId,
        is_blocked: isBlocked
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied. Admin role required.');
        } else if (error.response?.status === 404) {
          throw new Error('User not found.');
        } else {
          throw new Error('Failed to update user block status.');
        }
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async getMyProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token');
    const resp = await axios.get(`${API_BASE_URL}/api/stakeholders/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resp.data as User;
  }

  static setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  static removeToken(): void {
    localStorage.removeItem('token');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Decode JWT token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  static getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }

  static isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }
}

export default AuthService;
