// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiService } from "../services/api";
import type { AuthContextType, RegisterData, User } from "../types/index";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token"),
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw) as User;
    } catch {
      console.log("user not found in localstorage");
    }
    return null;
  });
  const [initializing, setInitializing] = useState<boolean>(true);

  const setTokens = (
    access: string | null,
    refresh: string | null | undefined,
  ) => {
    if (access) {
      localStorage.setItem("access_token", access);
      setToken(access);
    } else {
      localStorage.removeItem("access_token");
      setToken(null);
    }

    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    } else if (refresh === null) {
      localStorage.removeItem("refresh_token");
    }
  };

  const persistUser = (u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem("user", JSON.stringify(u));
      else localStorage.removeItem("user");
    } catch {}
  };

  const tryRefresh = useCallback(async (refreshToken: string | null) => {
    if (!refreshToken) return false;
    try {
      const res = await apiService.refreshToken(refreshToken);
      const newAccess = (res as any).token ?? (res as any).token ?? null;
      const newRefresh = (res as any).refreshToken ?? refreshToken;
      if (newAccess) {
        setTokens(newAccess, newRefresh);

        console.log("new access token", newAccess);
        console.log("new refresh token", newRefresh);

        // Try to load profile with new access
        try {
          const prof = await apiService.me(newAccess);
          persistUser(prof as any);
          console.log("data from me in tryRefresh func", prof);

          return true;
        } catch {
          // ignore
        }
      }
      return false;
    } catch (err) {
      console.error("refresh failed", err);
      return false;
    }
  }, []);

  // load profile on app start if token exists
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!token) {
        if (mounted) setInitializing(false);
        return;
      }

      try {
        const prof = await apiService.me(token);
        if (!mounted) return;

        const apiUser = prof;
        if (apiUser) {
          const finalUser: User = {
            phoneNumber: apiUser.phoneNumber,
            role: apiUser.role,
            messageTemplate: apiUser.messageTemplate,
            companyPhone: apiUser.companyPhone,
            location: apiUser.location,
            companyName: apiUser.companyName,
            companyLogo: apiUser.companyLogo,
            description: apiUser.description,
            duration: apiUser.duration,
            activeSeance: apiUser.activeSeance,
            id: apiUser.id ?? null,
            email: apiUser.email ?? undefined,
            fullName: apiUser.fullName ?? undefined,
          };
          persistUser(finalUser);
        } else {
          persistUser(null);
        }
      } catch (err) {
        console.warn("me() failed", err);
        persistUser(null);
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [token, tryRefresh]);
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const res = await apiService.registerOwner(userData);

      const access = (res as any).access_token ?? (res as any).token ?? null;

      const refresh = (res as any).refresh_token ?? null;

      if (access) {
        setTokens(access, refresh);

        try {
          const prof = await apiService.me(access);
          persistUser(prof as any);
          console.log("data from me in register", prof);
        } catch {
          const payload = decodeJwtPayload(access);
          if (payload) persistUser(payload as User);
        }

        return true;
      }

      if ((res as any).success) {
        const loggedUser = await login(userData.phoneNumber, userData.password);
        return loggedUser !== null;
      }

      return false;
    } catch (err) {
      console.error("Register failed", err);
      return false;
    }
  };

  const login = async (
    phoneNumber: string,
    password: string,
  ): Promise<User | null> => {
    try {
      const res = await apiService.login(phoneNumber, password);

      const access = res.data?.token ?? null;
      const refresh = res.data?.refreshToken ?? null;

      if (!access) return null;

      setTokens(access, refresh);

      console.log("response from Login", res.data);

      const prof = await apiService.me(access);
      const apiUser = prof;
      if (apiUser) {
        const finalUser: User = {
          phoneNumber: apiUser.phoneNumber,
          role: apiUser.role,
          messageTemplate: apiUser.messageTemplate,
          companyPhone: apiUser.companyPhone,
          location: apiUser.location,
          companyName: apiUser.companyName,
          companyLogo: apiUser.companyLogo,
          description: apiUser.description,
          duration: apiUser.duration,
          activeSeance: apiUser.activeSeance,
          id: apiUser.id ?? null,
          email: apiUser.email ?? undefined,
          fullName: apiUser.fullName ?? undefined,
        };
        persistUser(finalUser);
        return finalUser;
      }

      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const logout = () => {
    persistUser(null);
    setTokens(null, null);
  };

  const value: AuthContextType = {
    user,
    token,
    initializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
