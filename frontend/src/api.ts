import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export const TOKEN_KEY = "tripsplit.token";
export const USER_KEY = "tripsplit.user";

async function authHeaders() {
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...(opts.headers || {}),
  };
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

export const api = {
  // Auth
  signup: (b: any) => request("/auth/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b: any) => request("/auth/login", { method: "POST", body: JSON.stringify(b) }),
  verifyOtp: (b: any) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify(b) }),
  updateProfile: (b: any) => request("/auth/profile", { method: "PUT", body: JSON.stringify(b) }),
  me: () => request("/auth/me"),
  // Trips
  createTrip: (b: any) => request("/trips", { method: "POST", body: JSON.stringify(b) }),
  listTrips: () => request<any[]>("/trips"),
  getTrip: (id: string) => request(`/trips/${id}`),
  // Expenses
  createExpense: (b: any) => request("/expenses", { method: "POST", body: JSON.stringify(b) }),
  listExpenses: (tripId: string) => request<any[]>(`/expenses?trip_id=${tripId}`),
  balance: () => request("/balance"),
  // Borrow
  createBorrow: (b: any) => request("/borrow", { method: "POST", body: JSON.stringify(b) }),
  listBorrows: () => request<any[]>("/borrow"),
  // Vendors
  listVendors: (cat?: string, q?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("category", cat);
    if (q) p.set("q", q);
    return request<any[]>(`/vendors${p.toString() ? `?${p.toString()}` : ""}`);
  },
  getVendor: (id: string) => request(`/vendors/${id}`),
  bookVendor: (id: string) => request(`/vendors/${id}/book`, { method: "POST" }),
  // AI
  aiChat: (b: any) => request<{ reply: string }>("/ai/chat", { method: "POST", body: JSON.stringify(b) }),
  // Wallet
  tripWallet: (tripId: string) => request(`/wallet/${tripId}`),
  walletTx: (b: any) => request("/wallet/tx", { method: "POST", body: JSON.stringify(b) }),
  // Group Pay
  groupPayCreate: (b: any) => request("/grouppay", { method: "POST", body: JSON.stringify(b) }),
  groupPayApprove: (sid: string, member: string) => request(`/grouppay/${sid}/approve?member=${encodeURIComponent(member)}`, { method: "POST" }),
  // Notifications
  notifications: () => request<any[]>("/notifications"),
  // Recommendations / Discover / Trip Tools / Achievements
  recommendations: () => request<any[]>("/recommendations"),
  discover: () => request<any[]>("/discover"),
  tripTools: (tripId: string) => request<any>(`/trip-tools/${tripId}`),
  achievements: () => request<any[]>("/achievements"),
};

export async function setSession(token: string, user: any) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}
export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
export async function getStoredUser() {
  const u = await AsyncStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}
export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
