"use client";

import { useState } from "react";
import { schemas } from "@/lib/schemas";
import { SchemaOption } from "@/lib/types";

interface SchemaSelectorProps {
    selectedSchema: SchemaOption | null;
    onSelectSchema: (schema: SchemaOption) => void;
    /** Called when the user clicks an example question chip */
    onExampleClick: (question: string) => void;
}

export default function SchemaSelector({
    selectedSchema,
    onSelectSchema,
    onExampleClick,
}: SchemaSelectorProps) {
    const [isSchemaExpanded, setIsSchemaExpanded] = useState(false);

    return (
        <div className="space-y-4">
            {/* ── Schema dropdown ─────────────────────────────────────────────── */}
            <div>
                <label
                    htmlFor="schema-select"
                    className="block text-sm font-medium text-[var(--muted-foreground)] mb-2"
                >
                    Database Schema
                </label>
                <select
                    id="schema-select"
                    value={selectedSchema?.id ?? ""}
                    onChange={(e) => {
                        const schema = schemas.find((s) => s.id === e.target.value);
                        if (schema) {
                            onSelectSchema(schema);
                            setIsSchemaExpanded(false);
                        }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)]
                     text-[var(--foreground)] text-sm
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                     transition-all duration-200 cursor-pointer
                     appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
                     bg-[length:12px] bg-[right_16px_center] bg-no-repeat"
                >
                    <option value="" disabled>
                        Choose a schema…
                    </option>
                    {schemas.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── Schema description ──────────────────────────────────────────── */}
            {selectedSchema && (
                <div className="animate-fade-in-up">
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {selectedSchema.description}
                    </p>

                    {/* ── Collapsible table/column details ──────────────────────── */}
                    <button
                        onClick={() => setIsSchemaExpanded(!isSchemaExpanded)}
                        className="mt-3 flex items-center gap-2 text-xs font-medium text-[var(--accent)]
                       hover:text-[var(--accent-hover)] transition-colors duration-200"
                    >
                        <svg
                            className={`w-3 h-3 transition-transform duration-200 ${isSchemaExpanded ? "rotate-90" : ""
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        {isSchemaExpanded ? "Hide" : "View"} tables &amp; columns
                    </button>

                    {isSchemaExpanded && (
                        <div className="mt-3 space-y-3 animate-fade-in-up">
                            {selectedSchema.tables.map((table) => (
                                <div
                                    key={table.name}
                                    className="rounded-lg bg-[#0d1117] border border-[var(--card-border)] p-3"
                                >
                                    <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                                        {table.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {table.columns.map((col) => (
                                            <span
                                                key={col.name}
                                                title={`${col.type} — ${col.description}`}
                                                className="inline-block px-2 py-0.5 text-[11px] rounded-md
                                   bg-[var(--card)] text-[var(--muted-foreground)]
                                   border border-[var(--card-border)]
                                   hover:border-[var(--accent)] hover:text-[var(--foreground)]
                                   transition-colors duration-150 cursor-default"
                                            >
                                                {col.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Example question chips ────────────────────────────────── */}
                    <div className="mt-4">
                        <p className="text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wider">
                            Try an example
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedSchema.exampleQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => onExampleClick(q)}
                                    className="px-3 py-1.5 text-xs rounded-full
                             bg-[var(--accent-glow)] text-[var(--accent-hover)]
                             border border-[var(--accent)]/20
                             hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/40
                             transition-all duration-200 cursor-pointer"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
