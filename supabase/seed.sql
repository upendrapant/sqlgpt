-- ============================================================================
-- Text-to-SQL Generator — Master Seed File
-- Run this in the Supabase SQL Editor to create and seed all 3 demo schemas.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- SCHEMA A: E-COMMERCE
-- Tables: customers, products, orders, order_items
-- ──────────────────────────────────────────────────────────────────────────────

-- Drop existing tables (in reverse dependency order) to allow re-running
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'US',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO customers (name, email, city, country, created_at) VALUES
('Alice Johnson', 'alice@example.com', 'New York', 'US', '2024-01-05'),
('Bob Martinez', 'bob@example.com', 'Los Angeles', 'US', '2024-01-12'),
('Carol Chen', 'carol@example.com', 'San Francisco', 'US', '2024-01-18'),
('David Kim', 'david@example.com', 'Chicago', 'US', '2024-02-01'),
('Eva Nguyen', 'eva@example.com', 'Houston', 'US', '2024-02-10'),
('Frank Lopez', 'frank@example.com', 'Phoenix', 'US', '2024-02-15'),
('Grace Patel', 'grace@example.com', 'Philadelphia', 'US', '2024-02-22'),
('Henry Wilson', 'henry@example.com', 'San Antonio', 'US', '2024-03-01'),
('Irene Davis', 'irene@example.com', 'San Diego', 'US', '2024-03-08'),
('Jack Thompson', 'jack@example.com', 'Dallas', 'US', '2024-03-15'),
('Karen White', 'karen@example.com', 'Austin', 'US', '2024-03-22'),
('Leo Brown', 'leo@example.com', 'Seattle', 'US', '2024-04-01'),
('Mia Rodriguez', 'mia@example.com', 'Denver', 'US', '2024-04-10'),
('Noah Garcia', 'noah@example.com', 'Portland', 'US', '2024-04-18'),
('Olivia Singh', 'olivia@example.com', 'Miami', 'US', '2024-05-01'),
('Paul Adams', 'paul@example.com', 'Atlanta', 'US', '2024-05-12'),
('Quinn Miller', 'quinn@example.com', 'Boston', 'US', '2024-05-20'),
('Rachel Lee', 'rachel@example.com', 'Nashville', 'US', '2024-06-01'),
('Sam Taylor', 'sam@example.com', 'Charlotte', 'US', '2024-06-15'),
('Tina Clark', 'tina@example.com', 'Minneapolis', 'US', '2024-06-28');

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (name, category, price, stock) VALUES
('Wireless Mouse', 'Electronics', 29.99, 150),
('Mechanical Keyboard', 'Electronics', 89.99, 80),
('USB-C Hub', 'Electronics', 49.99, 120),
('Laptop Stand', 'Accessories', 39.99, 200),
('Webcam HD', 'Electronics', 69.99, 60),
('Desk Lamp', 'Office', 34.99, 90),
('Notebook Set', 'Office', 12.99, 300),
('Ergonomic Chair', 'Furniture', 299.99, 25),
('Standing Desk', 'Furniture', 449.99, 15),
('Monitor 27"', 'Electronics', 349.99, 40),
('Headphones', 'Electronics', 59.99, 100),
('Mouse Pad XL', 'Accessories', 19.99, 250),
('Cable Organizer', 'Accessories', 14.99, 180),
('Phone Stand', 'Accessories', 24.99, 140),
('Whiteboard', 'Office', 79.99, 45);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO orders (customer_id, total_amount, status, created_at) VALUES
(1, 119.98, 'completed', '2024-02-10'),
(2, 89.99, 'completed', '2024-02-15'),
(3, 349.99, 'completed', '2024-02-20'),
(1, 49.99, 'completed', '2024-03-01'),
(4, 159.98, 'completed', '2024-03-05'),
(5, 29.99, 'completed', '2024-03-10'),
(6, 449.99, 'completed', '2024-03-15'),
(7, 44.98, 'completed', '2024-03-20'),
(8, 299.99, 'completed', '2024-04-01'),
(3, 89.99, 'completed', '2024-04-05'),
(9, 69.99, 'completed', '2024-04-10'),
(10, 129.98, 'completed', '2024-04-15'),
(2, 34.99, 'completed', '2024-04-20'),
(11, 79.99, 'completed', '2024-05-01'),
(12, 409.98, 'shipped', '2024-05-05'),
(13, 59.99, 'shipped', '2024-05-10'),
(14, 89.99, 'shipped', '2024-05-15'),
(15, 149.98, 'pending', '2024-05-20'),
(16, 24.99, 'pending', '2024-05-25'),
(1, 69.99, 'completed', '2024-06-01'),
(17, 339.98, 'completed', '2024-06-05'),
(18, 29.99, 'completed', '2024-06-10'),
(5, 179.98, 'completed', '2024-06-15'),
(19, 449.99, 'shipped', '2024-06-20'),
(20, 14.99, 'completed', '2024-06-25'),
(8, 89.99, 'pending', '2024-07-01'),
(4, 59.99, 'completed', '2024-07-05'),
(11, 349.99, 'completed', '2024-07-10'),
(6, 119.98, 'shipped', '2024-07-15'),
(13, 39.99, 'completed', '2024-07-20');

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL
);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 29.99),
(1, 2, 1, 89.99),
(2, 2, 1, 89.99),
(3, 10, 1, 349.99),
(4, 3, 1, 49.99),
(5, 1, 2, 29.99),
(5, 4, 1, 39.99),
(5, 12, 1, 19.99),
(6, 1, 1, 29.99),
(7, 9, 1, 449.99),
(8, 13, 1, 14.99),
(8, 1, 1, 29.99),
(9, 8, 1, 299.99),
(10, 2, 1, 89.99),
(11, 5, 1, 69.99),
(12, 11, 1, 59.99),
(12, 5, 1, 69.99),
(13, 6, 1, 34.99),
(14, 15, 1, 79.99),
(15, 10, 1, 349.99),
(15, 11, 1, 59.99),
(16, 11, 1, 59.99),
(17, 2, 1, 89.99),
(18, 3, 1, 49.99),
(18, 4, 1, 39.99),
(18, 14, 1, 24.99),
(19, 14, 1, 24.99),
(20, 5, 1, 69.99),
(21, 10, 1, 349.99),
(21, 12, 2, 19.99),
(22, 1, 1, 29.99),
(23, 3, 1, 49.99),
(23, 4, 1, 39.99),
(23, 2, 1, 89.99),
(24, 9, 1, 449.99),
(25, 13, 1, 14.99),
(26, 2, 1, 89.99),
(27, 11, 1, 59.99),
(28, 10, 1, 349.99),
(29, 1, 2, 29.99),
(29, 11, 1, 59.99),
(30, 4, 1, 39.99),
(15, 7, 1, 12.99),
(16, 7, 1, 12.99),
(5, 7, 3, 12.99),
(12, 7, 2, 12.99),
(9, 6, 1, 34.99),
(20, 14, 1, 24.99),
(23, 13, 1, 14.99),
(28, 15, 1, 79.99);


