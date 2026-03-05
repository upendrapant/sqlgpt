import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getSchemaById } from "@/lib/schemas";
import { SchemaOption, TableDefinition } from "@/lib/types";

// ─── Zod schema for the structured AI response ──────────────────────────────

const sqlResultSchema = z.object({
    sql: z.string().min(1, "SQL query must not be empty"),
    explanation: z.string().describe("Plain English explanation, max 2 sentences"),
    chartType: z
        .enum(["bar", "line", "table"])
        .describe(
            "Chart type: 'bar' for aggregations/grouping, 'line' for trends over time, 'table' for everything else"
        ),
});

// ─── Request body validation ─────────────────────────────────────────────────

const requestBodySchema = z.object({
    question: z.string().min(1, "Question must not be empty"),
    schemaId: z.string().min(1, "Schema ID must not be empty"),
});

// ─── Helper: format a schema into a readable string for the system prompt ────

function formatSchemaForPrompt(schema: SchemaOption): string {
    return schema.tables
        .map((table: TableDefinition) => {
            const columns = table.columns
                .map((col) => `    ${col.name} ${col.type} -- ${col.description}`)
                .join("\n");
            return `TABLE: ${table.name}\n${columns}`;
        })
        .join("\n\n");
}

// ─── Build the system prompt with dynamic schema + few-shot examples ─────────

function buildSystemPrompt(schema: SchemaOption): string {
    const schemaText = formatSchemaForPrompt(schema);

    return `You are a SQL expert assistant. You translate natural language questions into safe, read-only SQL queries.

DATABASE SCHEMA (${schema.name}):
${schemaText}

RULES:
1. Generate ONLY SELECT statements. Never use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or any other mutation.
2. Use only the tables and columns listed above — do not invent tables or columns.
3. Write clean, well-formatted SQL with appropriate aliases for readability.
4. If the question is ambiguous or cannot be answered with the available schema, set sql to "-- Cannot generate: [reason]" and explain why in the explanation field.
5. Keep your explanation to 1-2 concise sentences in plain English.
6. Choose the chartType based on the query intent:
   - "bar" → for aggregations, grouping, counts, comparisons across categories
   - "line" → for trends over time (dates, months, years on the x-axis)
   - "table" → for raw listings, detail lookups, or anything else

FEW-SHOT EXAMPLES:

Question: "What are the top 5 customers by total spending?"
Response:
{
  "sql": "SELECT c.name, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name ORDER BY total_spent DESC LIMIT 5",
  "explanation": "This query joins customers with their orders and ranks them by total spending, showing the top 5.",
  "chartType": "bar"
}

Question: "Show me monthly revenue for 2024"
Response:
{
  "sql": "SELECT DATE_TRUNC('month', created_at) AS month, SUM(total_amount) AS revenue FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01' GROUP BY month ORDER BY month",
  "explanation": "This query aggregates order totals by month for the year 2024 to show the revenue trend.",
  "chartType": "line"
}`;
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // 1. Parse and validate the request body
        const body = await request.json();
        const parseResult = requestBodySchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { question, schemaId } = parseResult.data;

        // 2. Look up the schema — return 404 if it doesn't exist
        const schema = getSchemaById(schemaId);
        if (!schema) {
            return NextResponse.json(
                { error: `Unknown schema: "${schemaId}". Valid options: ecommerce, saas, hr` },
                { status: 404 }
            );
        }

        // 3. Call Gemini via Vercel AI SDK's generateText with Output.object()
        //    The GOOGLE_GENERATIVE_AI_API_KEY env var is read automatically by @ai-sdk/google
        const { output } = await generateText({
            model: google("gemini-2.5-flash"),
            system: buildSystemPrompt(schema),
            prompt: question,
            output: Output.object({ schema: sqlResultSchema }),
        });

        // 4. Handle case where Gemini fails to produce a valid object
        if (!output) {
            return NextResponse.json(
                { error: "Gemini failed to generate a valid structured response. Please try rephrasing your question." },
                { status: 500 }
            );
        }

        // 5. Return the validated SqlResult
        return NextResponse.json(output);
    } catch (error) {
        // Log the full error server-side for debugging, return a clean message to the client
        console.error("[generate-sql] Error:", error);

        const message =
            error instanceof Error ? error.message : "An unexpected error occurred";

        return NextResponse.json(
            { error: `Failed to generate SQL: ${message}` },
            { status: 500 }
        );
    }
}
