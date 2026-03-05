"use client";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface ResultsChartProps {
    columns: string[];
    rows: Record<string, unknown>[];
    chartType: "bar" | "line" | "table";
}

/**
 * Auto-detect the best X-axis (first string/text column) and Y-axis (first numeric column)
 * from the query result set. Falls back gracefully if detection fails.
 */
function detectAxes(columns: string[], rows: Record<string, unknown>[]) {
    if (rows.length === 0) return { xKey: null, yKeys: [] as string[] };

    const firstRow = rows[0];

    // Find the first string-like column for the X axis label
    const xKey =
        columns.find((col) => {
            const val = firstRow[col];
            return typeof val === "string" && !/^\d+(\.\d+)?$/.test(val);
        }) ?? columns[0]; // fallback to first column

    // Collect all numeric columns for the Y axis values
    const yKeys = columns.filter((col) => {
        if (col === xKey) return false;
        const val = firstRow[col];
        return typeof val === "number" || (typeof val === "string" && /^\d+(\.\d+)?$/.test(val));
    });

    return { xKey, yKeys: yKeys.length > 0 ? yKeys : [] };
}

/**
 * A curated set of chart colors that harmonize with our indigo accent theme.
 * Used to differentiate multiple Y-axis series.
 */
const CHART_COLORS = [
    "#818cf8", // indigo-400
    "#34d399", // emerald-400
    "#fbbf24", // amber-400
    "#f472b6", // pink-400
    "#60a5fa", // blue-400
    "#a78bfa", // violet-400
    "#fb923c", // orange-400
    "#2dd4bf", // teal-400
];

/**
 * Custom tooltip styled to match the dark theme.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 shadow-xl shadow-black/30">
            <p className="text-xs font-semibold text-[#e4e7ef] mb-1.5">{label}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[#9ca3af]">{entry.name}:</span>
                    <span className="font-medium text-[#e4e7ef]">
                        {typeof entry.value === "number"
                            ? entry.value.toLocaleString()
                            : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * Renders query results as a Recharts BarChart or LineChart.
 * Returns null if chartType is 'table' (ResultsTable handles that case).
 */
export default function ResultsChart({ columns, rows, chartType }: ResultsChartProps) {
    // Table mode is handled by ResultsTable — render nothing here
    if (chartType === "table") return null;

    // Nothing to chart with no data
    if (rows.length === 0) return null;

    const { xKey, yKeys } = detectAxes(columns, rows);

    // If we can't find at least one numeric column, gracefully bail out
    if (!xKey || yKeys.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] p-6 text-center animate-fade-in-up">
                <svg
                    className="w-8 h-8 mx-auto text-[var(--muted)] mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                </svg>
                <p className="text-sm text-[var(--muted-foreground)]">
                    No numeric columns found to chart.
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                    Switch to table view to see your results.
                </p>
            </div>
        );
    }

    // Normalize row values: cast stringified numbers to actual numbers for Recharts
    const chartData = rows.map((row) => {
        const normalized: Record<string, unknown> = { ...row };
        for (const key of yKeys) {
            const val = normalized[key];
            if (typeof val === "string" && /^\d+(\.\d+)?$/.test(val)) {
                normalized[key] = parseFloat(val);
            }
        }
        return normalized;
    });

    // Shared axis/grid props
    const sharedProps = {
        data: chartData,
        margin: { top: 8, right: 24, left: 8, bottom: 8 },
    };

    return (
        <div className="animate-fade-in-up">
            <ResponsiveContainer width="100%" height={300}>
                {chartType === "bar" ? (
                    <BarChart {...sharedProps}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148, 163, 184, 0.08)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={xKey}
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "#334155" }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.06)" }} />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
                        />
                        {yKeys.map((key, idx) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={48}
                            />
                        ))}
                    </BarChart>
                ) : (
                    <LineChart {...sharedProps}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148, 163, 184, 0.08)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={xKey}
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={{ stroke: "#334155" }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
                        />
                        {yKeys.map((key, idx) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    fill: CHART_COLORS[idx % CHART_COLORS.length],
                                    stroke: "#111827",
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 5,
                                    stroke: CHART_COLORS[idx % CHART_COLORS.length],
                                    strokeWidth: 2,
                                    fill: "#111827",
                                }}
                            />
                        ))}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
