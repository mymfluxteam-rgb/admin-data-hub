import { useUserPlan } from "@/contexts/UserPlanContext";

/**
 * Maps a plan name to its allowed feature set.
 * Plans are matched case-insensitively. Any unrecognised plan is
 * treated as the most restrictive (Tester) to fail safely.
 */
const PLAN_FEATURES = {
    tester: {
        hwidFingerprinting: false,
        hwidAutoBan: false,
        hwidSwitchLimits: false,
        require2fa: false,
        ipBinding: false,
        ipWhitelist: false,
        autoDeduction: false,
        creditExpiry: false,
    },
    basic: {
        hwidFingerprinting: true,
        hwidAutoBan: false,
        hwidSwitchLimits: false,
        require2fa: false,
        ipBinding: false,
        ipWhitelist: false,
        autoDeduction: false,
        creditExpiry: true,
    },
    pro: {
        hwidFingerprinting: true,
        hwidAutoBan: true,
        hwidSwitchLimits: true,
        require2fa: true,
        ipBinding: true,
        ipWhitelist: true,
        autoDeduction: true,
        creditExpiry: true,
    },
    enterprise: {
        hwidFingerprinting: true,
        hwidAutoBan: true,
        hwidSwitchLimits: true,
        require2fa: true,
        ipBinding: true,
        ipWhitelist: true,
        autoDeduction: true,
        creditExpiry: true,
    },
};

const TESTER_FEATURES = PLAN_FEATURES.tester;
const PRO_FEATURES = PLAN_FEATURES.pro;

function resolveFeatures(planName) {
    if (!planName) return TESTER_FEATURES;
    const key = planName.toLowerCase().trim();
    if (PLAN_FEATURES[key]) return PLAN_FEATURES[key];
    // Any plan that isn't explicitly "tester" or "basic" gets full access
    if (key.includes("pro") || key.includes("enterprise") || key.includes("business")) {
        return PRO_FEATURES;
    }
    if (key.includes("basic") || key.includes("starter")) {
        return PLAN_FEATURES.basic;
    }
    // Unknown plan names → most restrictive
    return TESTER_FEATURES;
}

/**
 * Returns an object of booleans indicating which settings features
 * the current user's plan allows.
 */
export function usePlanFeatures() {
    const { plan } = useUserPlan();
    return {
        features: resolveFeatures(plan.planName),
        planName: plan.planName,
        planLoading: plan.loading,
    };
}