-- ──────────────────────────────────────────────────────────────────────────────
-- SCHEMA B: SAAS / ANALYTICS
-- Tables: users, plans, subscriptions, events
-- ──────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    signed_up_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email, company, signed_up_at) VALUES
('Liam Foster', 'liam@startup.io', 'StartupHQ', '2024-01-03'),
('Emma Collins', 'emma@devstudio.co', 'DevStudio', '2024-01-08'),
('Noah Rivera', 'noah@bigcorp.com', 'BigCorp', '2024-01-15'),
('Sophia Turner', 'sophia@freelance.dev', NULL, '2024-01-22'),
('James Murphy', 'james@analytics.co', 'DataWave', '2024-02-01'),
('Isabella Scott', 'isabella@design.io', 'PixelCraft', '2024-02-10'),
('Benjamin Hall', 'benjamin@saasly.com', 'SaaSly', '2024-02-18'),
('Charlotte Young', 'charlotte@techstack.io', 'TechStack', '2024-02-25'),
('Lucas King', 'lucas@appmaker.dev', NULL, '2024-03-03'),
('Amelia Wright', 'amelia@growthlab.co', 'GrowthLab', '2024-03-10'),
('Mason Green', 'mason@cloudops.io', 'CloudOps', '2024-03-18'),
('Harper Baker', 'harper@indiehacker.com', NULL, '2024-03-25'),
('Ethan Adams', 'ethan@agency.co', 'AgencyPlus', '2024-04-02'),
('Avery Nelson', 'avery@startup2.io', 'LaunchPad', '2024-04-10'),
('Alexander Hill', 'alex@enterprise.co', 'EnterpriseHQ', '2024-04-18'),
('Ella Campbell', 'ella@solodev.com', NULL, '2024-05-01'),
('William Morgan', 'william@platform.io', 'PlatformX', '2024-05-10'),
('Scarlett Brooks', 'scarlett@marketing.co', 'MarketBoost', '2024-05-20'),
('Daniel Reed', 'daniel@webapp.dev', NULL, '2024-06-01'),
('Aria Cooper', 'aria@consulting.co', 'ConsultPro', '2024-06-15');

