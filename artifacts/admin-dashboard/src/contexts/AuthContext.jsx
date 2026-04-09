import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { plansApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
                localStorage.setItem("admin_jwt", session.access_token);
                setUser(session.user);
            } else {
                localStorage.removeItem("admin_jwt");
                setUser(null);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.access_token) {
                localStorage.setItem("admin_jwt", session.access_token);
                setUser(session.user);
                if (event === "SIGNED_IN") {
                    plansApi.provision().catch(() => {});
                    navigate("/dashboard", { replace: true });
                }
            } else {
                localStorage.removeItem("admin_jwt");
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("admin_jwt");
        setUser(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
