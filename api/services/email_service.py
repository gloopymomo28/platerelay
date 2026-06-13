"""
PlateRelay — Email Service
All email templates with PlateRelay branding, sent via Resend.
"""

import resend
from config import get_settings
from datetime import timedelta

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        settings = get_settings()
        resend.api_key = settings.RESEND_API_KEY
        _configured = True


def _get_from() -> str:
    settings = get_settings()
    return f"{settings.RESEND_FROM_NAME} <{settings.RESEND_FROM_EMAIL}>"


def _base_html(title: str, body: str) -> str:
    """Wrap email body in PlateRelay branded template."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0; padding:0; font-family: 'Inter', Arial, sans-serif; background-color: #FDF6EC;">
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background-color: #F4A22D; padding: 24px; text-align: center;">
          <h1 style="margin:0; color: #2D3A1E; font-size: 28px; font-weight: 700;">
            🍽️ PlateRelay
          </h1>
          <p style="margin: 4px 0 0; color: #2D3A1E; font-size: 13px;">
            Every surplus meal finds its next table.
          </p>
        </div>

        <!-- Body -->
        <div style="background-color: #FFFFFF; padding: 32px 24px;">
          <h2 style="color: #2D3A1E; font-size: 20px; margin-top: 0;">{title}</h2>
          {body}
        </div>

        <!-- Footer -->
        <div style="background-color: #2D3A1E; padding: 20px 24px; text-align: center;">
          <p style="margin:0; color: #8A7968; font-size: 12px;">
            PlateRelay — Relaying meals, one plate at a time.<br>
            Questions? Reply to this email or write to support@platerelay.in
          </p>
        </div>
      </div>
    </body>
    </html>
    """


# ─────────────────────────────────────────────────────────────
# Individual Email Functions
# ─────────────────────────────────────────────────────────────

def send_docs_received_email(to_email: str, org_name: str):
    """Sent when a user uploads their verification documents."""
    _ensure_configured()
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{org_name}</strong>,</p>
    <p style="color: #2D3A1E;">
      We've received your verification documents. Our team will review them
      within <strong>24 hours</strong>.
    </p>
    <p style="color: #2D3A1E;">
      You'll receive an email once your account is approved. Sit tight — 
      good things are cooking! 🍳
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": "📋 Documents received — review in 24h",
        "html": _base_html("Documents Received", body),
    })


def send_account_approved_email(to_email: str, org_name: str, role: str):
    """Sent when admin approves a user's account."""
    _ensure_configured()
    role_msg = "start posting relays" if role == "donor" else "browse and claim food relays"
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{org_name}</strong>,</p>
    <p style="color: #2D3A1E;">
      Great news! ✅ Your PlateRelay account has been <strong>verified</strong>.
    </p>
    <p style="color: #2D3A1E;">
      You can now {role_msg}. Every meal you help relay makes a difference.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{get_settings().FRONTEND_URL}/login"
         style="background-color: #F4A22D; color: #2D3A1E; padding: 12px 32px;
                text-decoration: none; border-radius: 6px; font-weight: 600;
                display: inline-block;">
        Get Started →
      </a>
    </div>
    <p style="color: #8A7968; font-size: 13px;">Welcome aboard! 🎉</p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": "✅ You're verified on PlateRelay!",
        "html": _base_html("Account Approved!", body),
    })


def send_account_rejected_email(to_email: str, org_name: str, reason: str):
    """Sent when admin rejects a user's application."""
    _ensure_configured()
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{org_name}</strong>,</p>
    <p style="color: #2D3A1E;">
      Unfortunately, we were unable to verify your account at this time.
    </p>
    <p style="color: #C4531A;">
      <strong>Reason:</strong> {reason}
    </p>
    <p style="color: #2D3A1E;">
      You can re-upload corrected documents from your profile page.
      If you believe this is an error, reply to this email and we'll look into it.
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": "Your PlateRelay Application",
        "html": _base_html("Application Update", body),
    })


