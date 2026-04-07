import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { planApi } from "@/lib/api";

const UserPlanContext = createContext(null);

export function UserPlanProvider({ children }) {
    const [plan, setPlan] = useState({
        planName: null,
        maxApplications: null,
        licensedUsers: null,
        currentApplications: 0,
        currentLicenses: 0,
        loading: true,
    });

    const refresh = useCallback(async () => {
        const token = localStorage.getItem("admin_jwt");
        if (!token) {
            setPlan((p) => ({ ...p, loading: false }));
            return;
        }
        const data = await planApi.getMyPlan();
        setPlan({ ...data, loading: false });
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <UserPlanContext.Provider value={{ plan, refreshPlan: refresh }}>
            {children}
        </UserPlanContext.Provider>
    );
}

export function useUserPlan() {
    const ctx = useContext(UserPlanContext);
    if (!ctx) throw new Error("useUserPlan must be used inside UserPlanProvider");
    return ctx;
}
