"""
Instant quote router.

POST /api/v1/quotes/instant - Generate an instant quote across all print methods.
"""
import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException

from api.schemas.quote_request import InstantQuoteRequest
from api.schemas.quote_response import InstantQuoteResponse
from api.services.prediction_service import generate_instant_quote
from api.services.slack_service import notify_slack_quote
from api.middleware.sanitizer import sanitize_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["quotes"])


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
    quote_id = str(uuid.uuid4())

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
        quote_id=quote_id,
        specifications=specifications,
        digital=sanitized.get("digital"),
        flexographic=sanitized.get("flexographic"),
        international_air=sanitized.get("international_air"),
        international_ocean=sanitized.get("international_ocean"),
    )

    # Fire-and-forget Slack notification
    background_tasks.add_task(
        notify_slack_quote,
        {"lead_id": request.lead_id},
        {"quote_id": quote_id, "methods": len([
            m for m in [response.digital, response.flexographic,
                        response.international_air, response.international_ocean]
            if m is not None
        ])},
    )

    logger.info(
        f"Quote {quote_id} generated for lead {request.lead_id} | "
        f"Digital={'yes' if response.digital else 'no'} | "
        f"Flexo={'yes' if response.flexographic else 'no'} | "
        f"Air={'yes' if response.international_air else 'no'} | "
        f"Ocean={'yes' if response.international_ocean else 'no'}"
    )

    return response
