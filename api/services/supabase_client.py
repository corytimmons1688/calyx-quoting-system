"""
Supabase client for the customer portal API.

Uses the service role key for full access to customer_leads and customer_quotes.
"""
import os
import logging
from typing import Optional

from supabase import create_client, Client

logger = logging.getLogger(__name__)

_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create the singleton Supabase client."""
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if not url or not key:
            raise EnvironmentError("SUPABASE_URL and SUPABASE_KEY must be set")
        _client = create_client(url, key)
        logger.info("Supabase client initialized")
    return _client


def insert_lead(lead_data: dict) -> dict:
    """Insert a new lead and return the created row."""
    sb = get_supabase()
    result = sb.table("customer_leads").insert(lead_data).execute()
    return result.data[0] if result.data else {}


def insert_quote(quote_data: dict) -> dict:
    """Insert a new customer quote and return the created row."""
    sb = get_supabase()
    result = sb.table("customer_quotes").insert(quote_data).execute()
    return result.data[0] if result.data else {}


def update_quote(quote_id: str, updates: dict) -> dict:
    """Update a customer quote by ID."""
    sb = get_supabase()
    result = sb.table("customer_quotes").update(updates).eq("id", quote_id).execute()
    return result.data[0] if result.data else {}


def get_quotes_by_lead(lead_id: str) -> list[dict]:
    """Fetch all quotes for a given lead, newest first."""
    sb = get_supabase()
    result = (
        sb.table("customer_quotes")
        .select("*")
        .eq("lead_id", lead_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


def get_lead(lead_id: str) -> dict | None:
    """Fetch a lead by ID."""
    sb = get_supabase()
    result = sb.table("customer_leads").select("*").eq("id", lead_id).execute()
    return result.data[0] if result.data else None
