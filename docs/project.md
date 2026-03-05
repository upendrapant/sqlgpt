# SOP: Text-to-SQL Query Generator
### Build Guide for Claude (Phase-by-Phase)

---

## Project Overview

A web app that lets non-technical users select a pre-loaded database schema, ask a question in plain English, and receive a working SQL query + plain-English explanation + auto-rendered chart of the results.

**Target Stack:**
- Next.js 14 (App Router)
- Vercel AI SDK (`@ai-sdk/gemini` + `generateObject`)
- Zod (structured output validation)
- Supabase (database + read-only query execution)
- Recharts (result visualization)
- Tailwind CSS (styling)

---

## Folder Structure

```
text-to-sql/
├── app/
│   ├── page.tsx                  # Main UI page
│   ├── layout.tsx                # Root layout
│   └── api/
│       └── generate-sql/
│           └── route.ts          # API route: Claude call via Vercel AI SDK
├── components/
│   ├── SchemaSelector.tsx        # Dropdown to pick a pre-loaded schema
│   ├── QueryInput.tsx            # Natural language input + submit button
│   ├── SqlDisplay.tsx            # Displays generated SQL + explanation
│   ├── ResultsTable.tsx          # Renders raw query results as a table
│   └── ResultsChart.tsx          # Recharts visualization
├── lib/
│   ├── schemas.ts                # Pre-loaded schema definitions (3 schemas)
│   ├── supabase.ts               # Supabase client (read-only)
│   └── types.ts                  # Shared TypeScript types
├── supabase/
│   └── seed.sql                  # SQL seed file for all 3 demo schemas
├── .env.local                    # API keys (never commit)
├── .env.example                  # Safe template to commit
└── README.md
```

---

## How to Use This SOP

1. Open a **fresh Claude conversation** for each phase
2. Paste the **Context Block** at the top of every prompt so Claude always knows the full picture
3. Then paste the **Phase Prompt** below it
4. After Claude finishes, do a quick **Checkpoint** before moving to the next phase
5. Never skip a checkpoint — catching issues phase by phase is much faster than debugging at the end

---

## Master Context Block
> **Paste this at the top of EVERY phase prompt.**

```
You are helping me build a Text-to-SQL web app for my Upwork portfolio.

Stack: Next.js 14 (App Router), Vercel AI SDK with @ai-sdk/anthropic, 
Zod, Supabase, Recharts, Tailwind CSS.

The app lets users:
1. Select a pre-loaded database schema (e-commerce, SaaS, or HR)
2. Type a natural language question
3. Get back a SQL query + plain-English explanation + chart type
4. Execute the query against Supabase (read-only)
5. See results rendered as a Recharts chart or table

Folder structure:
app/ → pages and API routes
components/ → all React components  
lib/ → schemas, supabase client, shared types
supabase/ → seed SQL

Rules:
- Use TypeScript throughout
- Use Tailwind for all styling
- Keep components focused and small
- Add comments for non-obvious logic
- Never expose API keys in client code
```

---

## Phase 1 — Project Scaffold & Environment Setup

**Goal:** Working Next.js project with all dependencies installed, environment variables configured, and folder structure in place.

**Prompt to give Claude:**

```
[PASTE MASTER CONTEXT BLOCK HERE]

--- PHASE 1: Project Scaffold ---

Set up the project from scratch. Do the following:

1. Give me the exact terminal commands to:
   - Create a new Next.js 14 project with TypeScript, App Router, and Tailwind CSS
   - Install all required dependencies:
     - @ai-sdk/anthropic
     - ai (vercel ai sdk)
     - @supabase/supabase-js
     - recharts
     - zod

2. Create the full folder structure as described above (empty files are fine, 
   just add a one-line comment in each so they're not blank)

3. Create .env.example with these variables (no real values):
   ANTHROPIC_API_KEY=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

4. Create lib/types.ts with these TypeScript types:
   - SchemaOption (id, name, description, tables)
   - TableColumn (name, type, description)
   - TableDefinition (name, columns, sampleData?)
   - SqlResult (sql, explanation, chartType: 'bar' | 'line' | 'table')
   - QueryResult (columns, rows)

Do not build any UI yet. Just scaffold and types.
```

**Checkpoint before Phase 2:**
- [ ] `npm run dev` runs without errors
- [ ] All folders and empty files exist
- [ ] `lib/types.ts` has all 4 types with no TypeScript errors
- [ ] `.env.example` is committed, `.env.local` is in `.gitignore`

---

## Phase 2 — Supabase Setup & Seed Data

**Goal:** Three demo schemas live in Supabase, seeded with realistic dummy data, and a working read-only client in the app.

**Prompt to give Claude:**

