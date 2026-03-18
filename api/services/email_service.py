"""
Email service for sending PDF estimates to customers.

Uses Resend API for transactional email delivery.
Requires RESEND_API_KEY env var.
"""
import os
import logging

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "Calyx Containers <quotes@calyxcontainers.com>")


async def send_estimate_email(
    to_email: str,
    customer_name: str,
    attachments: list[tuple[bytes, str]],  # (pdf_bytes, filename)
    primary_estimate_number: str,
) -> bool:
    """Send PDF estimate(s) to a customer via Resend."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email")
        return False

    resend.api_key = RESEND_API_KEY

    first_name = customer_name.split()[0] if customer_name else "there"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0033A1; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Calyx Containers</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #1a1a1a;">Hi {first_name},</p>
        <p style="font-size: 14px; color: #4a4a4a; line-height: 1.6;">
          Thank you for using our instant quoting tool! Your packaging estimate
          is attached to this email for your records.
        </p>
        <p style="font-size: 14px; color: #4a4a4a; line-height: 1.6;">
          This estimate is for budgetary and planning purposes. Final pricing
          will be confirmed once artwork is received and reviewed by our team.
        </p>
        <p style="font-size: 14px; color: #4a4a4a; line-height: 1.6;">
          If you have any questions, our team is here to help.
        </p>
        <p style="font-size: 14px; color: #1a1a1a; margin-top: 24px;">
          Best regards,<br/>
          <strong>The Calyx Containers Team</strong><br/>
          <span style="color: #6b7280; font-size: 13px;">(888) 860-5202</span>
        </p>
      </div>
      <div style="background-color: #f3f4f6; padding: 16px 24px; text-align: center;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          Calyx Containers &middot; 1991 Parkway Blvd &middot; West Valley City, UT 84119
        </p>
      </div>
    </div>
    """

    try:
        resend_attachments = [
            {"filename": filename, "content": list(pdf_bytes)}
            for pdf_bytes, filename in attachments
        ]

        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": f"Your Calyx Containers Estimate ({primary_estimate_number})",
            "html": html_body,
            "attachments": resend_attachments,
        }
        result = resend.Emails.send(params)
        logger.info(f"Estimate email sent to {to_email}: {result}")
        return True
    except Exception as e:
        logger.error(f"Failed to send estimate email to {to_email}: {e}")
        return False
