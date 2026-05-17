# Basic (single table queries)

These check if your model understands columns correctly:

* Show all users in the database
* List all products with their price and stock
* Show all orders with their order_date and status
* Find all payments and their payment_status
* List all users from Canada (or any country filter)
* Show all products in the “Electronics” category

---

# Intermediate (joins required)

These test relational understanding:

* Show all orders along with the user’s full name
* List all order items with product names and quantities
* Show all payments with their corresponding order ID and user name
* Find all products that have been ordered at least once
* List all orders with user name and order status
* Show order items including product name and price

---

# Analytical queries (aggregation)

These test SQL grouping + math:

* Show total number of orders per user
* Find total revenue generated from all payments
* Show total quantity sold per product
* Find the average order value
* Show total payments grouped by payment method
* Find top 5 products by revenue

---

# Time-based queries (very important for real systems)

These test timestamps:

* Show all orders placed in the last 30 days
* Find total revenue per month
* Show number of orders per day
* Find the busiest order date
* Show payments made in the last week
* Compare order volume by month

---

# Business-style real questions (most important for your project)

These are closest to real users:

* Who are the top 5 highest spending users?
* Which products generate the most revenue?
* What is the most popular product category?
* Which users have placed the most orders?
* What percentage of orders have been paid successfully?
* Which payment method is most commonly used?
* Are there products that are frequently ordered but low in stock?

---

# Hard / edge-case queries (stress test your AI)

These break weak systems:

* Find users who placed orders but never made a payment
* Find products that were ordered but never paid for
* Show users whose total spending is above average
* Find orders with multiple products (requires grouping logic)
* Identify products that are out of stock but still being ordered
* Show users who placed orders but have no recent activity

---