```
[PASTE MASTER CONTEXT BLOCK HERE]

--- PHASE 2: Supabase Setup & Seed Data ---

Create everything needed to set up the Supabase database.

1. Write supabase/seed.sql that creates and seeds 3 schemas:

   Schema A — E-commerce:
   Tables: customers, products, orders, order_items
   Seed with ~20 customers, ~15 products, ~30 orders, ~50 order_items
   Use realistic names, dates, and amounts.

   Schema B — SaaS/Analytics:
   Tables: users, plans, subscriptions, events
   Seed with ~20 users, 3 plans (free/pro/enterprise), ~25 subscriptions, ~60 events
   Events should have types like: 'login', 'upgrade', 'export', 'invite'

   Schema C — HR/Operations:
   Tables: employees, departments, salaries, attendance
   Seed with ~15 employees across 4 departments, salary history, ~30 attendance records

2. Create lib/schemas.ts that exports an array of SchemaOption objects.
   Each schema should include:
   - id, name, description
   - Full table and column definitions (matching the seed SQL exactly)
   - 3 example questions a user might ask

3. Create lib/supabase.ts with:
   - A standard Supabase client for read operations (uses anon key)
   - A note (as a comment) explaining why we use read-only access here

4. Give me step-by-step instructions to run the seed file in Supabase 
   (via the SQL editor in the dashboard).
```

**Checkpoint before Phase 3:**
- [ ] Seed SQL runs in Supabase dashboard without errors
- [ ] All 3 schemas have tables with data visible in Supabase Table Editor
- [ ] `lib/schemas.ts` exports correctly and TypeScript is happy
- [ ] `lib/supabase.ts` connects without errors (test with a quick console.log)

---

## Phase 3 — Claude API + Prompt Architecture

**Goal:** The API route calls Claude via Vercel AI SDK, returns a validated `SqlResult` object every time, and handles edge cases gracefully.

**Prompt to give Claude:**

```
[PASTE MASTER CONTEXT BLOCK HERE]

--- PHASE 3: Claude API + Prompt Architecture ---

Build the API route that powers the core feature.

1. Create app/api/generate-sql/route.ts:
   - Accepts POST with body: { question: string, schemaId: string }
   - Looks up the matching schema from lib/schemas.ts
   - Calls Claude using Vercel AI SDK's generateObject()
   - Returns a validated SqlResult: { sql, explanation, chartType }

2. The Zod schema for generateObject must enforce:
   - sql: non-empty string
   - explanation: plain English, max 2 sentences
   - chartType: 'bar' | 'line' | 'table'
     (Claude should choose based on query intent — 
      aggregations = bar, trends over time = line, everything else = table)

3. The system prompt must:
   - Include the full schema (all tables, columns, types) dynamically
   - Instruct Claude to write safe, read-only SQL (SELECT only, no mutations)
   - Include 2 few-shot examples showing question → sql + explanation + chartType
   - Tell Claude: if the question is ambiguous or unanswerable with the schema, 
     return sql: "-- Cannot generate: [reason]" and explain why in explanation

4. Add basic error handling:
   - If generateObject fails, return a 500 with a clean error message
   - Validate that schemaId exists before calling Claude

5. Export the route handler as named exports (GET not needed, just POST)

Do not build any UI yet. We will test this route manually with a curl 
command or API client.
```

**Checkpoint before Phase 4:**
- [ ] POST to `/api/generate-sql` returns valid JSON with `sql`, `explanation`, `chartType`
- [ ] Test with a simple question ("show me all customers") — SQL looks correct
- [ ] Test with an ambiguous question — returns the fallback gracefully
- [ ] No API keys visible in any client-side code

---

## Phase 4 — React UI

**Goal:** A clean, professional-looking UI that showcases the tool clearly to any Upwork client visiting your profile demo.

**Prompt to give Claude:**

```
[PASTE MASTER CONTEXT BLOCK HERE]

--- PHASE 4: React UI ---

Build the full frontend. Design should look clean and modern — 
this is a portfolio piece so it needs to look professional.

1. Update app/page.tsx as the main layout:
   - A header with the app name and a short tagline
   - Left/main area: SchemaSelector → QueryInput → SqlDisplay stacked vertically
   - Below SqlDisplay: placeholder area for results (we'll wire this in Phase 5)

2. Build components/SchemaSelector.tsx:
   - Dropdown showing the 3 schemas by name
   - When a schema is selected, show a small collapsible panel listing 
     its tables and columns (so users understand what they're querying)
   - Show the 3 example questions as clickable chips that auto-fill the input

3. Build components/QueryInput.tsx:
   - A textarea for the natural language question
   - A "Generate SQL" button
   - Loading state while the API is called (disable button + show spinner)

4. Build components/SqlDisplay.tsx:
   - Show the generated SQL in a styled code block (monospace font, 
     dark background, syntax-highlighted if easy to add)
   - Show the plain-English explanation below it
   - A "Run Query" button that will trigger execution (wire up in Phase 5)
   - If SQL starts with "--" (error fallback), show it as an error state

5. Wire up state in app/page.tsx:
   - Manage: selectedSchema, question, sqlResult, isLoading
   - On submit: call /api/generate-sql, update sqlResult
   - Pass props down to each component

Use Tailwind only. No external component libraries.
```

