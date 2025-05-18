export const CORS_OPTIONS = {
  origin: "http://localhost:4444", // replace with your origin
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
};
