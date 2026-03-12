"""
Slack notification service.

Placeholder implementation that logs messages. The actual Slack integration
will use the MCP tool or external webhook, not a direct API call.
"""
import logging

logger = logging.getLogger(__name__)


async def notify_slack_new_lead(lead_data: dict):
    """Notify Slack about a new lead. Implemented via external webhook."""
    logger.info(
        f"Slack notification: New lead from {lead_data.get('business_name', 'unknown')}"
    )


async def notify_slack_quote(lead_data: dict, quote_data: dict):
    """Notify Slack about a completed quote."""
    logger.info(
        f"Slack notification: Quote for {lead_data.get('business_name', 'unknown')}"
    )
