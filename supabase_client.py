import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SECRET")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY
)
print("Supabase client connected successfully")