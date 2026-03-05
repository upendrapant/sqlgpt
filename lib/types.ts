// ─── Database Schema Types ───────────────────────────────────────────────────

/** Describes a single column within a database table */
export interface TableColumn {
    name: string;
    type: string;
    description: string;
}

/** Describes a database table and its structure */
export interface TableDefinition {
    name: string;
    columns: TableColumn[];
    /** Optional sample rows to help the AI understand the data shape */
    sampleData?: Record<string, unknown>[];
}

/** A selectable database schema preset (e-commerce, SaaS, HR, etc.) */
export interface SchemaOption {
    id: string;
    name: string;
    description: string;
    tables: TableDefinition[];
    /** Sample questions users can click to auto-fill the query input */
    exampleQuestions: string[];
}

// ─── AI Response Types ───────────────────────────────────────────────────────

/** The structured output returned by the AI after processing a natural language query */
export interface SqlResult {
    sql: string;
    explanation: string;
    chartType: "bar" | "line" | "table";
}

// ─── Query Execution Types ───────────────────────────────────────────────────

/** The result of executing a SQL query against Supabase */
export interface QueryResult {
    columns: string[];
    rows: Record<string, unknown>[];
}
