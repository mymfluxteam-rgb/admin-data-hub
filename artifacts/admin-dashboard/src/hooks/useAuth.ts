import { useState, useCallback } from "react";
import { authApi, type User } from "@/lib/api";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  token: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem("admin_jwt");
    return { token, user: null };
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res) {
      setState({ token: res.token, user: res.user });
      toast.success("Signed in successfully");
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setState({ token: null, user: null });
    toast.success("Signed out");
  }, []);

  return {
    user: state.user,
    token: state.token,
    isAuthenticated: !!state.token,
    login,
    logout,
  };
}
