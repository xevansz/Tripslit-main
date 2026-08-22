import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

const BASE =
  Updates.manifest?.extra?.backendUrl ??
  Constants.expoConfig?.extra?.backendUrl;

// const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Validate environment variable
if (!BASE) {
  console.warn("EXPO_PUBLIC_BACKEND_URL is not set. API calls will fail.");
}

export const TOKEN_KEY = "tripsplit.token";
export const USER_KEY = "tripsplit.user";

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  currency: string;
  language: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  owner_id: string;
  members: Array<{ id: string; name: string; avatar?: string; role: string }>;
  budget: number;
  spent: number;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  split_method: "equal" | "percentage" | "custom";
  split_between: string[];
  receipt?: string;
  created_at: string;
}

export interface Borrow {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  reason: string;
  due_date?: string;
  status: "pending" | "approved" | "rejected" | "settled";
  created_at: string;
}

export interface Balance {
  total: number;
  you_owe: number;
  owed_to_you: number;
  currency: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  if (!BASE) {
    throw new Error("EXPO_PUBLIC_BACKEND_URL is not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...((opts.headers as Record<string, string>) || {}),
  };

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...opts,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg =
        (data &&
          typeof data === "object" &&
          ((data as { detail?: string }).detail ||
            (data as { message?: string }).message)) ||
        `HTTP ${res.status}`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data as T;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw e;
  }
}

// Request body types
interface SignupBody {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}
interface LoginBody {
  email: string;
  password: string;
}
interface OtpBody {
  email: string;
  code: string;
}
interface ProfileBody {
  name: string;
  avatar?: string;
  currency?: string;
  language?: string;
}
interface TripBody {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  participants?: string[];
}
interface ExpenseBody {
  trip_id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  split_method?: "equal" | "percentage" | "custom";
  split_between?: string[];
  receipt?: string;
}
interface BorrowBody {
  from_user: string;
  to_user: string;
  amount: number;
  reason: string;
  due_date?: string;
}
interface WalletTxBody {
  trip_id: string;
  type: "contribute" | "withdraw" | "expense" | "refund";
  amount: number;
  member: string;
  note?: string;
}
interface GroupPayBody {
  trip_id?: string;
  merchant: string;
  amount: number;
  members: string[];
  split_method?: "equal" | "percentage" | "custom";
}
interface ChatBody {
  session_id: string;
  message: string;
  trip_context?: string;
}

export const api = {
  // Auth
  signup: (b: SignupBody) =>
    request<{ access_token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  login: (b: LoginBody) =>
    request<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  verifyOtp: (b: OtpBody) =>
    request<{ ok: boolean }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  updateProfile: (b: ProfileBody) =>
    request<User>("/auth/profile", { method: "PUT", body: JSON.stringify(b) }),
  me: () => request<User>("/auth/me"),
  // Trips
  createTrip: (b: TripBody) =>
    request<Trip>("/trips", { method: "POST", body: JSON.stringify(b) }),
  listTrips: () => request<Trip[]>("/trips"),
  getTrip: (id: string) => request<Trip>(`/trips/${id}`),
  // Expenses
  createExpense: (b: ExpenseBody) =>
    request<Expense>("/expenses", { method: "POST", body: JSON.stringify(b) }),
  listExpenses: (tripId: string) =>
    request<Expense[]>(`/expenses?trip_id=${encodeURIComponent(tripId)}`),
  balance: () => request<Balance>("/balance"),
  // Borrow
  createBorrow: (b: BorrowBody) =>
    request<Borrow>("/borrow", { method: "POST", body: JSON.stringify(b) }),
  listBorrows: () => request<Borrow[]>("/borrow"),
  // Vendors
  listVendors: (cat?: string, q?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("category", cat);
    if (q) p.set("q", q);
    return request<
      Array<{
        id: string;
        name: string;
        category: string;
        image: string;
        rating: number;
        price: number;
        currency: string;
      }>
    >(`/vendors${p.toString() ? `?${p.toString()}` : ""}`);
  },
  getVendor: (id: string) =>
    request<{
      id: string;
      name: string;
      category: string;
      description: string;
    }>(`/vendors/${encodeURIComponent(id)}`),
  bookVendor: (id: string) =>
    request<{ id: string; status: string }>(
      `/vendors/${encodeURIComponent(id)}/book`,
      { method: "POST" },
    ),
  // AI
  aiChat: (b: ChatBody) =>
    request<{ reply: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  // Wallet
  tripWallet: (tripId: string) =>
    request<{
      budget: number;
      collected: number;
      spent: number;
      balance: number;
      contributions: Array<{ name: string; required: number; paid: number }>;
      transactions: Array<{
        id: string;
        type: string;
        amount: number;
        member: string;
        note?: string;
        created_at: string;
      }>;
    }>(`/wallet/${encodeURIComponent(tripId)}`),
  walletTx: (b: WalletTxBody) =>
    request<{
      id: string;
      trip_id: string;
      type: string;
      amount: number;
      member: string;
      note?: string;
    }>("/wallet/tx", { method: "POST", body: JSON.stringify(b) }),
  // Group Pay
  groupPayCreate: (b: GroupPayBody) =>
    request<{
      id: string;
      status: string;
      members: Array<{ name: string; share: number; approved: boolean }>;
    }>("/grouppay", { method: "POST", body: JSON.stringify(b) }),
  groupPayApprove: (sid: string, member: string) =>
    request<{ status: string }>(
      `/grouppay/${encodeURIComponent(sid)}/approve?member=${encodeURIComponent(member)}`,
      { method: "POST" },
    ),
  // Notifications
  notifications: () =>
    request<
      Array<{
        id: string;
        type: string;
        title: string;
        time: string;
        read: boolean;
        icon: string;
      }>
    >("/notifications"),
  // Recommendations / Discover / Trip Tools / Achievements
  recommendations: () =>
    request<
      Array<{
        id: string;
        title: string;
        image: string;
        tag: string;
        match: number;
      }>
    >("/recommendations"),
  discover: () =>
    request<
      Array<{
        id: string;
        name: string;
        image: string;
        trips: string;
        ar: boolean;
      }>
    >("/discover"),
  tripTools: (tripId: string) =>
    request<{
      journal: unknown[];
      itinerary: unknown[];
      packing: unknown[];
      polls: unknown[];
      chat: unknown[];
      album: unknown[];
      settlement: unknown[];
      reports: unknown;
    }>(`/trip-tools/${encodeURIComponent(tripId)}`),
  achievements: () =>
    request<
      Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        earned: boolean;
        desc: string;
      }>
    >("/achievements"),
};

export async function setSession(token: string, user: User) {
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
