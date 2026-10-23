import { UserAccount } from '../types';

const TOKEN_KEY = 'viralreader_auth_token';
const USER_CACHE_KEY = 'viralreader_cached_user';

type AuthListener = (user: UserAccount | null) => void;
const listeners = new Set<AuthListener>();

export const AuthService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  },

  getCachedUser(): UserAccount | null {
    try {
      const raw = localStorage.getItem(USER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCachedUser(user: UserAccount | null): void {
    try {
      if (user) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_CACHE_KEY);
      }
      listeners.forEach((l) => l(user));
    } catch {
      // ignore
    }
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getMe(): Promise<UserAccount | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        this.setCachedUser(data.user);
        return data.user;
      } else {
        this.setToken(null);
        this.setCachedUser(null);
        return null;
      }
    } catch {
      return this.getCachedUser();
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      this.setToken(data.token);
      this.setCachedUser(data.user);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error during login.',
      };
    }
  },

  async signup(
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed.' };
      }

      this.setToken(data.token);
      this.setCachedUser(data.user);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error during signup.',
      };
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    this.setToken(null);
    this.setCachedUser(null);
  },

  async updateProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
    preferences?: Partial<UserAccount['preferences']>;
  }): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile.' };
      }

      this.setCachedUser(data.user);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error updating profile.',
      };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return {
        success: Boolean(res.ok),
        message: data.message || 'Password reset request processed.',
      };
    } catch {
      return { success: false, message: 'Network error requesting password reset.' };
    }
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to delete account.' };

      this.setToken(null);
      this.setCachedUser(null);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error deleting account.' };
    }
  },
};
