"use client";

import { QueryResult } from "@/lib/types";

interface ResultsTableProps {
    result: QueryResult;
}

export default function ResultsTable({ result }: ResultsTableProps) {
    const { columns, rows } = result;

    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground font-medium">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">The query returned no rows.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-lg border">
            <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-muted/80 backdrop-blur-sm border-b">
                        {columns.map((col) => (
                            <th
                                key={col}
                                className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-muted/50 transition-colors duration-150">
                            {columns.map((col) => (
                                <td
                                    key={`${rowIdx}-${col}`}
                                    className="px-4 py-2.5 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-xs"
                                >
                                    {formatCellValue(row[col])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}
