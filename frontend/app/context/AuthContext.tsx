import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../utils/api";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("access_token");
        const userData = await SecureStore.getItemAsync("user");
        if (accessToken && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log("Auto login failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post("/api/auth/signup/", {
      username: name,
      email,
      password,
      password2: password,
    });
    const { user, tokens } = res.data;
    await SecureStore.setItemAsync("access_token", tokens.access);
    await SecureStore.setItemAsync("refresh_token", tokens.refresh);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/signin/", { email, password });
    const { user, tokens } = res.data;
    await SecureStore.setItemAsync("access_token", tokens.access);
    await SecureStore.setItemAsync("refresh_token", tokens.refresh);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);