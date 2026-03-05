import { SchemaOption } from "./types";

/**
 * Pre-loaded database schemas that users can select from.
 * Each schema matches the tables/columns in supabase/seed.sql exactly.
 */
export const schemas: SchemaOption[] = [
    // ─── E-Commerce Schema ───────────────────────────────────────────────────
    {
        id: "ecommerce",
        name: "E-Commerce",
        description:
            "An online store with customers, products, orders, and line items. Great for revenue, inventory, and customer analysis queries.",
        tables: [
            {
                name: "customers",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique customer ID" },
                    { name: "name", type: "TEXT", description: "Full name" },
                    { name: "email", type: "TEXT", description: "Email address (unique)" },
                    { name: "city", type: "TEXT", description: "City of residence" },
                    { name: "country", type: "TEXT", description: "Country code (default: US)" },
                    { name: "created_at", type: "TIMESTAMP", description: "Account creation date" },
                ],
            },
            {
                name: "products",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique product ID" },
                    { name: "name", type: "TEXT", description: "Product name" },
                    { name: "category", type: "TEXT", description: "Category (Electronics, Office, Furniture, Accessories)" },
                    { name: "price", type: "DECIMAL(10,2)", description: "Unit price in USD" },
                    { name: "stock", type: "INTEGER", description: "Current inventory count" },
                    { name: "created_at", type: "TIMESTAMP", description: "Date product was added" },
                ],
            },
            {
                name: "orders",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique order ID" },
                    { name: "customer_id", type: "INTEGER", description: "FK → customers.id" },
                    { name: "total_amount", type: "DECIMAL(10,2)", description: "Order total in USD" },
                    { name: "status", type: "TEXT", description: "Order status: completed, shipped, or pending" },
                    { name: "created_at", type: "TIMESTAMP", description: "Date the order was placed" },
                ],
            },
            {
                name: "order_items",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique line item ID" },
                    { name: "order_id", type: "INTEGER", description: "FK → orders.id" },
                    { name: "product_id", type: "INTEGER", description: "FK → products.id" },
                    { name: "quantity", type: "INTEGER", description: "Number of units ordered" },
                    { name: "unit_price", type: "DECIMAL(10,2)", description: "Price per unit at time of purchase" },
                ],
            },
        ],
        exampleQuestions: [
            "What are the top 5 customers by total spending?",
            "Show me monthly revenue for 2024",
            "Which products have never been ordered?",
        ],
    },

    // ─── SaaS / Analytics Schema ─────────────────────────────────────────────
    {
        id: "saas",
        name: "SaaS Analytics",
        description:
            "A SaaS platform with users, subscription plans, and event tracking. Ideal for churn, engagement, and revenue analysis.",
        tables: [
            {
                name: "users",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique user ID" },
                    { name: "name", type: "TEXT", description: "Full name" },
                    { name: "email", type: "TEXT", description: "Email address (unique)" },
                    { name: "company", type: "TEXT", description: "Company name (nullable for solo users)" },
                    { name: "signed_up_at", type: "TIMESTAMP", description: "Registration date" },
                ],
            },
            {
                name: "plans",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique plan ID" },
                    { name: "name", type: "TEXT", description: "Plan name: Free, Pro, or Enterprise" },
                    { name: "price_monthly", type: "DECIMAL(10,2)", description: "Monthly price in USD" },
                    { name: "max_users", type: "INTEGER", description: "Maximum allowed team members" },
                    { name: "features", type: "TEXT[]", description: "Array of included feature names" },
                ],
            },
            {
                name: "subscriptions",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique subscription ID" },
                    { name: "user_id", type: "INTEGER", description: "FK → users.id" },
                    { name: "plan_id", type: "INTEGER", description: "FK → plans.id" },
                    { name: "status", type: "TEXT", description: "Subscription status: active or cancelled" },
                    { name: "started_at", type: "TIMESTAMP", description: "Subscription start date" },
                    { name: "cancelled_at", type: "TIMESTAMP", description: "Cancellation date (null if active)" },
                ],
            },
            {
                name: "events",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique event ID" },
                    { name: "user_id", type: "INTEGER", description: "FK → users.id" },
                    { name: "event_type", type: "TEXT", description: "Event type: login, export, upgrade, or invite" },
                    { name: "metadata", type: "JSONB", description: "Event-specific data (device, format, etc.)" },
                    { name: "created_at", type: "TIMESTAMP", description: "When the event occurred" },
                ],
            },
        ],
        exampleQuestions: [
            "How many users are on each plan?",
            "Show me the number of logins per month",
            "Which users have upgraded their plan?",
        ],
    },

    // ─── HR / Operations Schema ──────────────────────────────────────────────
    {
        id: "hr",
        name: "HR & Operations",
        description:
            "A company HR system with employees, departments, salary history, and attendance records. Perfect for headcount, payroll, and attendance queries.",
        tables: [
            {
                name: "departments",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique department ID" },
                    { name: "name", type: "TEXT", description: "Department name" },
                    { name: "location", type: "TEXT", description: "Office floor/location" },
                    { name: "manager_name", type: "TEXT", description: "Department manager's name" },
                ],
            },
            {
                name: "employees",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique employee ID" },
                    { name: "first_name", type: "TEXT", description: "First name" },
                    { name: "last_name", type: "TEXT", description: "Last name" },
                    { name: "email", type: "TEXT", description: "Work email (unique)" },
                    { name: "department_id", type: "INTEGER", description: "FK → departments.id" },
                    { name: "position", type: "TEXT", description: "Job title" },
                    { name: "hire_date", type: "DATE", description: "Date of hire" },
                    { name: "is_active", type: "BOOLEAN", description: "Whether the employee is currently active" },
                ],
            },
            {
                name: "salaries",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique salary record ID" },
                    { name: "employee_id", type: "INTEGER", description: "FK → employees.id" },
                    { name: "amount", type: "DECIMAL(10,2)", description: "Annual salary in USD" },
                    { name: "effective_date", type: "DATE", description: "Date the salary took effect" },
                    { name: "notes", type: "TEXT", description: "Reason for the salary entry (initial, raise, promotion)" },
                ],
            },
            {
                name: "attendance",
                columns: [
                    { name: "id", type: "SERIAL PRIMARY KEY", description: "Unique attendance record ID" },
                    { name: "employee_id", type: "INTEGER", description: "FK → employees.id" },
                    { name: "date", type: "DATE", description: "Attendance date" },
                    { name: "check_in", type: "TIME", description: "Check-in time" },
                    { name: "check_out", type: "TIME", description: "Check-out time (null if absent)" },
                    { name: "status", type: "TEXT", description: "Attendance status: present, absent, or late" },
                ],
            },
        ],
        exampleQuestions: [
            "What is the average salary per department?",
            "Which employees were late or absent this week?",
            "Show me the salary history for Engineering employees",
        ],
    },
];

/**
 * Look up a schema by its ID. Returns undefined if not found.
 * Used by the API route to resolve which schema context to send to Claude.
 */
export function getSchemaById(id: string): SchemaOption | undefined {
    return schemas.find((s) => s.id === id);
}
