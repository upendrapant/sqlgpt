"use client";

import { QueryResult } from "@/lib/types";

interface ResultsTableProps {
    result: QueryResult;
}

/**
 * Renders query results as a clean, scrollable HTML table.
 * Shows the row count at the top and handles empty results gracefully.
 */
export default function ResultsTable({ result }: ResultsTableProps) {
    const { columns, rows } = result;

    // ── Empty state ──────────────────────────────────────────────────────────
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] p-8 text-center">
                <svg
                    className="w-10 h-10 mx-auto text-[var(--muted)] mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                </svg>
                <p className="text-sm text-[var(--muted-foreground)] font-medium">
                    No results found
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                    The query returned no rows.
                </p>
            </div>
        );
    }

    // ── Table with results ───────────────────────────────────────────────────
    return (
        <div className="space-y-3 animate-fade-in-up">
            {/* Row count badge */}
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                    </svg>
                    {rows.length} {rows.length === 1 ? "row" : "rows"} returned
                    {rows.length >= 100 && (
                        <span className="text-[var(--muted)] font-normal ml-1">(capped at 100)</span>
                    )}
                </span>
            </div>

            {/* Scrollable table container */}
            <div className="rounded-xl border border-[var(--card-border)] overflow-hidden">
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        {/* Table head */}
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--card-border)]">
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] whitespace-nowrap"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table body */}
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {rows.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className="hover:bg-[var(--accent)]/5 transition-colors duration-150"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={`${rowIdx}-${col}`}
                                            className="px-4 py-2.5 text-[var(--foreground)] whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-xs"
                                        >
                                            {formatCellValue(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/**
 * Format a cell value for display.
 * Handles null, undefined, objects, and primitives.
 */
function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}
