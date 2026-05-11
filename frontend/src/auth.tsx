import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setSession, clearSession, getStoredUser, getStoredToken } from "./api";

type User = any;
type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (u: User) => void;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getStoredToken();
      const u = await getStoredUser();
      if (t && u) setUser(u);
      setLoading(false);
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const r: any = await api.login({ email, password });
    await setSession(r.access_token, r.user);
    setUser(r.user);
  }
  async function signUp(data: any) {
    const r: any = await api.signup(data);
    await setSession(r.access_token, r.user);
    setUser(r.user);
  }
  async function signOut() {
    setUser(null);
    await clearSession();
  }
  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signOut, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
