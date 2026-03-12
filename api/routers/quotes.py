"""
Instant quote router.

POST /api/v1/quotes/instant - Generate an instant quote across all print methods.
"""
import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException

from api.schemas.quote_request import InstantQuoteRequest
from api.schemas.quote_response import InstantQuoteResponse
from pydantic import BaseModel

from api.services.prediction_service import generate_instant_quote, DEFAULT_MARGIN_PCT
from api.services.supabase_client import insert_quote, update_quote, get_supabase, get_quotes_by_lead, get_lead
from api.services.slack_service import notify_slack_quote, notify_slack_manager_request
from api.middleware.sanitizer import sanitize_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["quotes"])


def _method_to_json(method_pricing) -> dict | None:
    """Serialize a MethodPricing to a JSON-safe dict for Supabase storage."""
    if method_pricing is None:
        return None
    return method_pricing.model_dump()


@router.post("/quotes/instant", response_model=InstantQuoteResponse)
async def instant_quote(
    request: InstantQuoteRequest,
    background_tasks: BackgroundTasks,
):
    """
    Generate an instant quote for the given bag specifications.

    Returns pricing across up to 4 print methods:
    - Digital
    - Flexographic
    - International Air (Gravure)
    - International Ocean (Gravure)

    All prices are sell prices with margin applied.
    No internal cost data, vendor names, or model metrics are exposed.
    """
    try:
        raw_result = generate_instant_quote(request)
    except Exception as e:
        logger.error(f"Quote generation failed for lead {request.lead_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate quote. Please try again.",
        )

    # Sanitize to strip any accidentally leaked internal data
    sanitized = sanitize_response(raw_result)

    # Build customer-facing specifications echo
    specifications = {
        "width": request.width,
        "height": request.height,
        "gusset": request.gusset,
        "substrate": request.substrate,
        "finish": request.finish,
        "seal_type": request.seal_type,
        "fill_style": request.fill_style,
        "zipper": request.zipper,
        "tear_notch": request.tear_notch,
        "hole_punch": request.hole_punch,
        "corners": request.corners,
        "embellishment": request.embellishment,
        "quantities": request.quantities,
    }

    response = InstantQuoteResponse(
        quote_id="pending",  # Will be replaced by DB-generated UUID
        specifications=specifications,
        digital=sanitized.get("digital"),
        flexographic=sanitized.get("flexographic"),
        international_air=sanitized.get("international_air"),
        international_ocean=sanitized.get("international_ocean"),
    )

    # Persist to Supabase
    try:
        row = insert_quote({
            "lead_id": request.lead_id,
            "specifications": specifications,
            "pricing_digital": _method_to_json(response.digital),
            "pricing_flexo": _method_to_json(response.flexographic),
            "pricing_intl_air": _method_to_json(response.international_air),
            "pricing_intl_ocean": _method_to_json(response.international_ocean),
            "margin_applied": DEFAULT_MARGIN_PCT,
        })
        quote_id = row.get("id", response.quote_id)
        response.quote_id = quote_id
    except Exception as e:
        logger.error(f"Failed to persist quote for lead {request.lead_id}: {e}")
        # Non-fatal: still return the quote even if DB write fails
        response.quote_id = "transient"

    # Fetch lead data for the Slack notification
    lead_data = {"lead_id": request.lead_id}
    try:
        sb = get_supabase()
        result = sb.table("customer_leads").select("*").eq("id", request.lead_id).execute()
        if result.data:
            lead_data = result.data[0]
            lead_data["lead_id"] = request.lead_id
    except Exception as e:
        logger.error(f"Failed to fetch lead {request.lead_id} for Slack: {e}")

    # Fire-and-forget Slack notification
    background_tasks.add_task(
        notify_slack_quote,
        lead_data,
        {
            "quote_id": response.quote_id,
            "specifications": specifications,
            "digital": _method_to_json(response.digital),
            "flexographic": _method_to_json(response.flexographic),
            "international_air": _method_to_json(response.international_air),
            "international_ocean": _method_to_json(response.international_ocean),
        },
    )

    logger.info(
        f"Quote {response.quote_id} generated for lead {request.lead_id} | "
        f"Digital={'yes' if response.digital else 'no'} | "
        f"Flexo={'yes' if response.flexographic else 'no'} | "
        f"Air={'yes' if response.international_air else 'no'} | "
        f"Ocean={'yes' if response.international_ocean else 'no'}"
    )

    return response


class ManagerRequest(BaseModel):
    lead_id: str
    quote_id: str


@router.post("/quotes/request-manager")
async def request_manager(
    request: ManagerRequest,
    background_tasks: BackgroundTasks,
):
    """Flag a quote as requesting an account manager and notify Slack."""
    # Update the quote in Supabase
    try:
        update_quote(request.quote_id, {"requested_manager": True})
    except Exception as e:
        logger.error(f"Failed to update quote {request.quote_id}: {e}")
        # Non-fatal: still send the Slack notification

    # Look up lead info for the Slack message
    lead_data = {}
    try:
        sb = get_supabase()
        result = sb.table("customer_leads").select("*").eq("id", request.lead_id).execute()
        if result.data:
            lead_data = result.data[0]
    except Exception as e:
        logger.error(f"Failed to fetch lead {request.lead_id}: {e}")

    # Fire-and-forget Slack notification
    background_tasks.add_task(
        notify_slack_manager_request,
        lead_data,
        request.quote_id,
    )

    logger.info(f"Manager requested for quote {request.quote_id} by lead {request.lead_id}")
    return {"status": "ok"}


@router.get("/quotes/lead/{lead_id}")
async def quotes_for_lead(lead_id: str):
    """Return all quotes for a given lead. Used by the shareable quotes page."""
    lead = get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    quotes = get_quotes_by_lead(lead_id)

    return {
        "lead": {
            "full_name": lead.get("full_name", ""),
            "business_name": lead.get("business_name", ""),
            "email": lead.get("email", ""),
        },
        "quotes": [
            {
                "id": q.get("id"),
                "created_at": q.get("created_at"),
                "specifications": q.get("specifications"),
                "pricing_digital": q.get("pricing_digital"),
                "pricing_flexo": q.get("pricing_flexo"),
                "pricing_intl_air": q.get("pricing_intl_air"),
                "pricing_intl_ocean": q.get("pricing_intl_ocean"),
            }
            for q in quotes
        ],
    }
