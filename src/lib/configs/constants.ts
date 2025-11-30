// Use local API routes by default, fallback to external backend if needed
// In browser, use relative path. In server, use full URL or relative path
export const BACKEND_API_ROOT = process.env.NEXT_PUBLIC_BACKEND_API_ROOT || "/api";
export const TIME_OUT_API = 30000; // 30 seconds
