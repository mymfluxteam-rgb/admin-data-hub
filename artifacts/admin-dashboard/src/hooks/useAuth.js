import { useState, useCallback } from "react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
export function useAuth() {
    const [state, setState] = useState(() => {
        const token = localStorage.getItem("admin_jwt");
        return { token, user: null };
    });
    const login = useCallback(async (email, password) => {
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
