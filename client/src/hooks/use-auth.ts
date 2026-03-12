import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LoginRequest, type RegisterRequest } from "@shared/routes";
import { useLocation } from "wouter";

// Token storage helpers
const TOKEN_KEY = "fleetpulse_token";
const USER_KEY = "fleetpulse_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Helper to make authenticated requests
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// GET /me - Check current session
export function useUser() {
  return useQuery({
    queryKey: [api.auth.user.path],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;

      const res = await authFetch(api.auth.user.path);
      if (res.status === 401) {
        clearToken();
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");

      const response = await res.json();
      if (response.data) {
        setStoredUser(response.data);
        return response.data;
      }
      return response;
    },
    retry: false,
    initialData: getStoredUser,
  });
}

// POST /login
export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      // Handle API error responses (responseCode !== "00" means error)
      if (!res.ok || response.responseCode !== "00") {
        throw new Error(response.responseMessage || response.message || "Invalid email or password");
      }

      return response;
    },
    onSuccess: (response) => {
      // Store token from response
      if (response.data?.access_token) {
        setToken(response.data.access_token);
      }

      // Store user data - FastAPI returns employee object
      const user = response.data?.employee || response.data?.user || response.data;
      if (user) {
        setStoredUser(user);
        queryClient.setQueryData([api.auth.user.path], user);
      }

      // Redirect based on role (admin check based on email or role field if exists)
      if (user?.role === 'admin') {
        setLocation("/admin/users");
      } else {
        setLocation("/dashboard");
      }
    },
  });
}

// POST /register
export function useRegister() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const validated = api.auth.register.input.parse(data);
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const response = await res.json();

      // Handle API error responses
      if (!res.ok || response.responseCode !== "00") {
        throw new Error(response.responseMessage || response.message || "Registration failed");
      }

      return response;
    },
    onSuccess: (response) => {
      // Store token if provided
      if (response.data?.access_token) {
        setToken(response.data.access_token);
      }

      const user = response.data?.user || response.data;
      if (user) {
        setStoredUser(user);
        queryClient.setQueryData([api.auth.user.path], user);
      }

      setLocation("/dashboard");
    },
  });
}

// POST /logout
export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      const res = await authFetch(api.auth.logout.path, {
        method: api.auth.logout.method,
      });
      // Even if logout fails on server, clear local state
      return res.ok;
    },
    onSuccess: () => {
      clearToken();
      queryClient.setQueryData([api.auth.user.path], null);
      setLocation("/login");
    },
    onError: () => {
      // Clear local state even on error
      clearToken();
      queryClient.setQueryData([api.auth.user.path], null);
      setLocation("/login");
    },
  });
}
