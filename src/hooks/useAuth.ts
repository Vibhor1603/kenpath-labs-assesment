"use client";

import {
  getSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  updateDisplayName,
  type AuthUser,
} from "@/lib/auth";
import { useCallback, useSyncExternalStore } from "react";

let cached: AuthUser | null | undefined;
const listeners = new Set<() => void>();

function readCached(): AuthUser | null {
  if (cached === undefined) cached = getSessionUser();
  return cached;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function bump() {
  cached = getSessionUser();
  listeners.forEach((l) => l());
}

function getSnapshot(): AuthUser | null {
  return readCached();
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const register = useCallback(async (username: string, password: string) => {
    const result = await registerUser(username, password);
    if (result.ok) bump();
    return result;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginUser(username, password);
    if (result.ok) bump();
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    bump();
  }, []);

  const rename = useCallback((displayName: string) => {
    const next = updateDisplayName(displayName);
    if (next) bump();
    return next;
  }, []);

  return { user, ready: true, register, login, logout, rename };
}