-- Plans
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    max_users INTEGER NOT NULL,
    features TEXT[] NOT NULL
);

INSERT INTO plans (name, price_monthly, max_users, features) VALUES
('Free', 0.00, 1, ARRAY['Basic analytics', '100 events/day', 'Email support']),
('Pro', 29.00, 10, ARRAY['Advanced analytics', '10K events/day', 'Priority support', 'API access', 'Custom dashboards']),
('Enterprise', 99.00, 100, ARRAY['Unlimited analytics', 'Unlimited events', 'Dedicated support', 'API access', 'Custom dashboards', 'SSO', 'Audit logs']);

-- Subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP
);

INSERT INTO subscriptions (user_id, plan_id, status, started_at, cancelled_at) VALUES
(1, 1, 'cancelled', '2024-01-03', '2024-02-15'),
(1, 2, 'active', '2024-02-15', NULL),
(2, 2, 'active', '2024-01-08', NULL),
(3, 3, 'active', '2024-01-15', NULL),
(4, 1, 'active', '2024-01-22', NULL),
(5, 2, 'active', '2024-02-01', NULL),
(6, 1, 'cancelled', '2024-02-10', '2024-04-01'),
(6, 2, 'active', '2024-04-01', NULL),
(7, 3, 'active', '2024-02-18', NULL),
(8, 2, 'active', '2024-02-25', NULL),
(9, 1, 'active', '2024-03-03', NULL),
(10, 2, 'cancelled', '2024-03-10', '2024-05-20'),
(10, 3, 'active', '2024-05-20', NULL),
(11, 2, 'active', '2024-03-18', NULL),
(12, 1, 'active', '2024-03-25', NULL),
(13, 2, 'active', '2024-04-02', NULL),
(14, 1, 'cancelled', '2024-04-10', '2024-05-01'),
(14, 2, 'active', '2024-05-01', NULL),
(15, 3, 'active', '2024-04-18', NULL),
(16, 1, 'active', '2024-05-01', NULL),
(17, 2, 'active', '2024-05-10', NULL),
(18, 2, 'active', '2024-05-20', NULL),
(19, 1, 'active', '2024-06-01', NULL),
(20, 1, 'cancelled', '2024-06-15', '2024-07-01'),
(20, 2, 'active', '2024-07-01', NULL);

