import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserRole = "citizen" | "official" | "admin";

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("cittilenz_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setInitialized(true);
  }, []);

  const login = (email: string, password: string): boolean => {
    const credentials = {
      "citizen@gmail.com": { password: "citizen@123", role: "citizen" as UserRole },
      "official@gmail.com": { password: "official@123", role: "official" as UserRole },
      "admin@gmail.com": { password: "admin@123", role: "admin" as UserRole },
    };

    const cred = credentials[email as keyof typeof credentials];
    if (cred && cred.password === password) {
      const userData = { email, role: cred.role };
      setUser(userData);
      localStorage.setItem("cittilenz_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cittilenz_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
