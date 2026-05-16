import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import sys
from dotenv import load_dotenv
load_dotenv()

from config import DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PWD

DB_CONFIG = {
    "host": DATABASE_HOST,
    "port": DATABASE_PORT,
    "dbname": DATABASE_NAME,
    "user": DATABASE_USER,
    "password": DATABASE_PWD
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def execute_query(query: str):
    """
    Executes ONLY SELECT queries safely and returns JSON-like results.
    """

    #
    forbidden = ["insert", "update", "delete", "drop", "alter", "truncate"]

    sql_lower = query.strip().lower()
    if not sql_lower.startswith("select"):
        raise ValueError("Only SELECT queries are allowed.")

    if any(word in sql_lower for word in forbidden):
        raise ValueError("Unsafe SQL detected.")

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            results = cur.fetchall()
            return results
    finally:
        conn.close()


if __name__ == "__main__":
    query = """
    SELECT u.full_name, COUNT(o.order_id) AS total_orders
    FROM users u
    JOIN orders o ON u.user_id = o.user_id
    GROUP BY u.full_name;
    """
    output = execute_query(query)
    df = pd.DataFrame(output)
    df.to_csv("output.csv", index=False)
    