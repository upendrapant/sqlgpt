"use client";

import { useState } from "react";
import { SchemaOption, SqlResult, QueryResult } from "@/lib/types";
import SchemaSelector from "@/components/SchemaSelector";
import QueryInput from "@/components/QueryInput";
import SqlDisplay from "@/components/SqlDisplay";
import ResultsTable from "@/components/ResultsTable";
import ResultsChart from "@/components/ResultsChart";

type ViewMode = "chart" | "table";

export default function Home() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [selectedSchema, setSelectedSchema] = useState<SchemaOption | null>(null);
  const [question, setQuestion] = useState("");
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  // ─── Submit handler: calls the generate-sql API route ───────────────────────
  const handleSubmit = async () => {
    if (!selectedSchema || !question.trim()) return;

    setIsLoading(true);
    setError(null);
    setSqlResult(null);
    setQueryResult(null);

    try {
      const response = await fetch("/api/generate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          schemaId: selectedSchema.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSqlResult(data as SqlResult);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reset handler: clears all state back to initial ────────────────────────
  const handleReset = () => {
    setSelectedSchema(null);
    setQuestion("");
    setSqlResult(null);
    setIsLoading(false);
    setError(null);
    setQueryResult(null);
    setViewMode("chart");
  };

  // Should we show chart mode? Only when chartType is bar/line AND we have results
  const showChart =
    queryResult &&
    sqlResult &&
    sqlResult.chartType !== "table" &&
    viewMode === "chart";

  const showTable =
    queryResult &&
    (sqlResult?.chartType === "table" || viewMode === "table");

  // Is the app in a "dirty" state where a reset would be useful?
  const isDirty = !!(selectedSchema || question || sqlResult || queryResult || error);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                QueryCraft
              </h1>
              <p className="text-[11px] text-[var(--muted)] leading-none">
                Natural Language → SQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset button — only visible when there's state to clear */}
            {isDirty && (
              <button
                id="reset-btn"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                  text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--card-border)]
                  hover:text-[var(--foreground)] hover:border-red-500/30 hover:bg-red-500/5
                  transition-all duration-200"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Reset
              </button>
            )}

            {/* GitHub-style badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-[11px] text-[var(--muted-foreground)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              AI-Powered
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Hero subtitle */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3 tracking-tight">
            Ask your database anything
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm max-w-xl mx-auto leading-relaxed">
            Select a schema, type a plain-English question, and get an executable SQL
            query with a clear explanation — instantly.
          </p>
        </div>

        {/* ── Card container ──────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Step 1: Schema Selector */}
          <section className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 shadow-lg shadow-black/10 animate-pulse-glow">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                1
              </span>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Choose a Database
              </h3>
            </div>
            <SchemaSelector
              selectedSchema={selectedSchema}
              onSelectSchema={setSelectedSchema}
              onExampleClick={(q) => setQuestion(q)}
            />
          </section>

          {/* Step 2: Query Input */}
          <section className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 shadow-lg shadow-black/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                2
              </span>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Ask a Question
              </h3>
            </div>
            <QueryInput
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={!selectedSchema}
            />
          </section>

          {/* Loading shimmer */}
          {isLoading && (
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 shadow-lg shadow-black/10">
              <div className="space-y-3">
                <div className="h-4 w-1/3 rounded-lg bg-[var(--card-border)] animate-shimmer" />
                <div className="h-24 rounded-xl bg-[var(--card-border)] animate-shimmer" />
                <div className="h-4 w-2/3 rounded-lg bg-[var(--card-border)] animate-shimmer" />
                <div className="h-4 w-1/2 rounded-lg bg-[var(--card-border)] animate-shimmer" />
              </div>
            </div>
          )}

          {/* API error */}
          {error && !isLoading && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--error)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">
                    Generation Failed
                  </p>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: SQL Display */}
          {sqlResult && !isLoading && (
            <section className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                  3
                </span>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Results
                </h3>
              </div>
              <SqlDisplay
                result={sqlResult}
                schemaId={selectedSchema?.id}
                onQueryResult={setQueryResult}
              />
            </section>
          )}

          {/* ── Query Results (chart + table with toggle) ──────────────── */}
          {queryResult && !isLoading && (
            <section className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 shadow-lg shadow-black/10 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                    4
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Query Results
                  </h3>
                </div>

                {/* ── Chart / Table toggle ──────────────────────────────── */}
                {/* Only show toggle when AI suggested a chart (not table) */}
                {sqlResult && sqlResult.chartType !== "table" && (
                  <div
                    id="view-toggle"
                    className="flex items-center rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-0.5"
                  >
                    <button
                      id="view-chart-btn"
                      onClick={() => setViewMode("chart")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 ${viewMode === "chart"
                          ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-sm"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      Chart
                    </button>
                    <button
                      id="view-table-btn"
                      onClick={() => setViewMode("table")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 ${viewMode === "table"
                          ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-sm"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                      </svg>
                      Table
                    </button>
                  </div>
                )}
              </div>

              {/* Chart view — shown first when AI recommended bar/line */}
              {showChart && (
                <div className="mb-5">
                  <ResultsChart
                    columns={queryResult.columns}
                    rows={queryResult.rows}
                    chartType={sqlResult.chartType}
                  />
                </div>
              )}

              {/* Table view — always shown for 'table' chartType, or when toggle is on table */}
              {showTable && (
                <ResultsTable result={queryResult} />
              )}
            </section>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--card-border)] py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
          <p>
            Built with Next.js, Vercel AI SDK, Supabase &amp; Recharts
          </p>
          <p>
            Portfolio demo · Read-only queries only
          </p>
        </div>
      </footer>
    </div>
  );
}
