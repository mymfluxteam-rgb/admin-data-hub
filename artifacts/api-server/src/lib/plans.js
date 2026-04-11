import { supabase } from "./supabase";

export const DEFAULT_PLAN_NAME = "Tester";
export const MANUAL_UPGRADE_PLAN_NAMES = ["Developer", "Seller"];

function normalizePlanName(planName) {
    return String(planName ?? "").trim().toLowerCase();
}

export async function getPlanByName(planName) {
    const { data, error } = await supabase
        .from("plans")
        .select("id, plan_name, max_applications, licensed_users")
        .ilike("plan_name", planName)
        .single();

    if (error || !data) {
        throw new Error(`${planName} plan not found`);
    }

    return data;
}

export async function getDefaultTesterPlanId() {
    const plan = await getPlanByName(DEFAULT_PLAN_NAME);
    return plan.id;
}

export async function resolveManualUpgradePlan({ plan_id, plan_name }) {
    let query = supabase
        .from("plans")
        .select("id, plan_name, max_applications, licensed_users");

    if (plan_id) {
        query = query.eq("id", plan_id);
    } else if (plan_name) {
        query = query.ilike("plan_name", plan_name);
    } else {
        throw new Error("plan_id or plan_name is required");
    }

    const { data: plan, error } = await query.single();

    if (error || !plan) {
        throw new Error("Plan not found");
    }

    const allowedPlanNames = MANUAL_UPGRADE_PLAN_NAMES.map(normalizePlanName);
    if (!allowedPlanNames.includes(normalizePlanName(plan.plan_name))) {
        throw new Error("Admins can only manually upgrade users to Developer or Seller");
    }

    return plan;
}