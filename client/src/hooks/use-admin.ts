import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { getToken } from "./use-auth";

// Helper for authenticated requests
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// User type based on FastAPI response
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

// GET /api/admin/user/:email - Get user by email
export function useAdminUser(email: string) {
  return useQuery({
    queryKey: [api.admin.users.get.path, email],
    queryFn: async () => {
      const url = buildUrl(api.admin.users.get.path, { email });
      const res = await authFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      const response = await res.json();
      if (response.responseCode !== "00") {
        return null;
      }
      return response.data as User;
    },
    enabled: !!email,
  });
}

// GET /api/admin/user/:email/vehicles - Get user's vehicles
export function useAdminUserVehicles(email: string) {
  return useQuery({
    queryKey: [api.admin.users.getVehicles.path, email],
    queryFn: async () => {
      const url = buildUrl(api.admin.users.getVehicles.path, { email });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch user vehicles");
      const response = await res.json();
      if (response.responseCode !== "00") {
        return [];
      }
      return response.data || [];
    },
    enabled: !!email,
  });
}

// POST /api/admin/reset-password
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email, new_password }: { email: string; new_password: string }) => {
      const res = await authFetch(api.admin.users.resetPassword.path, {
        method: api.admin.users.resetPassword.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password }),
      });
      const response = await res.json();
      if (!res.ok || response.responseCode !== "00") {
        throw new Error(response.responseMessage || "Failed to reset password");
      }
      return response.data;
    },
  });
}

// Note: The FastAPI doesn't have a list all users endpoint based on the Swagger docs.
// The admin can only look up users by email. We'll need to handle this in the UI.
// For now, returning empty - this may need backend changes for a proper admin panel.
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users-search"],
    queryFn: async () => {
      // No list endpoint available - return empty
      // In a real app, you'd need a /admin/users endpoint
      return [] as User[];
    },
  });
}
