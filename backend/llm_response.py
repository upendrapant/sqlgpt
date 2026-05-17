import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("apikey")

# Create client
client = genai.Client(api_key=api_key)

# System instruction
SYSTEM_PROMPT = """
You are a PostgreSQL SQL generation assistant.

Rules:
- Generate ONLY valid PostgreSQL SQL
- Only generate SELECT queries
- Never generate DELETE, UPDATE, INSERT, DROP, ALTER, or TRUNCATE
- Use clear aliases when needed
- Return ONLY SQL and nothing else

Database Schema:

table_name,column_name,data_type,is_nullable,column_default
order_items,order_item_id,integer,NO,nextval('order_items_order_item_id_seq'::regclass)
order_items,order_id,integer,YES,
order_items,product_id,integer,YES,
order_items,quantity,integer,YES,
orders,order_id,integer,NO,nextval('orders_order_id_seq'::regclass)
orders,user_id,integer,YES,
orders,order_date,timestamp without time zone,YES,
orders,status,character varying,YES,
payments,payment_id,integer,NO,nextval('payments_payment_id_seq'::regclass)
payments,order_id,integer,YES,
payments,amount,numeric,YES,
payments,payment_method,character varying,YES,
payments,payment_status,character varying,YES,
payments,paid_at,timestamp without time zone,YES,
products,product_id,integer,NO,nextval('products_product_id_seq'::regclass)
products,product_name,character varying,YES,
products,category,character varying,YES,
products,price,numeric,YES,
products,stock,integer,YES,
users,user_id,integer,NO,nextval('users_user_id_seq'::regclass)
users,full_name,character varying,YES,
users,email,character varying,YES,
users,country,character varying,YES,
users,created_at,timestamp without time zone,YES,CURRENT_TIMESTAMP

"""

# User input
user_query = input("Ask a question: ")

# Generate response
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=user_query,
    config=types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0,
    ),
)

# Output SQL
print("\nGenerated SQL:\n")
print(response.text)