-- Events (user activity tracking)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO events (user_id, event_type, metadata, created_at) VALUES
-- January logins & activity
(1, 'login', '{"device": "desktop"}', '2024-01-03 09:00:00'),
(1, 'export', '{"format": "csv", "rows": 150}', '2024-01-03 09:30:00'),
(2, 'login', '{"device": "desktop"}', '2024-01-08 10:00:00'),
(3, 'login', '{"device": "mobile"}', '2024-01-15 08:00:00'),
(3, 'invite', '{"invited_email": "team@bigcorp.com"}', '2024-01-15 08:30:00'),
(4, 'login', '{"device": "desktop"}', '2024-01-22 11:00:00'),
-- February
(1, 'upgrade', '{"from": "Free", "to": "Pro"}', '2024-02-15 14:00:00'),
(1, 'login', '{"device": "desktop"}', '2024-02-15 14:05:00'),
(5, 'login', '{"device": "desktop"}', '2024-02-01 09:00:00'),
(5, 'export', '{"format": "pdf", "rows": 80}', '2024-02-01 09:45:00'),
(6, 'login', '{"device": "mobile"}', '2024-02-10 12:00:00'),
(7, 'login', '{"device": "desktop"}', '2024-02-18 10:00:00'),
(7, 'invite', '{"invited_email": "dev@saasly.com"}', '2024-02-18 10:15:00'),
(8, 'login', '{"device": "desktop"}', '2024-02-25 09:00:00'),
-- March
(9, 'login', '{"device": "desktop"}', '2024-03-03 11:00:00'),
(10, 'login', '{"device": "desktop"}', '2024-03-10 08:00:00'),
(10, 'export', '{"format": "csv", "rows": 500}', '2024-03-10 08:20:00'),
(11, 'login', '{"device": "mobile"}', '2024-03-18 09:00:00'),
(11, 'invite', '{"invited_email": "ops@cloudops.io"}', '2024-03-18 09:10:00'),
(12, 'login', '{"device": "desktop"}', '2024-03-25 10:00:00'),
(1, 'login', '{"device": "mobile"}', '2024-03-28 16:00:00'),
(1, 'export', '{"format": "csv", "rows": 200}', '2024-03-28 16:30:00'),
(3, 'login', '{"device": "desktop"}', '2024-03-30 09:00:00'),
(3, 'invite', '{"invited_email": "hr@bigcorp.com"}', '2024-03-30 09:15:00'),
-- April
(13, 'login', '{"device": "desktop"}', '2024-04-02 10:00:00'),
(14, 'login', '{"device": "desktop"}', '2024-04-10 11:00:00'),
(15, 'login', '{"device": "desktop"}', '2024-04-18 08:00:00'),
(15, 'invite', '{"invited_email": "cto@enterprise.co"}', '2024-04-18 08:20:00'),
(2, 'login', '{"device": "desktop"}', '2024-04-20 09:00:00'),
(2, 'export', '{"format": "pdf", "rows": 120}', '2024-04-20 09:30:00'),
(5, 'login', '{"device": "mobile"}', '2024-04-22 14:00:00'),
(7, 'login', '{"device": "desktop"}', '2024-04-25 10:00:00'),
-- May
(6, 'upgrade', '{"from": "Free", "to": "Pro"}', '2024-04-01 11:00:00'),
(10, 'upgrade', '{"from": "Pro", "to": "Enterprise"}', '2024-05-20 09:00:00'),
(14, 'upgrade', '{"from": "Free", "to": "Pro"}', '2024-05-01 10:00:00'),
(16, 'login', '{"device": "desktop"}', '2024-05-01 12:00:00'),
(17, 'login', '{"device": "desktop"}', '2024-05-10 09:00:00'),
(17, 'export', '{"format": "csv", "rows": 300}', '2024-05-10 09:20:00'),
(18, 'login', '{"device": "mobile"}', '2024-05-20 08:00:00'),
(18, 'invite', '{"invited_email": "team@marketboost.co"}', '2024-05-20 08:10:00'),
(1, 'login', '{"device": "desktop"}', '2024-05-25 09:00:00'),
(3, 'export', '{"format": "csv", "rows": 1000}', '2024-05-28 10:00:00'),
-- June
(19, 'login', '{"device": "desktop"}', '2024-06-01 11:00:00'),
(20, 'login', '{"device": "desktop"}', '2024-06-15 09:00:00'),
(20, 'upgrade', '{"from": "Free", "to": "Pro"}', '2024-07-01 10:00:00'),
(8, 'login', '{"device": "mobile"}', '2024-06-18 14:00:00'),
(8, 'export', '{"format": "pdf", "rows": 75}', '2024-06-18 14:15:00'),
(11, 'login', '{"device": "desktop"}', '2024-06-20 10:00:00'),
(13, 'login', '{"device": "desktop"}', '2024-06-22 09:00:00'),
(13, 'export', '{"format": "csv", "rows": 250}', '2024-06-22 09:25:00'),
(15, 'login', '{"device": "desktop"}', '2024-06-25 08:00:00'),
(5, 'invite', '{"invited_email": "analyst@datawave.co"}', '2024-06-28 11:00:00'),
-- July
(1, 'login', '{"device": "desktop"}', '2024-07-01 09:00:00'),
(2, 'login', '{"device": "desktop"}', '2024-07-03 10:00:00'),
(7, 'export', '{"format": "csv", "rows": 450}', '2024-07-05 11:00:00'),
(9, 'login', '{"device": "mobile"}', '2024-07-08 12:00:00'),
(12, 'login', '{"device": "desktop"}', '2024-07-10 09:00:00'),
(14, 'login', '{"device": "desktop"}', '2024-07-12 10:00:00'),
(17, 'login', '{"device": "desktop"}', '2024-07-15 08:00:00'),
(18, 'login', '{"device": "mobile"}', '2024-07-18 09:00:00'),
(3, 'login', '{"device": "desktop"}', '2024-07-20 10:00:00'),
(19, 'login', '{"device": "desktop"}', '2024-07-22 11:00:00');


