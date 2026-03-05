"use client";

import { useState } from "react";
import { SqlResult, QueryResult } from "@/lib/types";
import ResultsTable from "@/components/ResultsTable";
import ResultsChart from "@/components/ResultsChart";
import { Button } from "@/components/ui/button";
import { Copy, Check, BarChart3, Table2, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SQL highlighting ─────────────────────────────────────────────────────────

const SQL_KEYWORDS = new Set([
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

function highlightSql(sql: string): React.ReactNode[] {
    const tokens = sql.split(/(\s+|'[^']*'|"[^"]*"|\b\d+\.?\d*\b|--|[(),;*])/g);
    return tokens.map((token, i) => {
        if (!token) return null;
        if (token.startsWith("--"))
            return <span key={i} className="text-muted-foreground italic">{token}</span>;
        if ((token.startsWith("'") && token.endsWith("'")) || (token.startsWith('"') && token.endsWith('"')))
            return <span key={i} className="text-emerald-500 dark:text-emerald-400">{token}</span>;
        if (/^\d+\.?\d*$/.test(token))
            return <span key={i} className="text-amber-500 dark:text-amber-400">{token}</span>;
        if (SQL_KEYWORDS.has(token.toUpperCase()))
            return <span key={i} className="text-violet-600 dark:text-violet-400 font-bold">{token}</span>;
        return <span key={i}>{token}</span>;
    });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMsg {
    id: string;
    role: "user" | "assistant";
    content: string;
    sqlResult?: SqlResult;
    queryResult?: QueryResult;
    isLoading?: boolean;
    error?: string;
}

type ViewMode = "chart" | "table";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatMessage({ message }: { message: ChatMsg }) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("chart");

    const isUser = message.role === "user";

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── User message ──────────────────────────────────────────────────────────
    if (isUser) {
        return (
            <div className="flex items-start gap-3 justify-end animate-fade-in-up">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                </div>
            </div>
        );
    }

    // ── Assistant: loading state ──────────────────────────────────────────────
    if (message.isLoading) {
        return (
            <div className="flex items-start gap-3 animate-fade-in-up">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="max-w-[80%] space-y-3">
                    <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating query and fetching results…</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Assistant: error state ────────────────────────────────────────────────
    if (message.error) {
        return (
            <div className="flex items-start gap-3 animate-fade-in-up">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="max-w-[80%]">
                    <div className="rounded-2xl rounded-tl-sm border border-destructive/30 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive">{message.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Assistant: full response ──────────────────────────────────────────────
    const { sqlResult, queryResult } = message;
    const showChart =
        queryResult && sqlResult && sqlResult.chartType !== "table" && viewMode === "chart";
    const showTable =
        queryResult && (sqlResult?.chartType === "table" || viewMode === "table");

    return (
        <div className="flex items-start gap-3 animate-fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="max-w-[85%] space-y-3 min-w-0 flex-1">
                {/* Explanation text */}
                {sqlResult?.explanation && (
                    <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                        <p className="text-sm leading-relaxed">{sqlResult.explanation}</p>
                    </div>
                )}

                {/* SQL code block */}
                {sqlResult?.sql && !sqlResult.sql.trimStart().startsWith("--") && (
                    <div className="rounded-xl border overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                                SQL
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleCopy(sqlResult.sql)}
                            >
                                {copied ? (
                                    <><Check className="w-3 h-3 mr-1 text-green-500" /> Copied</>
                                ) : (
                                    <><Copy className="w-3 h-3 mr-1" /> Copy</>
                                )}
                            </Button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-[family-name:var(--font-geist-mono)] bg-card">
                            <code>{highlightSql(sqlResult.sql)}</code>
                        </pre>
                    </div>
                )}

                {/* Results section */}
                {queryResult && (
                    <div className="rounded-xl border overflow-hidden">
                        {/* Results header with toggle */}
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                            <span className="text-xs font-medium text-muted-foreground">
                                {queryResult.rows.length} {queryResult.rows.length === 1 ? "row" : "rows"} returned
                                {queryResult.rows.length >= 100 && (
                                    <span className="text-muted-foreground/60 ml-1">(capped at 100)</span>
                                )}
                            </span>

                            {sqlResult && sqlResult.chartType !== "table" && (
                                <div className="flex items-center rounded-md bg-background border p-0.5">
                                    <Button
                                        variant={viewMode === "chart" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 px-2 text-[11px]"
                                        onClick={() => setViewMode("chart")}
                                    >
                                        <BarChart3 className="w-3 h-3 mr-1" />
                                        Chart
                                    </Button>
                                    <Button
                                        variant={viewMode === "table" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 px-2 text-[11px]"
                                        onClick={() => setViewMode("table")}
                                    >
                                        <Table2 className="w-3 h-3 mr-1" />
                                        Table
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-card">
                            {showChart && (
                                <ResultsChart
                                    columns={queryResult.columns}
                                    rows={queryResult.rows}
                                    chartType={sqlResult.chartType}
                                />
                            )}
                            {showTable && (
                                <ResultsTable result={queryResult} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
