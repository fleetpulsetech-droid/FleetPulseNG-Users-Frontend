import { z } from 'zod';
import { insertUserSchema, insertVehicleSchema, users, vehicles } from './schema';

// API Base URL - always use Render backend directly
const API_BASE = 'https://fleetpulse-latest-moxp.onrender.com';

// Shared Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Standard response from FastAPI
export const standardResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.any().optional(),
});

// API Contract - calls FastAPI backend directly (no /api prefix on Render backend)
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: `${API_BASE}/login`,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: standardResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: `${API_BASE}/register`,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
        full_name: z.string(),
      }),
      responses: {
        200: standardResponseSchema,
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: `${API_BASE}/logout`,
      responses: {
        200: standardResponseSchema,
      },
    },
    user: {
      method: 'GET' as const,
      path: `${API_BASE}/me`,
      responses: {
        200: standardResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    users: {
      get: {
        method: 'GET' as const,
        path: `${API_BASE}/admin/user/:email`,
        responses: {
          200: standardResponseSchema,
          404: errorSchemas.notFound,
        },
      },
      getVehicles: {
        method: 'GET' as const,
        path: `${API_BASE}/admin/user/:email/vehicles`,
        responses: {
          200: standardResponseSchema,
        },
      },
      resetPassword: {
        method: 'POST' as const,
        path: `${API_BASE}/admin/reset-password`,
        input: z.object({
          email: z.string().email(),
          new_password: z.string(),
        }),
        responses: {
          200: standardResponseSchema,
        },
      },
      registerVehicle: {
        method: 'POST' as const,
        path: `${API_BASE}/admin/register-vehicle`,
        input: z.object({
          user_id: z.number(),
          sensor_imei: z.string(),
          vehicle_vin: z.string(),
          brand: z.string(),
          model: z.string(),
          year: z.number(),
          color: z.string(),
          plate_number: z.string(),
          fuel_type: z.string(),
          transmission: z.string(),
        }),
        responses: {
          200: standardResponseSchema,
        },
      },
      updateVehicle: {
        method: 'PUT' as const,
        path: `${API_BASE}/admin/vehicle/:vehicle_id`,
        input: z.object({
          brand: z.string().optional(),
          model: z.string().optional(),
          year: z.number().optional(),
          color: z.string().optional(),
          plate_number: z.string().optional(),
          fuel_type: z.string().optional(),
          transmission: z.string().optional(),
          is_active: z.boolean().optional(),
        }),
        responses: {
          200: standardResponseSchema,
        },
      },
    },
  },
  vehicles: {
    list: {
      method: 'GET' as const,
      path: `${API_BASE}/vehicles`,
      responses: {
        200: standardResponseSchema,
      },
    },
    getData: {
      method: 'GET' as const,
      path: `${API_BASE}/vehicle/:vehicle_sensor_imei/data`,
      responses: {
        200: standardResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    sync: {
      method: 'POST' as const,
      path: `${API_BASE}/sync`,
      responses: {
        200: standardResponseSchema,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type exports for auth
export type LoginRequest = z.infer<typeof api.auth.login.input>;
export type RegisterRequest = z.infer<typeof api.auth.register.input>;
