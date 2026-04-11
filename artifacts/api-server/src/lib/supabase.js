import { createClient } from "@supabase/supabase-js";

let client;

function getSupabaseClient() {
    const supabaseUrl = process.env["SUPABASE_URL"];
    const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

    if (!supabaseUrl) {
        throw new Error("SUPABASE_URL environment variable is required for database-backed API routes");
    }

    if (!supabaseServiceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required for database-backed API routes");
    }

    if (!client) {
        client = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    return client;
}

export const supabase = new Proxy({}, {
    get(_target, prop) {
        return getSupabaseClient()[prop];
    },
});
