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

function detectAxes(columns: string[], rows: Record<string, unknown>[]) {
    if (rows.length === 0) return { xKey: null, yKeys: [] as string[] };
    const firstRow = rows[0];

    const xKey =
        columns.find((col) => {
            const val = firstRow[col];
            return typeof val === "string" && !/^\d+(\.\d+)?$/.test(val);
        }) ?? columns[0];

    const yKeys = columns.filter((col) => {
        if (col === xKey) return false;
        const val = firstRow[col];
        return typeof val === "number" || (typeof val === "string" && /^\d+(\.\d+)?$/.test(val));
    });

    return { xKey, yKeys: yKeys.length > 0 ? yKeys : [] };
}

const CHART_COLORS = [
    "hsl(245, 58%, 64%)",  // indigo
    "hsl(160, 60%, 45%)",  // emerald
    "hsl(38, 92%, 50%)",   // amber
    "hsl(330, 80%, 60%)",  // pink
    "hsl(217, 91%, 60%)",  // blue
    "hsl(263, 70%, 60%)",  // violet
    "hsl(25, 95%, 53%)",   // orange
    "hsl(174, 60%, 51%)",  // teal
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg text-popover-foreground">
            <p className="text-xs font-semibold mb-1">{label}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-medium">
                        {typeof entry.value === "number"
                            ? entry.value.toLocaleString()
                            : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function ResultsChart({ columns, rows, chartType }: ResultsChartProps) {
    if (chartType === "table") return null;
    if (rows.length === 0) return null;

    const { xKey, yKeys } = detectAxes(columns, rows);

    if (!xKey || yKeys.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">No numeric columns found to chart.</p>
                <p className="text-xs text-muted-foreground mt-1">Switch to table view to see your results.</p>
            </div>
        );
    }

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

    const sharedProps = {
        data: chartData,
        margin: { top: 8, right: 24, left: 8, bottom: 8 },
    };

    return (
        <div>
            <ResponsiveContainer width="100%" height={280}>
                {chartType === "bar" ? (
                    <BarChart {...sharedProps}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={xKey}
                            className="text-muted-foreground"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            tickLine={false}
                        />
                        <YAxis
                            className="text-muted-foreground"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))" }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
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
                            className="stroke-border"
                            vertical={false}
                        />
                        <XAxis
                            dataKey={xKey}
                            className="text-muted-foreground"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            tickLine={false}
                        />
                        <YAxis
                            className="text-muted-foreground"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
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
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 5,
                                    stroke: CHART_COLORS[idx % CHART_COLORS.length],
                                    strokeWidth: 2,
                                    fill: "hsl(var(--background))",
                                }}
                            />
                        ))}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