def send_new_relay_email(to_email: str, relay: dict, distance_km: float):
    """Sent to nearby recipients when a new relay is posted."""
    _ensure_configured()
    food_name = relay.get("food_name", "Delicious food")
    qty = relay.get("quantity", {})
    qty_text = f"{qty.get('value', '?')} {qty.get('unit', 'servings')}"
    window = relay.get("pickup_window", {})
    start = window.get("start", "")
    end = window.get("end", "")

    from datetime import datetime, timedelta
    
    if isinstance(start, str):
        try:
            start = datetime.fromisoformat(start.replace("Z", "+00:00"))
        except ValueError:
            pass
    if isinstance(end, str):
        try:
            end = datetime.fromisoformat(end.replace("Z", "+00:00"))
        except ValueError:
            pass

    if hasattr(start, "strftime"):
        start = start + timedelta(hours=5, minutes=30)
        start = start.strftime("%I:%M %p")
    if hasattr(end, "strftime"):
        end = end + timedelta(hours=5, minutes=30)
        end = end.strftime("%I:%M %p")

    body = f"""
    <p style="color: #2D3A1E;">A new food relay is available near you! 🎉</p>
    <div style="background-color: #F0EDE8; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 4px 0; color: #2D3A1E;">
        <strong>🍽️ {food_name}</strong>
      </p>
      <p style="margin: 4px 0; color: #2D3A1E;">
        📦 Quantity: {qty_text}
      </p>
      <p style="margin: 4px 0; color: #2D3A1E;">
        📍 {distance_km:.1f} km away
      </p>
      <p style="margin: 4px 0; color: #2D3A1E;">
        ⏰ Pickup: {start} – {end}
      </p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{get_settings().FRONTEND_URL}/recipient/listings"
         style="background-color: #6B8F5E; color: #FFFFFF; padding: 12px 32px;
                text-decoration: none; border-radius: 6px; font-weight: 600;
                display: inline-block;">
        Claim This Relay →
      </a>
    </div>
    <p style="color: #8A7968; font-size: 13px;">
      First come, first served. Don't let this one get away! 🏃
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": f"🍽 New relay nearby: {food_name}",
        "html": _base_html("New Relay Nearby!", body),
    })


def send_relay_claimed_email(
    to_email: str, donor_org: str, shelter_name: str, relay: dict
):
    """Sent to the donor when their relay is claimed."""
    _ensure_configured()
    food_name = relay.get("food_name", "your relay")
    window = relay.get("pickup_window", {})
    start = window.get("start", "")
    end = window.get("end", "")

    from datetime import datetime, timedelta
    
    if isinstance(start, str):
        try:
            start = datetime.fromisoformat(start.replace("Z", "+00:00"))
        except ValueError:
            pass
    if isinstance(end, str):
        try:
            end = datetime.fromisoformat(end.replace("Z", "+00:00"))
        except ValueError:
            pass

    if hasattr(start, "strftime"):
        start = start + timedelta(hours=5, minutes=30)
        start = start.strftime("%I:%M %p")
    if hasattr(end, "strftime"):
        end = end + timedelta(hours=5, minutes=30)
        end = end.strftime("%I:%M %p")

    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{donor_org}</strong>,</p>
    <p style="color: #2D3A1E;">
      Great news! 🎉 <strong>{shelter_name}</strong> has claimed your relay:
      <strong>{food_name}</strong>.
    </p>
    <div style="background-color: #F0EDE8; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 4px 0; color: #2D3A1E;">
        🏠 Claimed by: <strong>{shelter_name}</strong>
      </p>
      <p style="margin: 4px 0; color: #2D3A1E;">
        ⏰ They'll arrive between: {start} – {end}
      </p>
    </div>
    <p style="color: #2D3A1E;">
      Someone's night just got a whole lot better, thanks to you. 💛
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": f"Your relay was claimed by {shelter_name}! 🎉",
        "html": _base_html("Relay Claimed!", body),
    })


def send_relay_unclaimed_email(to_email: str, donor_org: str, shelter_name: str, food_name: str):
    """Sent to the donor when a recipient releases their claim."""
    _ensure_configured()
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{donor_org}</strong>,</p>
    <p style="color: #2D3A1E;">
      Heads up — <strong>{shelter_name}</strong> has released their claim on
      <strong>{food_name}</strong>.
    </p>
    <p style="color: #2D3A1E;">
      Your relay is back to <strong>active</strong> and visible to other recipients.
      Hopefully someone else will snap it up soon! 🤞
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": f"{shelter_name} released your relay",
        "html": _base_html("Relay Released", body),
    })


def send_subscription_activated_email(to_email: str, org_name: str, plan: str):
    """Sent when a subscription is activated."""
    _ensure_configured()
    plan_display = "Saathi" if plan == "saathi" else "Daan Pro"
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{org_name}</strong>,</p>
    <p style="color: #2D3A1E;">
      Your <strong>{plan_display} Plan</strong> is now active! 🎉
    </p>
    <p style="color: #2D3A1E;">
      You now have access to all premium features. Thank you for supporting
      the PlateRelay mission — together, we relay more meals. 💛
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": f"🎉 {plan_display} Plan is now active!",
        "html": _base_html(f"{plan_display} Activated!", body),
    })


def send_subscription_renewed_email(to_email: str, org_name: str, plan: str, month: str):
    """Sent on subscription renewal."""
    _ensure_configured()
    plan_display = "Saathi" if plan == "saathi" else "Daan Pro"
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{org_name}</strong>,</p>
    <p style="color: #2D3A1E;">
      Your <strong>{plan_display} Plan</strong> has been renewed for <strong>{month}</strong>. ✅
    </p>
    <p style="color: #2D3A1E;">
      Thank you for continuing to support the PlateRelay mission.
      Keep relaying those meals! 🍽️
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": f"✅ {plan_display} Plan renewed for {month}",
        "html": _base_html("Subscription Renewed", body),
    })


def send_badge_earned_email(to_email: str, org_name: str, badge_name: str, badge_emoji: str):
    """Sent when a user earns a new badge."""
    _ensure_configured()
    body = f"""
    <p style="color: #2D3A1E;">Hi <strong>{org_name}</strong>,</p>
    <p style="color: #2D3A1E; font-size: 18px; text-align: center;">
      {badge_emoji} Achievement Unlocked! {badge_emoji}
    </p>
    <div style="background-color: #F0EDE8; padding: 20px; border-radius: 8px;
                margin: 16px 0; text-align: center;">
      <p style="font-size: 36px; margin: 0;">{badge_emoji}</p>
      <p style="color: #2D3A1E; font-size: 20px; font-weight: 700; margin: 8px 0;">
        {badge_name}
      </p>
    </div>
    <p style="color: #2D3A1E; text-align: center;">
      You're making a real difference. Keep relaying! 🍽️💛
    </p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [to_email],
        "subject": f"🏆 Achievement unlocked: {badge_name}!",
        "html": _base_html("Badge Earned!", body),
    })


def send_dispute_filed_email(admin_email: str, dispute: dict, reporter_name: str):
    """Notify admin about a newly filed dispute."""
    _ensure_configured()
    body = f"""
    <p style="color: #2D3A1E;">A new dispute has been filed.</p>
    <div style="background-color: #F0EDE8; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 4px 0; color: #2D3A1E;">
        <strong>Reporter:</strong> {reporter_name}
      </p>
      <p style="margin: 4px 0; color: #2D3A1E;">
        <strong>Type:</strong> {dispute.get('report_type', 'N/A')}
      </p>
      <p style="margin: 4px 0; color: #2D3A1E;">
        <strong>Description:</strong> {dispute.get('description', 'N/A')}
      </p>
    </div>
    <p style="color: #C4531A;">Please review this dispute in the admin panel.</p>
    """
    resend.Emails.send({
        "from": _get_from(),
        "to": [admin_email],
        "subject": f"⚠️ New dispute filed by {reporter_name}",
        "html": _base_html("New Dispute Filed", body),
    })
