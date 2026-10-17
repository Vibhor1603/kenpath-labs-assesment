"use client";

import {
  getSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  updateDisplayName,
  type AuthUser,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/browser";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    void (async () => {
      const sessionUser = await getSessionUser();
      if (!cancelled) {
        setUser(sessionUser);
        setReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void getSessionUser().then((u) => {
        if (!cancelled) setUser(u);
      });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const result = await registerUser(username, email, password);
      if (result.ok) setUser(result.user);
      return result;
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const rename = useCallback(async (displayName: string) => {
    const next = await updateDisplayName(displayName);
    if (next) setUser(next);
    return next;
  }, []);

  return { user, ready, register, login, logout, rename };
}
