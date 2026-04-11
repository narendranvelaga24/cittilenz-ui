import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, login as loginRequest } from "../../api/auth.api";
import { clearSession, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from "../../lib/storage";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);
  const [booting, setBooting] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    let active = true;
    async function syncUser() {
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const currentUser = await getCurrentUser();
        if (!active) return;
        setUser(currentUser);
        setStoredUser(currentUser);
      } catch {
        if (!active) return;
        clearSession();
        setToken(null);
        setUser(null);
      } finally {
        if (active) setBooting(false);
      }
    }
    syncUser();
    return () => {
      active = false;
    };
  }, [token]);

  async function login(credentials) {
    const data = await loginRequest(credentials);
    setStoredToken(data.token);
    setStoredUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      booting,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser: async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setStoredUser(currentUser);
        return currentUser;
      },
      token,
      user,
    }),
    [booting, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