-- ──────────────────────────────────────────────────────────────────────────────
-- SCHEMA C: HR / OPERATIONS
-- Tables: employees, departments, salaries, attendance
-- ──────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS salaries CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    manager_name TEXT
);

INSERT INTO departments (name, location, manager_name) VALUES
('Engineering', 'Floor 3', 'Sarah Palmer'),
('Marketing', 'Floor 2', 'Tom Richards'),
('Sales', 'Floor 1', 'Jessica Barnes'),
('Human Resources', 'Floor 2', 'Michael Chen');

-- Employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO employees (first_name, last_name, email, department_id, position, hire_date, is_active) VALUES
('Sarah', 'Palmer', 'sarah.palmer@company.com', 1, 'VP of Engineering', '2020-03-15', TRUE),
('Ryan', 'Blake', 'ryan.blake@company.com', 1, 'Senior Developer', '2021-06-01', TRUE),
('Priya', 'Sharma', 'priya.sharma@company.com', 1, 'Full-Stack Developer', '2022-01-10', TRUE),
('Jake', 'Morrison', 'jake.morrison@company.com', 1, 'Junior Developer', '2023-04-15', TRUE),
('Lily', 'Chang', 'lily.chang@company.com', 1, 'DevOps Engineer', '2022-09-01', TRUE),
('Tom', 'Richards', 'tom.richards@company.com', 2, 'Marketing Director', '2020-07-20', TRUE),
('Nina', 'Vasquez', 'nina.vasquez@company.com', 2, 'Content Manager', '2022-03-15', TRUE),
('Omar', 'Hassan', 'omar.hassan@company.com', 2, 'SEO Specialist', '2023-01-10', TRUE),
('Jessica', 'Barnes', 'jessica.barnes@company.com', 3, 'Sales Director', '2020-11-01', TRUE),
('Kevin', 'O''Brien', 'kevin.obrien@company.com', 3, 'Account Executive', '2021-08-15', TRUE),
('Diana', 'Cruz', 'diana.cruz@company.com', 3, 'Account Executive', '2022-05-20', TRUE),
('Marcus', 'Powell', 'marcus.powell@company.com', 3, 'Sales Rep', '2023-06-01', TRUE),
('Michael', 'Chen', 'michael.chen@company.com', 4, 'HR Director', '2020-01-15', TRUE),
('Ashley', 'Morgan', 'ashley.morgan@company.com', 4, 'Recruiter', '2022-08-01', TRUE),
('Derek', 'Simmons', 'derek.simmons@company.com', 1, 'QA Engineer', '2021-11-15', FALSE);

-- Salaries (history — some employees have raises tracked over time)
CREATE TABLE salaries (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    amount DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    notes TEXT
);

