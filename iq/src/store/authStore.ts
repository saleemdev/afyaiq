import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  avatar: string;
  github_username: string;
  role: 'developer' | 'admin';
  is_verified_admin: boolean;
  api_key: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (githubToken: string) => Promise<void>;
  logout: () => void;
  applyForAdmin: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

// Mock data for development
const MOCK_USERS: { [key: string]: User } = {
  admin: {
    name: 'Sarah Chen',
    email: 'sarah.chen@afyaiq.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    github_username: 'sarahchen',
    role: 'admin',
    is_verified_admin: true,
    api_key: 'afyaiq_sk_admin_abc123def456'
  },
  developer1: {
    name: 'John Mwangi',
    email: 'john.mwangi@company.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    github_username: 'johnmwangi',
    role: 'developer',
    is_verified_admin: false,
    api_key: 'afyaiq_sk_dev_xyz789uvw456'
  },
  developer2: {
    name: 'Amara Okafor',
    email: 'amara.okafor@startup.io',
    avatar: 'https://i.pravatar.cc/150?img=32',
    github_username: 'amaraokafor',
    role: 'developer',
    is_verified_admin: false,
    api_key: 'afyaiq_sk_dev_qwe123rty456'
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (githubToken: string) => {
    set({ isLoading: true });
    try {
      // Mock login - simulate GitHub SSO
      // In production, this would call: POST /api/method/afyaiq.api.auth.github_login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: assign admin user for demo purposes
      const mockUser = MOCK_USERS.admin;

      set({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });

      localStorage.setItem('afyaiq_token', githubToken);
      localStorage.setItem('afyaiq_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('afyaiq_token');
    localStorage.removeItem('afyaiq_user');
  },

  applyForAdmin: async () => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    set({ isLoading: true });
    try {
      // Mock API call
      // In production: POST /api/method/afyaiq.api.auth.apply_for_admin
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user state
      const updatedUser = {
        ...user,
        // admin_application_status: 'pending' would be tracked in backend
      };

      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      console.error('Admin application failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      // Check localStorage first
      const cachedUser = localStorage.getItem('afyaiq_user');
      const token = localStorage.getItem('afyaiq_token');

      if (cachedUser && token) {
        set({
          user: JSON.parse(cachedUser),
          isAuthenticated: true,
          isLoading: false
        });
        return;
      }

      // In production: GET /api/method/frappe.auth.get_logged_user
      await new Promise(resolve => setTimeout(resolve, 500));

      set({ isLoading: false });
    } catch (error) {
      console.error('Fetch user failed:', error);
      set({ isLoading: false });
    }
  }
}));