**Checkpoint before Phase 5:**
- [ ] UI renders correctly at desktop width
- [ ] Selecting a schema shows its tables and example question chips
- [ ] Clicking a chip fills the textarea
- [ ] Submitting a question shows the SQL + explanation
- [ ] Loading state works correctly
- [ ] Error fallback SQL renders as an error (not a code block)

---

## Phase 5 — Query Execution (Supabase Read-Only)

**Goal:** The "Run Query" button executes the generated SQL against Supabase and returns raw results safely.

**Prompt to give Claude:**

```
[PASTE MASTER CONTEXT BLOCK HERE]

--- PHASE 5: Query Execution ---

Add safe, read-only query execution against Supabase.

1. Create a new API route: app/api/execute-query/route.ts
   - Accepts POST with body: { sql: string, schemaId: string }
   - IMPORTANT: Validate that the SQL is read-only before executing:
     - Reject if it contains: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, GRANT
     - Return a 400 with message "Only SELECT queries are allowed" if rejected
   - Execute using Supabase's rpc or direct query
   - Return: { columns: string[], rows: Record<string, unknown>[] }
   - Cap results at 100 rows maximum

2. Update components/SqlDisplay.tsx:
   - Wire up the "Run Query" button to call /api/execute-query
   - Show a loading state while executing
   - On success: pass results up to parent via a callback prop
   - On error: show the error message inline

3. Update app/page.tsx:
   - Add queryResult state
   - Pass setQueryResult down to SqlDisplay
   - Render the results area below SqlDisplay (pass to ResultsTable as placeholder)

4. Build components/ResultsTable.tsx:
   - Accept columns and rows as props
   - Render a clean, scrollable HTML table with Tailwind styling
   - Show row count at the top ("12 rows returned")
   - Handle empty results gracefully

Do not build the chart yet — that's Phase 6.
```

**Checkpoint before Phase 6:**
- [ ] "Run Query" executes and returns data from Supabase
- [ ] Results show in the table correctly
- [ ] Mutation SQL (INSERT/UPDATE/DELETE) is blocked with a clear error
- [ ] Row count is capped at 100
- [ ] Empty results show a friendly message

---

## Phase 6 — Recharts Visualization

**Goal:** Results automatically render as the chart type Claude recommended, making the demo visually impressive.

**Prompt to give Claude:**

```
[PASTE MASTER CONTEXT BLOCK HERE]

--- PHASE 6: Recharts Visualization ---

Add automatic chart rendering based on the chartType Claude returned.

1. Build components/ResultsChart.tsx:
   - Accepts: columns, rows, chartType ('bar' | 'line' | 'table')
   - If chartType is 'table': render nothing (ResultsTable already handles this)
   - If chartType is 'bar': render a Recharts BarChart
   - If chartType is 'line': render a Recharts LineChart
   
   Chart rules:
   - Auto-detect: use the first string/text column as the X axis label
   - Auto-detect: use the first numeric column as the Y axis value
   - Include tooltip, legend, and axis labels
   - Make the chart responsive (use ResponsiveContainer with 100% width)
   - Height: 300px

2. Update app/page.tsx:
   - Below ResultsTable, add ResultsChart
   - Pass the same columns/rows plus the chartType from sqlResult
   - Show both the table AND the chart (chart first, table below)
   - If chartType is 'table', show only the table

3. Add a toggle button: "Chart View / Table View" so users can switch between them

4. Polish pass:
   - Make sure the full flow (select schema → type question → generate → run → 
     see chart) feels smooth with no layout jumps
   - Add a "Reset" button that clears everything back to the initial state
   - Verify the example question chips still work end-to-end
```

**Checkpoint — Final:**
- [ ] Bar chart renders for aggregation queries (e.g. "total orders per customer")
- [ ] Line chart renders for time-series queries (e.g. "signups per week")
- [ ] Table fallback works for non-visual queries
- [ ] Chart/Table toggle works
- [ ] Reset clears all state correctly
- [ ] Full end-to-end flow works for all 3 schemas

---

## Final Polish Checklist (Before Adding to Upwork Profile)

- [ ] Deploy to Vercel (connect GitHub repo, add env vars in Vercel dashboard)
- [ ] Add a README.md with: what it does, tech stack, how to run locally, 
      and a live demo link
- [ ] Test the 3 example questions for each schema — make sure they all 
      produce correct SQL and good charts
- [ ] Check on mobile — at minimum it should not be broken
- [ ] Record a 60-second Loom walkthrough for your Upwork profile 
      (schema select → question → SQL → chart is the money shot)

---

## Key Talking Points for Upwork Profile

When describing this project to clients, emphasize:

1. **Prompt engineering** — Schema-aware system prompts with few-shot examples 
   that force structured, validated JSON output every time
2. **Safe AI output handling** — SQL validation layer that prevents any 
   mutation queries from reaching the database
3. **Dynamic visualization** — Claude decides the chart type based on query 
   intent; the app renders accordingly without any hardcoding
4. **Production patterns** — Zod validation, error boundaries, read-only 
   database access, environment variable hygiene