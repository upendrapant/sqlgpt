import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for read-only operations.
 *
 * Why read-only? This app executes user-generated SQL queries against the
 * database. We use the anon key which respects Row Level Security (RLS),
 * and the API route additionally validates that queries are SELECT-only
 * before execution. This defense-in-depth approach ensures no mutations
 * can reach the database even if a malicious query slips through.
 *
 * The NEXT_PUBLIC_ prefix makes these variables available in client-side
 * code, which is safe because the anon key is designed to be public —
 * security is enforced by RLS policies, not key secrecy.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
