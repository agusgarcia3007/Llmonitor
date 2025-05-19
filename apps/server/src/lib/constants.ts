export const TRUSTED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4444",
];

export const CORS_OPTIONS = {
  origin: TRUSTED_ORIGINS,
  allowHeaders: ["Content-Type", "Authorization", "x-captcha-response"],
  allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
};

// Order status values
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_CHANNELS = ["tiendanube", "mercadolibre"] as const;

export type OrderChannel = (typeof ORDER_CHANNELS)[number];
