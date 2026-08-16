import * as React from "react";
import { api } from "./api.js";

export interface UserPermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, UserPermission>;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  hasPermission: (moduleName: string, action: "view" | "create" | "edit" | "delete") => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("supplyx_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await api.get<UserProfile>("/users/me");
      setUser(profile);
    } catch (err) {
      console.error("Failed to load user profile, logging out:", err);
      localStorage.removeItem("supplyx_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem("supplyx_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("supplyx_token");
    setUser(null);
    window.location.assign("/login");
  };

  const hasPermission = (moduleName: string, action: "view" | "create" | "edit" | "delete"): boolean => {
    if (!user) return false;
    if (user.role === "Superadmin") return true;
    
    // Check specific module permission
    const mod = user.permissions?.[moduleName];
    return !!(mod && mod[action]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
