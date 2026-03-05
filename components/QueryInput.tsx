"use client";

interface QueryInputProps {
    question: string;
    onQuestionChange: (question: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    /** Disable submit when no schema is selected or question is empty */
    disabled: boolean;
}

export default function QueryInput({
    question,
    onQuestionChange,
    onSubmit,
    isLoading,
    disabled,
}: QueryInputProps) {
    const canSubmit = !disabled && !isLoading && question.trim().length > 0;

    return (
        <div className="space-y-3">
            <label
                htmlFor="query-input"
                className="block text-sm font-medium text-[var(--muted-foreground)]"
            >
                Your Question
            </label>

            <div className="relative">
                <textarea
                    id="query-input"
                    rows={3}
                    value={question}
                    onChange={(e) => onQuestionChange(e.target.value)}
                    onKeyDown={(e) => {
                        // Submit on Cmd/Ctrl + Enter
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
                            e.preventDefault();
                            onSubmit();
                        }
                    }}
                    placeholder="Ask a question about your data in plain English…"
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)]
                     text-[var(--foreground)] text-sm leading-relaxed placeholder:text-[var(--muted)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 resize-none"
                />
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[11px] text-[var(--muted)]">
                    {question.trim().length > 0
                        ? "Press Ctrl+Enter to submit"
                        : "Select a schema above and type your question"}
                </p>

                <button
                    id="generate-sql-btn"
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-[var(--accent)] text-white text-sm font-semibold
                     hover:bg-[var(--accent-hover)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--accent)]
                     transition-all duration-200"
                >
                    {isLoading ? (
                        <>
                            {/* Spinner */}
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Generating…
                        </>
                    ) : (
                        <>
                            {/* Sparkle icon */}
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                                />
                            </svg>
                            Generate SQL
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
