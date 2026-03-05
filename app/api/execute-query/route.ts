import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase-server";

// ─── Request body validation ─────────────────────────────────────────────────

const requestBodySchema = z.object({
    sql: z.string().min(1, "SQL query must not be empty"),
    schemaId: z.string().min(1, "Schema ID must not be empty"),
});

// ─── Dangerous SQL keywords that indicate a mutation ─────────────────────────

const FORBIDDEN_KEYWORDS = [
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
    "CREATE",
    "EXEC",
    "EXECUTE",
] as const;

/** Maximum number of rows to return from any query */
const MAX_ROWS = 100;

/**
 * Validates that the SQL string is read-only by checking for mutation keywords.
 * Uses word-boundary matching to avoid false positives on column names
 * that happen to contain forbidden substrings (e.g. "updated_at").
 */
function isReadOnlyQuery(sql: string): boolean {
    // Normalise: collapse whitespace and strip inline/block comments
    const normalised = sql
        .replace(/--.*$/gm, "")         // strip single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, "") // strip block comments
        .toUpperCase();

    return !FORBIDDEN_KEYWORDS.some((keyword) =>
        // \b ensures we match whole words only
        new RegExp(`\\b${keyword}\\b`).test(normalised)
    );
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // 1. Parse and validate the request body
        const body = await request.json();
        const parseResult = requestBodySchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { sql } = parseResult.data;

        // 2. Security gate — reject anything that isn't a pure SELECT
        if (!isReadOnlyQuery(sql)) {
            return NextResponse.json(
                { error: "Only SELECT queries are allowed" },
                { status: 400 }
            );
        }

        // 3. Enforce a row cap by wrapping the query in a LIMIT clause.
        //    If the user's query already has a LIMIT that's smaller, Postgres
        //    will respect the innermost one; our outer LIMIT acts as a ceiling.
        const cappedSql = `SELECT * FROM (${sql}) AS _capped LIMIT ${MAX_ROWS}`;

        // 4. Execute via Supabase's rpc — calls the `execute_readonly_query`
        //    Postgres function which runs dynamic SQL and returns JSON rows.
        //    We use the server client (service role) so we bypass RLS and can
        //    query any of the seeded tables.
        const { data, error } = await supabaseServer.rpc(
            "execute_readonly_query",
            { query_text: cappedSql }
        );

        if (error) {
            console.error("[execute-query] Supabase RPC error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // 5. Extract column names from the first row (empty result → empty columns)
        const rows = (data as Record<string, unknown>[]) ?? [];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        return NextResponse.json({ columns, rows });
    } catch (error) {
        console.error("[execute-query] Error:", error);

        const message =
            error instanceof Error ? error.message : "An unexpected error occurred";

        return NextResponse.json(
            { error: `Query execution failed: ${message}` },
            { status: 500 }
        );
    }
}
