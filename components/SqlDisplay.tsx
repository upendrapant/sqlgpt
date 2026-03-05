"use client";

import { useState } from "react";
import { SqlResult, QueryResult } from "@/lib/types";

interface SqlDisplayProps {
    result: SqlResult;
    /** Called with the query results after successful execution */
    onQueryResult?: (result: QueryResult) => void;
    /** The schema ID to pass to the execute-query API */
    schemaId?: string;
}

/**
 * Simple keyword-based SQL syntax highlighter.
 * Wraps SQL keywords, strings, numbers, and comments in styled spans.
 */
function highlightSql(sql: string): React.ReactNode[] {
    const keywords = new Set([
        "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER",
        "ON", "AND", "OR", "NOT", "IN", "AS", "GROUP", "BY", "ORDER", "HAVING",
        "LIMIT", "OFFSET", "DISTINCT", "UNION", "ALL", "INSERT", "INTO",
        "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "DROP", "ALTER",
        "INDEX", "NULL", "IS", "LIKE", "BETWEEN", "EXISTS", "CASE", "WHEN",
        "THEN", "ELSE", "END", "ASC", "DESC", "COUNT", "SUM", "AVG", "MIN",
        "MAX", "COALESCE", "CAST", "DATE_TRUNC", "EXTRACT", "WITH", "OVER",
        "PARTITION", "RANK", "ROW_NUMBER", "DENSE_RANK", "CROSS", "FULL",
        "NATURAL", "USING", "FETCH", "FIRST", "NEXT", "ONLY", "ROWS",
        "PRECEDING", "FOLLOWING", "UNBOUNDED", "CURRENT", "ROW", "RANGE",
    ]);

    // Split into tokens while preserving whitespace
    const tokens = sql.split(/(\s+|'[^']*'|"[^"]*"|\b\d+\.?\d*\b|--|[(),;*])/g);

    return tokens.map((token, i) => {
        if (!token) return null;

        // Comments
        if (token.startsWith("--")) {
            return (
                <span key={i} className="text-gray-500 italic">
                    {token}
                </span>
            );
        }

        // Strings
        if (
            (token.startsWith("'") && token.endsWith("'")) ||
            (token.startsWith('"') && token.endsWith('"'))
        ) {
            return (
                <span key={i} className="text-emerald-400">
                    {token}
                </span>
            );
        }

        // Numbers
        if (/^\d+\.?\d*$/.test(token)) {
            return (
                <span key={i} className="text-amber-400">
                    {token}
                </span>
            );
        }

        // SQL keywords
        if (keywords.has(token.toUpperCase())) {
            return (
                <span key={i} className="text-violet-400 font-bold">
                    {token}
                </span>
            );
        }

        return <span key={i}>{token}</span>;
    });
}

export default function SqlDisplay({ result, onQueryResult, schemaId }: SqlDisplayProps) {
    const [copied, setCopied] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [execError, setExecError] = useState<string | null>(null);
    const isError = result.sql.trimStart().startsWith("--");

    const handleCopy = async () => {
        await navigator.clipboard.writeText(result.sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /** Execute the generated SQL against Supabase via our API route */
    const handleRunQuery = async () => {
        if (!schemaId) return;

        setIsExecuting(true);
        setExecError(null);

        try {
            const response = await fetch("/api/execute-query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sql: result.sql,
                    schemaId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setExecError(data.error || "Query execution failed");
                return;
            }

            // Pass the results up to the parent
            onQueryResult?.(data as QueryResult);
        } catch {
            setExecError("Network error. Please check your connection and try again.");
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            {/* ── SQL Code Block ──────────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                        {isError ? "Error" : "Generated SQL"}
                    </h3>
                    {!isError && (
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg
                         text-[var(--muted-foreground)] bg-[var(--card)]
                         border border-[var(--card-border)]
                         hover:text-[var(--foreground)] hover:border-[var(--accent)]/30
                         transition-all duration-200"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-3 h-3 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    )}
                </div>

                {isError ? (
                    /* ── Error state: red-tinted card ─────────────────────────── */
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-[var(--error)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <p className="text-sm text-red-300 leading-relaxed font-[family-name:var(--font-geist-mono)]">
                                {result.sql.replace(/^--\s*/, "")}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ── SQL code block with syntax highlighting ──────────────── */
                    <div className="rounded-xl bg-[#0d1117] border border-[var(--card-border)] overflow-hidden">
                        {/* Top bar mimicking a code editor */}
                        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--card-border)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                            <span className="ml-3 text-[10px] text-[var(--muted)] uppercase tracking-widest">
                                SQL
                            </span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-[family-name:var(--font-geist-mono)]">
                            <code>{highlightSql(result.sql)}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* ── Explanation ─────────────────────────────────────────────────── */}
            <div className="flex items-start gap-3 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent)]/10 p-4">
                <svg className="w-5 h-5 text-[var(--accent)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {result.explanation}
                </p>
            </div>

            {/* ── Run Query Button ────────────────────────────────────────────── */}
            {!isError && (
                <button
                    id="run-query-btn"
                    onClick={handleRunQuery}
                    disabled={isExecuting || !schemaId}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-[var(--success)]/10 text-[var(--success)] text-sm font-semibold
                     border border-[var(--success)]/20
                     hover:bg-[var(--success)]/20
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
                >
                    {isExecuting ? (
                        <>
                            {/* Spinning loader */}
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Executing…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                            Run Query
                        </>
                    )}
                </button>
            )}

            {/* ── Execution error (inline) ────────────────────────────────────── */}
            {execError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 animate-fade-in-up">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-[var(--error)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-red-300 mb-1">
                                Execution Failed
                            </p>
                            <p className="text-sm text-red-300/80">{execError}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