INSERT INTO salaries (employee_id, amount, effective_date, notes) VALUES
(1, 130000.00, '2020-03-15', 'Initial salary'),
(1, 145000.00, '2022-03-15', 'Annual raise'),
(1, 160000.00, '2024-03-15', 'Promotion to VP'),
(2, 95000.00, '2021-06-01', 'Initial salary'),
(2, 105000.00, '2023-06-01', 'Annual raise'),
(3, 85000.00, '2022-01-10', 'Initial salary'),
(3, 95000.00, '2024-01-10', 'Annual raise'),
(4, 65000.00, '2023-04-15', 'Initial salary'),
(5, 90000.00, '2022-09-01', 'Initial salary'),
(5, 100000.00, '2024-01-01', 'Annual raise'),
(6, 110000.00, '2020-07-20', 'Initial salary'),
(6, 120000.00, '2022-07-20', 'Annual raise'),
(7, 72000.00, '2022-03-15', 'Initial salary'),
(7, 78000.00, '2024-03-15', 'Annual raise'),
(8, 60000.00, '2023-01-10', 'Initial salary'),
(9, 115000.00, '2020-11-01', 'Initial salary'),
(9, 125000.00, '2022-11-01', 'Annual raise'),
(10, 80000.00, '2021-08-15', 'Initial salary'),
(10, 88000.00, '2023-08-15', 'Annual raise'),
(11, 78000.00, '2022-05-20', 'Initial salary'),
(12, 55000.00, '2023-06-01', 'Initial salary'),
(13, 105000.00, '2020-01-15', 'Initial salary'),
(13, 115000.00, '2022-01-15', 'Annual raise'),
(14, 62000.00, '2022-08-01', 'Initial salary'),
(15, 80000.00, '2021-11-15', 'Initial salary');

-- Attendance (recent records showing check-in/check-out patterns)
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    status TEXT NOT NULL DEFAULT 'present'
);

INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES
(1, '2024-07-01', '08:30', '17:30', 'present'),
(2, '2024-07-01', '09:00', '18:00', 'present'),
(3, '2024-07-01', '08:45', '17:15', 'present'),
(4, '2024-07-01', '09:15', '17:45', 'present'),
(5, '2024-07-01', '08:00', '17:00', 'present'),
(6, '2024-07-01', '09:30', '18:30', 'present'),
(7, '2024-07-01', '09:00', '17:30', 'present'),
(9, '2024-07-01', '08:30', '18:00', 'present'),
(10, '2024-07-01', '09:00', '17:30', 'present'),
(13, '2024-07-01', '08:15', '17:15', 'present'),
(8, '2024-07-01', '09:00', NULL, 'absent'),
(1, '2024-07-02', '08:30', '17:30', 'present'),
(2, '2024-07-02', '09:00', '18:00', 'present'),
(3, '2024-07-02', '09:30', '17:00', 'present'),
(5, '2024-07-02', '08:15', '17:15', 'present'),
(6, '2024-07-02', '09:00', '17:00', 'present'),
(7, '2024-07-02', '08:45', '17:45', 'present'),
(9, '2024-07-02', '08:30', '17:30', 'present'),
(10, '2024-07-02', '08:45', '17:45', 'present'),
(11, '2024-07-02', '09:00', '18:00', 'present'),
(4, '2024-07-02', '09:00', NULL, 'absent'),
(13, '2024-07-02', '08:00', '17:00', 'present'),
(14, '2024-07-02', '09:00', '17:30', 'present'),
(1, '2024-07-03', '08:30', '17:30', 'present'),
(2, '2024-07-03', '10:00', '18:30', 'late'),
(3, '2024-07-03', '08:45', '17:15', 'present'),
(6, '2024-07-03', '09:00', '17:00', 'present'),
(9, '2024-07-03', '08:30', '17:30', 'present'),
(12, '2024-07-03', '10:30', '18:00', 'late'),
(13, '2024-07-03', '08:15', '17:15', 'present');


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables and allow public read-only access.
-- This ensures that even if someone grabs the anon key from the client code,
-- they can only SELECT — no INSERT, UPDATE, or DELETE is possible.
-- ============================================================================

-- E-commerce tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON customers FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON order_items FOR SELECT USING (true);

-- SaaS tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON plans FOR SELECT USING (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON subscriptions FOR SELECT USING (true);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON events FOR SELECT USING (true);

-- HR tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON departments FOR SELECT USING (true);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON employees FOR SELECT USING (true);

ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON salaries FOR SELECT USING (true);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON attendance FOR SELECT USING (true);


-- ============================================================================
-- DONE: All 3 schemas created, seeded, and secured with RLS.
-- E-commerce:  20 customers, 15 products, 30 orders, 50 order_items
-- SaaS:        20 users, 3 plans, 25 subscriptions, 60 events
-- HR:          15 employees, 4 departments, 25 salary records, 30 attendance
-- ============================================================================
