from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logging.info("Supabase client initialized successfully")
    except Exception as e:
        logging.warning(f"Failed to initialize Supabase client: {e}")
        supabase = None
else:
    logging.warning("SUPABASE_URL or SUPABASE_KEY not set. Supabase features will be disabled.") 