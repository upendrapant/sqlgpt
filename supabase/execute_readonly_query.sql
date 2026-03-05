-- ============================================================================
-- Postgres function: execute_readonly_query
-- 
-- Accepts a SQL string and returns the result as a JSON array.
-- This is called by the /api/execute-query API route via Supabase RPC.
--
-- SECURITY: The API route already validates that the SQL is a pure SELECT
-- before calling this function. This function is an additional safety net
-- that sets the transaction to READ ONLY mode, meaning even if a mutation
-- somehow slips past the API validation, Postgres will reject it.
--
-- Run this in the Supabase SQL Editor after running seed.sql.
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Set the transaction to read-only as an extra safety layer.
    -- Any INSERT, UPDATE, DELETE, etc. will be rejected by Postgres itself.
    SET TRANSACTION READ ONLY;

    -- Execute the dynamic SQL and aggregate the result into a JSON array
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || query_text || ') AS t'
        INTO result;

    RETURN result;
END;
$$;
