import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service role key.
 *
 * Unlike the public client (lib/supabase.ts), this one bypasses RLS
 * and should ONLY be used in API routes — never in client-side code.
 * The API route validates that queries are SELECT-only before executing,
 * so this is safe for read-only query execution.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);
