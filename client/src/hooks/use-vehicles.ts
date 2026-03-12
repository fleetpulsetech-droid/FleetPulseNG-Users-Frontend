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

// Vehicle type based on FastAPI response
// Note: /api/vehicles returns minimal data (just vin and imei)
// Admin endpoint /api/admin/user/:email/vehicles returns full data
export interface Vehicle {
  id?: number;
  user_id?: number;
  sensor_imei: string;
  vehicle_vin: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_plate_number?: string;
  vehicle_fuel_type?: string;
  vehicle_transmission?: string;
  is_active?: boolean;
  created_at?: string;
}

// GET /api/vehicles - List user's vehicles
export function useVehicles() {
  return useQuery({
    queryKey: [api.vehicles.list.path],
    queryFn: async () => {
      const res = await authFetch(api.vehicles.list.path);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const response = await res.json();
      // FastAPI returns { responseCode, responseMessage, data }
      if (response.responseCode !== "00") {
        throw new Error(response.responseMessage || "Failed to fetch vehicles");
      }
      return (response.data || []) as Vehicle[];
    },
    refetchInterval: 10000, // Real-time updates every 10s
  });
}

// GET /api/vehicle/:imei/data - Get vehicle data by IMEI
export function useVehicleData(imei: string) {
  return useQuery({
    queryKey: [api.vehicles.getData.path, imei],
    queryFn: async () => {
      const url = buildUrl(api.vehicles.getData.path, { vehicle_sensor_imei: imei });
      const res = await authFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch vehicle data");
      const response = await res.json();
      if (response.responseCode !== "00") {
        return null;
      }
      return response.data;
    },
    enabled: !!imei,
    refetchInterval: 5000, // Faster updates for single vehicle view
  });
}

// POST /api/sync - Sync vehicles
export function useSyncVehicles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await authFetch(api.vehicles.sync.path, {
        method: api.vehicles.sync.method,
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Sync failed");
      const response = await res.json();
      if (response.responseCode !== "00") {
        throw new Error(response.responseMessage || "Sync failed");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] });
    },
  });
}

// POST /api/admin/register-vehicle - Admin registers vehicle
export function useRegisterVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      user_id: number;
      sensor_imei: string;
      vehicle_vin: string;
      vehicle_brand: string;
      vehicle_model: string;
      vehicle_year: number;
      vehicle_color: string;
      vehicle_plate_number: string;
      vehicle_fuel_type: string;
      vehicle_transmission: string;
    }) => {
      const res = await authFetch(api.admin.users.registerVehicle.path, {
        method: api.admin.users.registerVehicle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();
      if (!res.ok || response.responseCode !== "00") {
        throw new Error(response.responseMessage || "Failed to register vehicle");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] });
    },
  });
}

// PUT /api/admin/vehicle/:vehicle_id - Update vehicle details
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ vehicleId, data }: {
      vehicleId: number;
      data: Partial<{
        vehicle_brand: string;
        vehicle_model: string;
        vehicle_year: number;
        vehicle_color: string;
        vehicle_plate_number: string;
        vehicle_fuel_type: string;
        vehicle_transmission: string;
        vehicle_is_active: boolean;
      }>;
    }) => {
      const url = buildUrl(api.admin.users.updateVehicle.path, { vehicle_id: vehicleId });
      const res = await authFetch(url, {
        method: api.admin.users.updateVehicle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();
      if (!res.ok || response.responseCode !== "00") {
        throw new Error(response.responseMessage || "Failed to update vehicle");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] });
    },
  });
}
