# PlateRelay — Product Specification
## *Every surplus meal finds its next table.*

**Document version:** 2.0  
**Prepared for:** Development agent  
**Status:** Ready to build

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [The Problem & Opportunity](#2-the-problem--opportunity)
3. [Target Users](#3-target-users)
4. [Tech Stack & Free-Tier Constraints](#4-tech-stack--free-tier-constraints)
5. [Revenue Model](#5-revenue-model)
6. [Core Features by Role](#6-core-features-by-role)
7. [User Flows](#7-user-flows)
8. [Database Schema (MongoDB)](#8-database-schema-mongodb)
9. [Backend API Specification (Python/FastAPI)](#9-backend-api-specification-pythonfastapi)
10. [Frontend Specification](#10-frontend-specification)
11. [Authentication & Verification (Supabase)](#11-authentication--verification-supabase)
12. [File Storage (Cloudinary)](#12-file-storage-cloudinary)
13. [Email & Notifications (Resend)](#13-email--notifications-resend)
14. [Safety, Quality & Trust](#14-safety-quality--trust)
15. [Subscription & Payments (Razorpay)](#15-subscription--payments-razorpay)
16. [Admin Panel](#16-admin-panel)
17. [Project Structure](#17-project-structure)
18. [Environment Variables](#18-environment-variables)
19. [Deployment](#19-deployment)
20. [Future Roadmap](#20-future-roadmap)

---

## 1. Product Overview

**PlateRelay** is a zero-waste food logistics platform that connects restaurants, hotels, and caterers with local shelters, NGOs, and community kitchens. When a donor has surplus food at end-of-day, they post a "relay" — a time-boxed listing with a food photo, meal count, and pickup window. Registered recipients get an instant email notification and can claim it in one tap.

The name "relay" is intentional: food is being passed forward from one table to the next, rapidly, like a baton. It implies urgency, coordination, and care.

### Key Differentiators

- **Photo-first listings:** Every donation requires a food photo — builds trust, deters abuse, and creates a social proof trail.
- **Hard expiry windows:** Listings filter out automatically once the pickup window closes, enforcing food safety. No stale listings.
- **Tiered verification:** Both donors and recipients go through a lightweight but real verification pipeline, not just email confirmation.
- **CSR-ready receipts:** Donors receive a monthly PDF impact report — number of meals donated, CO₂ equivalent saved, tax-relevant summary — making PlateRelay attractive to hotels and corporates.
- **India-first pricing:** Subscription tiers are priced in INR with UPI payment support.

---

## 2. The Problem & Opportunity

India wastes approximately 68 million tonnes of food annually (UNEP 2021). Meanwhile, 189 million people remain undernourished (FAO). The structural gap is not supply — it is coordination. Restaurants cannot call shelters every night. Shelters cannot wait by the phone.

Existing tools are either:
- **Too manual** (WhatsApp groups, phone calls)
- **Too corporate** (FoodCloud, Too Good To Go — paid-to-consumer, not shelter-focused)
- **Too slow** (municipal food rescue programs with 48-hour windows)

PlateRelay fills the sub-2-hour coordination gap: a donor posts at 9 PM, a shelter claims by 9:15 PM, food is collected by 10 PM.

---

## 3. Target Users

### 3.1 Donors (Free — always)

| Type | Examples |
|------|----------|
| Restaurants | Dine-in, QSR, cloud kitchens |
| Hotels | Banquet surplus, buffet leftovers |
| Caterers | Post-event surplus |
| Corporate cafeterias | End-of-shift meals |
| Bakeries | End-of-day bread, pastries |

### 3.2 Recipients (Paid after trial)

| Type | Examples |
|------|----------|
| Night shelters | Homeless shelters, destitute homes |
| Orphanages | Children's homes |
| Old-age homes | Senior care facilities |
| Community kitchens | Langar, charitable kitchens |
| NGOs | Registered food relief organizations |

### 3.3 Admin

Internal PlateRelay team — verifies accounts, handles disputes, monitors platform health.

---

## 4. Tech Stack & Free-Tier Constraints

### 4.1 Stack

| Layer | Technology | Free Tier Limit |
|-------|-----------|-----------------|
| Backend API | Python 3.11 + FastAPI | — |
| Backend hosting | Vercel (serverless functions) | 100 GB bandwidth, 10s function timeout |
| Frontend hosting | Vercel (same repo or separate) | 100 GB bandwidth/month |
| Database | MongoDB Atlas (M0 free) | 512 MB storage, shared cluster |
| Authentication | Supabase Auth | 50,000 MAU, unlimited emails |
| File Storage | Cloudinary (free) | 25 GB storage, 25 GB bandwidth/month |
| Email | Resend (free) | 3,000 emails/month, 100/day |
| Payments | Razorpay Test Mode | No real money; `rzp_test_` keys, no KYC needed |

### 4.2 Vercel Serverless Notes

The Python FastAPI backend is deployed on Vercel as serverless functions using the `@vercel/python` runtime. Each API route is a stateless function invocation — there is no persistent process.

**Implications:**
- No in-process schedulers (APScheduler, threading, etc.) — Vercel functions are stateless and ephemeral.
- All background work that previously used scheduled jobs is handled **lazily at request time** (see Section 9.5).
- Functions have a 10-second timeout on the free hobby plan — keep all DB queries and external API calls fast.
- MongoDB connections must use connection pooling with a short `maxIdleTimeMS` to avoid exhausting Atlas M0's connection limit (500 connections max on free tier). Use a module-level cached client.

**Vercel project config** (`vercel.json` in `/backend`):
```json
{
  "builds": [{ "src": "main.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/api/(.*)", "dest": "main.py" }]
}
```

### 4.3 Free-Tier Strategy Notes

- MongoDB 512 MB is sufficient for ~50,000 listings with photos stored externally on Cloudinary.
- Resend 100 emails/day: send immediate individual emails for critical flows (claim, approval). For "new relay nearby" notifications, email all nearby recipients immediately on relay post — at hackathon/MVP scale (< 50 users) this is well within limits.
- Cloudinary: compress images to JPEG 80% quality on upload; target < 200 KB per photo.
- Razorpay Test Mode: use `rzp_test_` keys throughout development and demo. No KYC required. Switch to `rzp_live_` keys post-KYC for production.

---

## 5. Revenue Model

### 5.1 Philosophy

Donors should never pay. Charging restaurants creates friction and reduces supply. The supply side must be free forever.

Recipients derive direct operational value from the platform (free food sourcing, logistics coordination) and represent organizations with at least some funding. A small subscription is justified and sustainable.

### 5.2 Tiers

#### Free Tier — Recipients

- Up to 3 active claims per month
- Email notifications only
- Access to listings within 10 km radius
- No impact reports
- **Goal:** Onboard small/new shelters with zero barrier

#### Saathi Plan — ₹149/month per recipient organization

*"Saathi" = companion/ally in Hindi*

- Unlimited claims
- Instant email notifications
- 25 km radius access
- Monthly impact summary (meals received, donor list)
- Priority in claim queue when multiple shelters claim same listing
- **Target:** Established shelters, orphanages, NGOs

#### Daan Pro — ₹499/month per donor organization

*"Daan" = charitable giving in Hindi*

- Unlimited listings
- CSR-ready PDF impact report (monthly) with logo, meal count, estimated CO₂ saved
- Verified "Certified Donor" badge on listing
- Analytics dashboard (total meals donated, top recipients, waste-reduction graph)
- Dedicated account manager email
- **Target:** Hotels, corporates, catering companies using PlateRelay for CSR compliance

> **Note:** Individual restaurants get the base donor features for free. Daan Pro is optional for corporates who need the reporting.

### 5.3 Revenue Projections (Conservative)

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|
| Saathi subscribers | 10 | 40 | 120 |
| Daan Pro subscribers | 2 | 8 | 25 |
| Monthly Revenue | ₹2,480 | ₹9,960 | ₹30,355 |
| Monthly Costs (hosting etc.) | ~₹0 (free tiers) | ~₹500 | ~₹2,000 |

Free tiers cover all infrastructure through early growth. Revenue switches to profit almost immediately.

### 5.4 Payment Implementation

Use **Razorpay** (no setup fee, 2% per transaction):
- Monthly subscription via Razorpay Subscriptions API
- UPI, cards, net banking all supported
- Webhooks update subscription status in MongoDB
- **For demo/hackathon:** use Test Mode (`rzp_test_` keys). Test card: `4111 1111 1111 1111`, any future expiry, any CVV. Test UPI: `success@razorpay`.

---

## 6. Core Features by Role

### 6.1 Donor Features

| Feature | Description |
|---------|-------------|
| Register & verify | Email + business document upload for admin review |
| Post a Relay | Form: food name, category, quantity, pickup window, photo (required), quality pledge |
| Edit/cancel Relay | Up to 30 min before expiry, or before a claim is made |
| View history | All past relays, claimed vs expired |
| Impact dashboard | Total meals donated, total relays, CO₂ equivalent (computed on-demand) |
| Monthly email report | On-demand for free; auto-emailed monthly for Daan Pro |
| Notifications | Email when relay is claimed |
| Quality warnings | Hard UI warnings on every post form (see Section 14) |

### 6.2 Recipient Features

| Feature | Description |
|---------|-------------|
| Register & verify | Email + NGO/trust registration document upload |
| Browse listings | Map view + list view, filtered by distance, food type, expiry |
| Claim a Relay | One-tap claim; gets donor contact info and pickup address |
| Unclaim | Can release claim up to 45 min before pickup window opens |
| Claim history | All past claims, status (completed, expired, unclaimed) |
| Notifications | Email when new relay is posted nearby |
| Impact summary | Meals received, top donor partners |

### 6.3 Admin Features

| Feature | Description |
|---------|-------------|
| User verification queue | Review submitted documents, approve/reject with reason |
| Listing moderation | Remove inappropriate listings, flag repeat violators |
| Dispute management | Handle "food was spoiled" reports |
| Platform stats | Active users, relays posted/claimed/expired, daily/weekly/monthly |
| Manual subscription override | Grant free Saathi access to deserving shelters |
| Ban/suspend users | With timestamped reason |

---

## 7. User Flows

### 7.1 Donor Registration

```
1. Donor visits /register → selects "I want to donate food"
2. Fills: org name, contact name, phone, email, address, Google Maps PIN
3. Uploads: FSSAI license OR GST certificate OR trade license (JPG/PNG/PDF, max 5 MB)
4. Supabase creates auth user (email + password)
5. Email verification link sent via Supabase (uses Resend SMTP)
6. On email confirm → account status = "pending_verification"
7. Admin reviews document in admin panel → approves or rejects
8. On approval → status = "verified", welcome email sent via Resend
9. Donor can now post Relays
```

### 7.2 Recipient Registration

```
1. Recipient visits /register → selects "I want to receive food"
2. Fills: org name, contact name, phone, email, address, Google Maps PIN, org type
3. Uploads: NGO registration cert / Trust deed / 80G cert / Aadhaar of representative
   (at least one document required)
4. Supabase creates auth user
5. Email verification → account status = "pending_verification"
6. Admin approves → status = "verified"
7. Recipient can browse listings (free tier, 3 claims/month)
8. Optional: subscribe to Saathi Plan via Razorpay
```

### 7.3 Posting a Relay (Donor)

```
1. Donor logs in → clicks "Post a Relay"
2. Quality Warning modal shown (cannot be dismissed in < 3 seconds):
   "IMPORTANT: Only list food that is freshly cooked or prepared today,
    stored at safe temperature, and that you would personally serve to guests."
   Donor must tick checkbox: "I confirm this food meets safety standards"
3. Form fields:
   - Food name (e.g., "Dal Makhani + Rice")
   - Category (Cooked Meals / Packaged / Bakery / Raw Produce / Other)
   - Quantity (number of servings or kg)
   - Allergen flags (optional): nuts, dairy, gluten, egg
   - Is food vegetarian? (Yes / No / Mixed)
   - Pickup window: start time + end time (must be within next 4 hours)
   - Photo (required — camera or gallery, min 400x300px)
   - Additional notes (optional)
4. Preview shown with photo thumbnail
5. Confirm → Relay posted → status: "active"
6. All verified recipients within radius receive an email notification immediately
```

### 7.4 Claiming a Relay (Recipient)

```
1. Recipient receives email OR browses /listings
2. Clicks listing → sees food photo, description, distance, pickup window
   NOTE: Expired relays (pickup_window.end < now) are filtered at query time — 
   recipients never see them in the list
3. Clicks "Claim This Relay"
4. Confirmation screen: "You are claiming X meals from [Donor Name].
   Pickup: [address] between [time window].
   Are you sure you can send someone to collect?"
5. On confirm → relay status: "claimed", recipient gets donor phone number
6. Donor receives email: "[Shelter Name] has claimed your relay.
   They will arrive between [time window]."
7. After pickup window closes → relay is filtered from active listings automatically
8. Both parties can manually mark the relay as "completed" (optional, for analytics)
```

### 7.5 Relay Expiry — Lazy Pattern (No Scheduler)

There is no background job to expire relays. Instead:

**At query time** (GET /api/relays/nearby, GET /api/relays/mine, etc.):
- All queries include the filter `"pickup_window.end": { "$gt": now }` alongside `"status": "active"`
- Expired relays are simply never returned; their `status` field in MongoDB stays `"active"` but they are invisible to all users

**At claim time** (POST /api/relays/:id/claim):
- Before claiming, backend checks `relay.pickup_window.end > now`. If expired, returns 410 Gone.

**Impact:** No scheduled job needed. No persistent process needed. Works perfectly on Vercel serverless.

### 7.6 Free-Tier Claim Counter Reset — Lazy Pattern (No Scheduler)

There is no scheduled job to reset monthly claim counters. Instead:

**At claim time**, before enforcing the limit:
```
if claims_month_reset is before the first day of the current month:
    reset claims_this_month to 0
    update claims_month_reset to now
```

This is idempotent and correct — the reset happens naturally the first time a free-tier recipient tries to claim in a new month.

---

## 8. Database Schema (MongoDB)

All collections stored in MongoDB Atlas. Use **Motor** (async MongoDB driver) with a module-level cached client to avoid connection exhaustion on Vercel serverless.

```python
# database.py — module-level client, reused across warm function invocations
from motor.motor_asyncio import AsyncIOMotorClient
import os

_client = None

def get_db():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            os.environ["MONGODB_URI"],
            maxPoolSize=10,
            maxIdleTimeMS=30000  # Close idle connections after 30s
        )
    return _client["platerelay"]
```

### 8.1 Collection: `users`

```json
{
  "_id": "ObjectId",
  "supabase_uid": "string (unique)",
  "role": "donor | recipient | admin",
  "email": "string",
  "phone": "string",
  "org_name": "string",
  "contact_name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "pincode": "string"
  },
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "verification_status": "pending_email | pending_docs | verified | rejected | suspended",
  "rejection_reason": "string | null",
  "documents": [
    {
      "doc_type": "fssai | gst | trade_license | ngo_cert | trust_deed | aadhaar",
      "cloudinary_url": "string",
      "cloudinary_public_id": "string",
      "uploaded_at": "ISODate"
    }
  ],
  "subscription": {
    "plan": "free | saathi | daan_pro",
    "status": "active | cancelled | expired",
    "razorpay_subscription_id": "string | null",
    "started_at": "ISODate | null",
    "expires_at": "ISODate | null"
  },
  "claims_this_month": "int (for free-tier enforcement)",
  "claims_month_reset": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

> **Index:** `location` as 2dsphere index for geospatial queries. `supabase_uid` unique index.

### 8.2 Collection: `relays`

```json
{
  "_id": "ObjectId",
  "donor_id": "ObjectId (ref: users)",
  "food_name": "string",
  "category": "cooked_meal | packaged | bakery | raw_produce | other",
  "quantity": {
    "value": "number",
    "unit": "servings | kg | items"
  },
  "is_vegetarian": "true | false | mixed",
  "allergens": ["nuts", "dairy", "gluten", "egg"],
  "notes": "string | null",
  "photo": {
    "cloudinary_url": "string",
    "cloudinary_public_id": "string",
    "thumbnail_url": "string"
  },
  "pickup_address": {
    "street": "string",
    "city": "string",
    "instructions": "string | null"
  },
  "pickup_location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "pickup_window": {
    "start": "ISODate",
    "end": "ISODate"
  },
  "status": "active | claimed | completed | cancelled",
  "claimed_by": "ObjectId (ref: users) | null",
  "claimed_at": "ISODate | null",
  "donor_confirmed_completion": "bool",
  "recipient_confirmed_completion": "bool",
  "quality_pledge_confirmed": "bool",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

> **Note:** The `expired` status has been removed. Relays are considered expired when `pickup_window.end < now` regardless of their stored status. All queries filter by this condition at request time.

> **Indexes:** `pickup_location` as 2dsphere; `status`; `pickup_window.end`; `donor_id`.

### 8.3 Collection: `notifications`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users)",
  "type": "relay_claimed | new_relay_nearby | account_verified | account_rejected | claim_confirmed",
  "title": "string",
  "body": "string",
  "relay_id": "ObjectId | null",
  "is_read": "bool",
  "created_at": "ISODate"
}
```

### 8.4 Collection: `disputes`

```json
{
  "_id": "ObjectId",
  "relay_id": "ObjectId",
  "reported_by": "ObjectId (ref: users)",
  "report_type": "food_quality | no_show_donor | no_show_recipient | other",
  "description": "string",
  "status": "open | under_review | resolved",
  "admin_notes": "string | null",
  "created_at": "ISODate",
  "resolved_at": "ISODate | null"
}
```

### 8.5 Collection: `impact_reports`

Stores pre-computed impact summaries generated on-demand (triggered by user visiting the impact page or by admin). No scheduled generation.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "month": "int (1-12)",
  "year": "int",
  "role": "donor | recipient",
  "total_relays": "int",
  "total_meals": "int",
  "co2_kg_saved": "float",
  "top_partners": ["string"],
  "pdf_url": "string | null",
  "generated_at": "ISODate"
}
```

---

## 9. Backend API Specification (Python/FastAPI)

### 9.1 Project Setup

```
pip install fastapi motor pymongo python-jose passlib
pip install cloudinary resend razorpay python-multipart
pip install supabase python-dotenv httpx Pillow
pip install mangum  # ASGI adapter for Vercel/AWS Lambda
```

Use **FastAPI** with **Motor** (async MongoDB driver).
Use **Mangum** to wrap the FastAPI app for Vercel serverless deployment.
Use Supabase Python client for auth token verification.

**main.py entry point:**
```python
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

# Register all routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(relays_router, prefix="/api/relays")
# ... etc

# Vercel handler
handler = Mangum(app)
```

### 9.2 Authentication Middleware

All protected routes use a FastAPI dependency `get_current_user`:

```python
# auth/dependencies.py
from supabase import create_client
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    """
    Verifies Supabase JWT token.
    Returns user document from MongoDB users collection.
    Raises 401 if token invalid or user not found.
    """
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        user = supabase.auth.get_user(token.credentials)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        db = get_db()
        db_user = await db.users.find_one({"supabase_uid": user.user.id})
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        return db_user
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

async def require_verified(user = Depends(get_current_user)):
    if user["verification_status"] != "verified":
        raise HTTPException(status_code=403, detail="Account not yet verified")
    return user

async def require_donor(user = Depends(require_verified)):
    if user["role"] != "donor":
        raise HTTPException(status_code=403, detail="Donor account required")
    return user

async def require_recipient(user = Depends(require_verified)):
    if user["role"] != "recipient":
        raise HTTPException(status_code=403, detail="Recipient account required")
    return user

async def require_admin(user = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
```

### 9.3 API Routes

#### Authentication & Registration

```
POST   /api/auth/register          Register new user (donor or recipient)
POST   /api/auth/complete-profile  Set org details + location after Supabase signup
POST   /api/auth/upload-document   Upload verification document to Cloudinary
GET    /api/auth/me                Get current user profile
PUT    /api/auth/me                Update profile fields
```

#### Relays (Donor)

```
POST   /api/relays                 Create new relay (requires photo upload)
GET    /api/relays/mine            List my posted relays (paginated)
GET    /api/relays/:id             Get single relay detail
PUT    /api/relays/:id             Edit relay (only if active and unclaimed)
DELETE /api/relays/:id             Cancel relay (only if active and unclaimed)
POST   /api/relays/:id/confirm     Donor confirms pickup completed
```

#### Relays (Recipient)

```
GET    /api/relays/nearby          List active, non-expired relays within radius
                                   Query params: lat, lng, radius_km (default 10)
                                   Always filters: status=active AND pickup_window.end > now
POST   /api/relays/:id/claim       Claim a relay (checks expiry at claim time)
DELETE /api/relays/:id/claim       Unclaim (if > 45 min before pickup window start)
POST   /api/relays/:id/confirm     Recipient confirms pickup completed
GET    /api/relays/claimed         My claim history
```

#### Notifications

```
GET    /api/notifications          List my notifications (paginated, newest first)
PUT    /api/notifications/read-all Mark all as read
PUT    /api/notifications/:id/read Mark one as read
```

#### Impact & Reports

```
GET    /api/impact/summary         Compute and return my total impact stats on-demand
POST   /api/impact/reports/generate Generate (or retrieve cached) report for a given month/year
GET    /api/impact/reports         List my generated reports
```

#### Disputes

```
POST   /api/disputes               File a dispute about a relay
GET    /api/disputes/mine          My filed disputes
```

#### Subscriptions (Razorpay)

```
POST   /api/subscriptions/create   Create Razorpay subscription order
POST   /api/subscriptions/verify   Verify payment and activate plan
POST   /api/webhooks/razorpay      Razorpay webhook (cancel, renew events)
GET    /api/subscriptions/status   Get my current subscription status
```

#### Admin

```
GET    /api/admin/users/pending    List users pending verification
PUT    /api/admin/users/:id/verify Approve or reject user
GET    /api/admin/users            List all users (filterable)
PUT    /api/admin/users/:id/suspend Suspend user account
GET    /api/admin/relays           All relays with filters
DELETE /api/admin/relays/:id       Remove listing (moderation)
GET    /api/admin/disputes         All disputes
PUT    /api/admin/disputes/:id     Resolve dispute
GET    /api/admin/stats            Platform-wide stats
```

#### Health

```
GET    /api/health                 Returns {"status": "ok"} — for monitoring
```

### 9.4 Key Business Logic

#### Relay Posting (POST /api/relays)

```python
# Pseudocode
async def create_relay(
    food_name: str,
    category: str,
    quantity_value: float,
    quantity_unit: str,
    is_vegetarian: str,
    allergens: list,
    notes: str,
    pickup_window_start: datetime,
    pickup_window_end: datetime,
    photo: UploadFile,
    quality_pledge_confirmed: bool,  # must be True
    background_tasks: BackgroundTasks,
    donor = Depends(require_donor)
):
    # Validate quality pledge
    if not quality_pledge_confirmed:
        raise HTTPException(400, "Quality pledge must be confirmed")

    # Validate pickup window
    now = datetime.utcnow()
    if pickup_window_start < now:
        raise HTTPException(400, "Pickup window must be in the future")
    if pickup_window_end - pickup_window_start < timedelta(minutes=30):
        raise HTTPException(400, "Pickup window must be at least 30 minutes")
    if pickup_window_end - now > timedelta(hours=4):
        raise HTTPException(400, "Pickup window must be within 4 hours from now")

    # Upload photo to Cloudinary (validates min 400x300 with Pillow first)
    photo_result = await upload_relay_photo(photo)

    # Create relay document
    relay = { ... }
    db = get_db()
    await db.relays.insert_one(relay)

    # Notify nearby recipients via email (background task — non-blocking)
    background_tasks.add_task(notify_nearby_recipients, relay)

    return relay
```

#### Nearby Relays Query — Expiry Filter Built In (GET /api/relays/nearby)

```python
from datetime import datetime

async def get_nearby_relays(lat: float, lng: float, radius_km: float = 10):
    db = get_db()
    now = datetime.utcnow()

    pipeline = [
        {
            "$geoNear": {
                "near": {"type": "Point", "coordinates": [lng, lat]},
                "distanceField": "distance_meters",
                "maxDistance": radius_km * 1000,
                "spherical": True,
                "query": {
                    "status": "active",
                    "pickup_window.end": {"$gt": now}  # Lazy expiry filter
                }
            }
        },
        {"$sort": {"pickup_window.end": 1}},  # Soonest expiry first
        {"$limit": 50}
    ]
    return await db.relays.aggregate(pipeline).to_list(50)
```

#### Claiming a Relay — Expiry Check + Lazy Counter Reset

```python
async def claim_relay(relay_id: str, recipient = Depends(require_recipient)):
    db = get_db()
    now = datetime.utcnow()

    relay = await db.relays.find_one({"_id": ObjectId(relay_id)})
    if not relay:
        raise HTTPException(404, "Relay not found")

    # Lazy expiry check
    if relay["pickup_window"]["end"] < now:
        raise HTTPException(410, "This relay has expired")

    if relay["status"] != "active":
        raise HTTPException(409, "This relay has already been claimed")

    # Free-tier: lazy monthly counter reset
    if recipient["subscription"]["plan"] == "free":
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if recipient["claims_month_reset"] < first_of_month:
            await db.users.update_one(
                {"_id": recipient["_id"]},
                {"$set": {"claims_this_month": 0, "claims_month_reset": now}}
            )
            recipient["claims_this_month"] = 0  # Update local copy

        if recipient["claims_this_month"] >= 3:
            raise HTTPException(
                402,
                "Free plan limit reached (3 claims/month). Upgrade to Saathi for unlimited claims."
            )

    # Proceed with claim
    await db.relays.update_one(
        {"_id": ObjectId(relay_id)},
        {"$set": {"status": "claimed", "claimed_by": recipient["_id"], "claimed_at": now}}
    )
    await db.users.update_one(
        {"_id": recipient["_id"]},
        {"$inc": {"claims_this_month": 1}}
    )

    # Email donor
    background_tasks.add_task(
        send_relay_claimed_email,
        donor_id=relay["donor_id"],
        shelter_name=recipient["org_name"],
        relay=relay
    )

    return {"message": "Relay claimed successfully"}
```

#### Impact Summary — On-Demand Computation (GET /api/impact/summary)

```python
async def get_impact_summary(user = Depends(require_verified)):
    db = get_db()

    if user["role"] == "donor":
        relays = await db.relays.find({
            "donor_id": user["_id"],
            "status": {"$in": ["claimed", "completed"]}
        }).to_list(None)

        total_meals = sum(
            r["quantity"]["value"] for r in relays
            if r["quantity"]["unit"] == "servings"
        )
        co2_saved = calculate_co2_saved(relays)
        return {
            "total_relays_posted": len(relays),
            "total_meals_donated": total_meals,
            "co2_kg_saved": co2_saved
        }

    elif user["role"] == "recipient":
        claimed = await db.relays.find({
            "claimed_by": user["_id"]
        }).to_list(None)
        total_meals = sum(r["quantity"]["value"] for r in claimed)
        return {
            "total_relays_claimed": len(claimed),
            "total_meals_received": total_meals
        }
```

### 9.5 No Scheduler — Summary of Lazy Patterns

| What was scheduled | Now handled |
|--------------------|-------------|
| Expire old relays every 5 min | Filter `pickup_window.end > now` at every query |
| Reset monthly claim counters nightly | Reset lazily inside `claim_relay` when a new month is detected |
| Generate monthly reports on 1st | Generated on-demand when user visits impact page or triggers manually |

---

## 10. Frontend Specification

### 10.1 Technology

- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **State:** Zustand (lightweight global store)
- **Data fetching:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **Maps:** Leaflet.js (free, no API key needed) + OpenStreetMap tiles
- **Forms:** React Hook Form + Zod validation
- **Image upload:** react-dropzone
- **Toast notifications:** react-hot-toast

### 10.2 Color Palette & Design Language

PlateRelay uses a warm, trustworthy palette that evokes the warmth of a shared meal:

```
--color-saffron:    #F4A22D   (primary CTA, active states)
--color-earth:      #2D3A1E   (primary dark text, nav background)
--color-cream:      #FDF6EC   (page background)
--color-clay:       #C4531A   (warnings, alerts)
--color-sage:       #6B8F5E   (success states, "claimed" badges)
--color-fog:        #F0EDE8   (cards, input backgrounds)
--color-muted:      #8A7968   (secondary text, captions)
```

Typography: **Inter** (body) + **Fraunces** (display headings — a slightly quirky serif that communicates warmth and authenticity, distinct from the usual sans-serif food app defaults).

### 10.3 Pages & Routes

```
/                       Landing page (public)
/register               Registration: choose donor or recipient
/register/donor         Donor registration form
/register/recipient     Recipient registration form
/login                  Login
/verify-email           Email verification pending
/pending-approval       Docs submitted, awaiting admin

/dashboard              Role-based redirect (→ /donor/dashboard or /recipient/dashboard)
/donor/dashboard        Donor home: active relays, quick-post button, impact stats
/donor/post-relay       Post new relay form
/donor/relays           My relays list
/donor/relays/:id       Single relay detail
/donor/impact           Impact page with on-demand stats
/donor/settings         Account settings, subscription

/recipient/dashboard    Recipient home: nearby relays map, recent claims
/recipient/listings     Browse listings (list + map toggle)
/recipient/listings/:id Single listing detail + claim button
/recipient/claims       My claim history
/recipient/impact       Impact summary
/recipient/settings     Account settings, subscription
/recipient/upgrade      Saathi plan upgrade page

/admin                  Admin dashboard (stats overview)
/admin/verify-queue     Pending verification requests
/admin/users            User management
/admin/relays           Relay management
/admin/disputes         Disputes queue

/terms                  Terms of service
/privacy                Privacy policy
/contact                Contact page
```

### 10.4 Key UI Components

#### Relay Card

Displays: food photo thumbnail, food name, vegetarian badge, quantity, distance, time remaining (countdown), category badge, donor org name (first name + city only for privacy).

**Time remaining** is computed client-side from `pickup_window.end`. Color coded: green if > 60 min, amber if 30–60 min, red if < 30 min. If `pickup_window.end < now`, the card is hidden on the frontend (belt-and-suspenders with the backend filter).

#### Post Relay Form

Step 1: Quality Pledge modal (3-second mandatory display, then checkbox)
Step 2: Food details
Step 3: Photo upload (drag-and-drop or camera, with preview, min size validation)
Step 4: Pickup window picker (time range picker, constrained to next 4 hours)
Step 5: Review + Confirm

#### Listings Map (Leaflet)

Shows markers for active relays within selected radius. Clicking a marker shows a popup with food name, time remaining, and a "View Details" button. Color-coded by expiry urgency (green/amber/red).

#### Quality Warning Banner

Shown on donor dashboard every time they visit:

> **🌡 Food Safety First**
> Post only food prepared today, stored safely, and in good condition. Poor quality food endangers vulnerable people and your account may be suspended.

---

## 11. Authentication & Verification (Supabase)

### 11.1 Supabase Setup

- Enable **Email + Password** auth provider
- Disable **Phone** auth for now (add later)
- Enable **email confirmations** (required before profile completion)
- Set **JWT secret** — used to verify tokens in FastAPI middleware
- SMTP: configure Supabase to use Resend SMTP for branded emails

### 11.2 Registration Flow

```
1. Frontend: user fills basic info → calls Supabase signUp(email, password)
2. Supabase sends confirmation email (via Resend SMTP)
3. On email confirmation, Supabase triggers → frontend redirects to /complete-profile
4. User submits org details + location → backend POST /api/auth/complete-profile
   → Creates user doc in MongoDB with status "pending_docs"
5. User uploads verification document → POST /api/auth/upload-document
   → Cloudinary URL stored, status → "pending_verification"
6. Admin approves → status → "verified"
7. Welcome email sent via Resend
```

### 11.3 Document Verification Logic

The admin sees:
- Organization name claimed by applicant
- Document type selected
- Uploaded document (image/PDF preview)
- Approve / Reject (with reason) buttons

**Automated pre-checks (before admin sees it):**
- File size < 5 MB
- File type is image or PDF
- Cloudinary virus scan (Cloudinary performs this automatically)

**Admin manual check:**
- Name on document matches organization name
- Document is not expired
- Document is from a legitimate authority

No OCR or automated document verification — keep it simple for MVP. Admin turnaround target: 24 hours.

### 11.4 Supabase Row Level Security

Supabase is used only for auth (not as the primary DB). No RLS rules needed beyond default. All data lives in MongoDB with application-level authorization enforced in FastAPI middleware.

---

## 12. File Storage (Cloudinary)

### 12.1 Setup

- Free Cloudinary account: 25 GB storage, 25 GB bandwidth/month
- Create two upload presets:
  - `relay_photos`: transformations — auto quality, JPEG, max 800px wide, strip EXIF
  - `verification_docs`: no transformation, PDF + image, private delivery

### 12.2 Upload Flow (Relay Photos)

```python
# services/cloudinary_service.py
import cloudinary.uploader
from PIL import Image
import io

async def upload_relay_photo(file: UploadFile):
    contents = await file.read()

    # Validate dimensions with Pillow
    img = Image.open(io.BytesIO(contents))
    if img.width < 400 or img.height < 300:
        raise HTTPException(400, "Photo must be at least 400x300 pixels")

    # Upload to Cloudinary
    result = cloudinary.uploader.upload(
        contents,
        folder="platerelay/relays",
        upload_preset="relay_photos",
        resource_type="image"
    )

    # Generate thumbnail URL using Cloudinary transformations
    thumbnail_url = cloudinary.CloudinaryImage(result["public_id"]).build_url(
        width=400, height=300, crop="fill", quality=70
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "thumbnail_url": thumbnail_url
    }
```

### 12.3 Upload Flow (Verification Documents)

- Upload to `platerelay/verification_docs/{user_id}/` folder
- Use `type="authenticated"` for private delivery
- Admin accesses via signed URL generated server-side

### 12.4 Deletion

When a relay is cancelled, optionally delete photo from Cloudinary to save storage:

```python
cloudinary.uploader.destroy(relay["photo"]["cloudinary_public_id"])
```

Keep photos for 30 days after expiry for dispute resolution purposes.

---

## 13. Email & Notifications (Resend)

### 13.1 Resend Setup

- Sign up at resend.com — 3,000 emails/month, 100/day free
- Verify domain (or use resend.dev subdomain for testing)
- Install: `pip install resend`

### 13.2 Email Templates

All emails use a simple HTML template with PlateRelay branding (saffron header, earth footer).

| Trigger | Subject | Recipients |
|---------|---------|-----------|
| Registration | Welcome to PlateRelay — Verify your email | New user |
| Doc submitted | Documents received — review in 24h | New user |
| Account approved | ✅ You're verified on PlateRelay | New user |
| Account rejected | Your PlateRelay application | New user |
| Relay posted | 🍽 New relay nearby: {food_name} | Nearby verified recipients |
| Relay claimed | Your relay was claimed by {shelter_name} | Donor |
| Relay unclaimed | {shelter} released your relay | Donor |
| Subscription activated | Saathi plan is now active | Recipient |
| Subscription renewal | Saathi plan renewed for {month} | Recipient |

> **Note:** "Relay expired" email removed — no scheduler exists to trigger it. Consider adding a Vercel Cron Job post-hackathon for this.

### 13.3 Notification Strategy

At MVP/hackathon scale (< 100 users), send emails immediately on all triggers — no batching needed. Stay well within Resend's 100/day limit.

For "new relay nearby": when a relay is posted, fetch all verified recipients within radius and email them individually. Use FastAPI `BackgroundTasks` so the relay POST returns instantly and emails are sent asynchronously within the same function invocation.

### 13.4 In-App Notifications

Store notifications in MongoDB `notifications` collection (see schema). Frontend polls `GET /api/notifications` every 60 seconds (simple polling for MVP; upgrade to WebSocket post-hackathon).

Show unread count in navbar. Notification bell opens a slide-in panel with the last 20 notifications.

---

## 14. Safety, Quality & Trust

### 14.1 Mandatory Quality Pledge

Every time a donor posts a relay, they must:

1. See a full-screen modal (minimum 3-second delay before dismiss button appears) with:

```
⚠️ FOOD SAFETY COMMITMENT

Before posting, confirm that this food:

✓ Was prepared or received TODAY
✓ Has been stored at safe temperatures (below 5°C or above 60°C)
✓ Has not been tasted by customers or left unattended
✓ Is free from visible spoilage, unusual smell, or contamination
✓ Is packaged or covered for transport
✓ You would confidently serve this to a paying guest

People in need deserve the same quality of food as your customers.
Posting unsafe food is grounds for immediate account suspension.

[ ] I confirm this food meets all safety standards above
                          [I Understand — Post My Relay]
```

2. The checkbox is required. The "Post My Relay" button is disabled until checked.

3. A `quality_pledge_confirmed: true` flag is stored in the relay document.

### 14.2 Reporting System

Recipients can report a relay within 2 hours of pickup window closing:

- **Food was spoiled/unsafe**
- **Donor did not show / location was wrong**
- **Quantity was less than listed**
- **Other**

Filing a dispute sends an immediate email to the admin. Severe reports (food safety) trigger a 24-hour suspension of the donor's account pending admin review.

### 14.3 Trust Badges

Displayed on relay cards and user profiles:

| Badge | Criteria |
|-------|---------|
| ✅ Verified Donor | Admin-approved account |
| ⭐ Trusted Donor | 10+ completed relays, zero disputes |
| 🏆 Champion Donor | 50+ completed relays |
| 🤝 Saathi Partner | Active Saathi subscriber |

### 14.4 Suspension Rules

Manual suspension: admin can suspend any account with a reason logged.

Automated flag triggers (admin reviews and decides on suspension):
- 2 unresolved food safety disputes within 30 days
- 3 "no-show" complaints as donor within 30 days

---

## 15. Subscription & Payments (Razorpay)

### 15.1 Razorpay Setup

- Create Razorpay account (no monthly fee)
- **For hackathon/demo:** use Test Mode. Generate `rzp_test_` API keys immediately — no KYC required.
- Enable Subscriptions in the Razorpay dashboard
- Create two Subscription Plans in Razorpay dashboard:
  - `saathi_monthly`: ₹149/month, interval: monthly
  - `daan_pro_monthly`: ₹499/month, interval: monthly
- Note down `plan_id` for each and add to environment variables

**Test payment credentials for demo:**
- Card: `4111 1111 1111 1111`, any future expiry, any CVV
- UPI: `success@razorpay`
- Failed payment: card `4000 0000 0000 0002`

### 15.2 Subscription Flow

```
1. Recipient clicks "Upgrade to Saathi" → POST /api/subscriptions/create
2. Backend calls Razorpay API → creates subscription → returns subscription_id + short_url
3. Frontend opens Razorpay checkout (embed Razorpay checkout JS or redirect to short_url)
4. After successful payment, Razorpay sends webhook to POST /api/webhooks/razorpay
5. Webhook handler:
   - Verifies HMAC signature
   - On event "subscription.activated": updates user plan to "saathi" in MongoDB
   - On event "subscription.charged": logs renewal, extends expires_at
   - On event "subscription.cancelled": sets plan back to "free" at period end
6. Frontend polls /api/subscriptions/status to reflect updated plan
```

### 15.3 Webhook Security

```python
import hmac, hashlib

def verify_razorpay_webhook(payload_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### 15.4 Plan Enforcement

Subscription status is read from the `subscription.plan` and `subscription.expires_at` fields on the user document in MongoDB. Checked inline in request handlers — no scheduler or middleware needed.

```python
# Inline check example in claim_relay
if user["subscription"]["expires_at"] and user["subscription"]["expires_at"] < now:
    # Subscription lapsed — downgrade to free behavior
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"subscription.plan": "free", "subscription.status": "expired"}}
    )
    user["subscription"]["plan"] = "free"
```

---

## 16. Admin Panel

### 16.1 Technology

Build as a separate route section within the same React app, protected by `role === "admin"` check. Keep it simple — no separate admin framework needed at MVP scale.

### 16.2 Verification Queue UI

List view with columns: Org Name, Role (donor/recipient), City, Submitted, Document Preview, Actions (Approve | Reject).

Rejection sends email automatically with a text field for the reason. Rejection reason is stored in MongoDB and shown to the user in their dashboard.

### 16.3 Platform Stats Dashboard

Show in the admin home:

- Total users (verified / pending / rejected)
- Total relays (active / claimed / completed today)
- Meals facilitated (sum of claimed relay quantities)
- Active Saathi subscribers
- Active Daan Pro subscribers
- Monthly revenue estimate
- Disputes open

Use simple bar/line charts — implement with Recharts (already in React app) or plain HTML tables.

### 16.4 Admin Seeding

Create the first admin account manually:
1. Register a normal account via the app
2. In MongoDB Atlas console, update `role` to `"admin"` and `verification_status` to `"verified"` directly

---

## 17. Project Structure

```
platerelay/
├── backend/
│   ├── main.py                     # FastAPI app + Mangum handler for Vercel
│   ├── config.py                   # Settings from env vars
│   ├── database.py                 # Motor async MongoDB client (module-level cached)
│   ├── vercel.json                 # Vercel build config for Python serverless
│   ├── auth/
│   │   ├── dependencies.py         # get_current_user, require_donor, etc.
│   │   └── supabase.py             # Supabase client singleton
│   ├── api/
│   │   ├── auth.py                 # Registration, profile, document upload
│   │   ├── relays.py               # Relay CRUD + claim/unclaim (lazy expiry)
│   │   ├── notifications.py        # Notification fetch + mark-read
│   │   ├── impact.py               # On-demand impact stats + report generation
│   │   ├── disputes.py             # Dispute filing
│   │   ├── subscriptions.py        # Razorpay subscription management
│   │   ├── webhooks.py             # Razorpay webhook handler
│   │   └── admin.py                # Admin-only routes
│   ├── services/
│   │   ├── cloudinary_service.py   # Upload, delete, signed URL helpers
│   │   ├── email_service.py        # Resend email send helpers
│   │   ├── notification_service.py # Create + dispatch notifications
│   │   ├── geo_service.py          # Geospatial helpers
│   │   └── report_service.py       # On-demand report computation
│   ├── models/
│   │   ├── user.py                 # Pydantic models for User
│   │   ├── relay.py                # Pydantic models for Relay
│   │   └── common.py               # Shared enums, base models
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                 # Router setup
│   │   ├── store/
│   │   │   ├── authStore.js        # Zustand auth state
│   │   │   └── notificationStore.js
│   │   ├── api/
│   │   │   ├── client.js           # Axios instance with auth headers
│   │   │   ├── relays.js           # React Query hooks for relay APIs
│   │   │   ├── auth.js
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable: Button, Card, Badge, Modal, etc.
│   │   │   ├── relay/
│   │   │   │   ├── RelayCard.jsx
│   │   │   │   ├── RelayMap.jsx
│   │   │   │   ├── QualityPledgeModal.jsx
│   │   │   │   └── PostRelayForm.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── NotificationPanel.jsx
│   │   │   └── admin/
│   │   │       ├── VerificationQueue.jsx
│   │   │       └── StatsOverview.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── auth/
│   │   │   ├── donor/
│   │   │   ├── recipient/
│   │   │   └── admin/
│   │   └── utils/
│   │       ├── timeHelpers.js      # Countdown, format duration, isExpired check
│   │       └── geoHelpers.js       # Distance calculation
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example
└── README.md
```

---

## 18. Environment Variables

### Backend (`/backend/.env`) — never commit to git

```bash
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/platerelay?retryWrites=true

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@platerelay.in
RESEND_FROM_NAME=PlateRelay

# Razorpay — use rzp_test_ keys for hackathon, swap to rzp_live_ for production
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_SAATHI_PLAN_ID=plan_xxxxxxxxxxxx
RAZORPAY_DAAN_PRO_PLAN_ID=plan_xxxxxxxxxxxx

# App settings
APP_ENV=development
FRONTEND_URL=https://platerelay.vercel.app
DEFAULT_RELAY_RADIUS_KM=10
MAX_RELAY_RADIUS_KM=25
FREE_TIER_MONTHLY_CLAIMS=3
```

### Frontend (`/frontend/.env`)

```bash
VITE_API_BASE_URL=https://platerelay-backend.vercel.app
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 19. Deployment

### 19.1 Backend — Vercel (Serverless Python)

The FastAPI backend is deployed to Vercel using the `@vercel/python` runtime via **Mangum**.

**`/backend/vercel.json`:**
```json
{
  "builds": [
    { "src": "main.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "main.py" }
  ]
}
```

**Deployment steps:**
1. Push backend to GitHub
2. Import project on Vercel → select `/backend` as root directory
3. Vercel auto-detects Python; uses `requirements.txt`
4. Add all environment variables in Vercel dashboard
5. Deploy — auto-deploys on every push to `main`

**No keep-alive needed** — Vercel serverless functions spin up per request with no sleep penalty.

**MongoDB IP allowlist:** Add `0.0.0.0/0` on MongoDB Atlas (allow all IPs) since Vercel serverless functions use dynamic IPs.

### 19.2 Frontend — Vercel

1. Import frontend repo (or monorepo) on Vercel
2. Set root to `/frontend`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. Add environment variables
6. Deploy — auto-deploys on every push to `main`

Can be the same Vercel project as the backend if using a monorepo, or a separate project.

### 19.3 MongoDB Atlas

1. Create M0 (free) cluster on MongoDB Atlas
2. Create database: `platerelay`
3. Create user with read/write access
4. Set IP allowlist to `0.0.0.0/0` (required for Vercel dynamic IPs)
5. Create indexes via MongoDB Atlas console:

```javascript
db.users.createIndex({ location: "2dsphere" })
db.users.createIndex({ supabase_uid: 1 }, { unique: true })
db.relays.createIndex({ pickup_location: "2dsphere" })
db.relays.createIndex({ status: 1, "pickup_window.end": 1 })
db.relays.createIndex({ donor_id: 1 })
```

### 19.4 Razorpay Webhooks on Vercel

Razorpay webhooks need to POST to your backend. Set the webhook URL in the Razorpay dashboard to:

```
https://your-backend.vercel.app/api/webhooks/razorpay
```

Vercel serverless handles this with no extra configuration — the endpoint is always live.

### 19.5 Custom Domain (Post-Hackathon)

- Purchase `platerelay.in` on GoDaddy/Namecheap (~₹700/year)
- Add domain to Vercel project — SSL handled automatically

---

## 20. Future Roadmap

These features are explicitly OUT OF SCOPE for MVP/hackathon but should be architected to allow easy addition:

### Phase 2 (Month 3–6)

- **Vercel Cron Jobs** — Add "relay expired" email notifications using Vercel's built-in cron (free hobby plan: up to 2 cron jobs). Cron calls a dedicated `/api/cron/notify-expired` endpoint daily.
- **WhatsApp notifications** via Twilio or WATI — more reliable reach for NGOs with limited email access
- **Scheduled donations** — recurring relays (e.g., "Every Sunday, 50 meals after 3 PM")
- **Multi-location donors** — large hotel chains with multiple branches under one account
- **Mobile apps** — React Native (shared logic with React web)

### Phase 3 (Month 6–12)

- **Government / BBMP integration** — share monthly aggregate data with municipal food waste programs
- **Corporate CSR dashboard** — detailed reporting for companies under SEBI BRSR framework
- **Cold chain partnerships** — integrate with local cold storage providers for perishable logistics
- **Volunteer driver module** — PlateRelay-facilitated pickup via volunteer network for shelters without transport
- **ML food quality flagging** — basic image classification to flag likely-poor-quality photos before admin review

### Scaling Considerations

- Upgrade MongoDB to M10 paid tier when approaching 512 MB
- Move to Resend paid plan when crossing 3,000 emails/month
- Add Redis (Upstash free tier: 10K commands/day) for caching nearby relays
- Add WebSocket support for real-time notifications (Vercel supports WebSocket via Edge Functions)
- Upgrade Vercel to Pro for longer function timeouts (60s) if PDF generation becomes slow

---

## Appendix A: CO₂ Calculation Method

Used in on-demand impact reports. Based on WRAP (UK) food waste CO₂ equivalency data:

```python
CO2_PER_KG = {
    "cooked_meal": 2.5,      # kg CO₂e per kg food saved
    "packaged": 1.8,
    "bakery": 1.2,
    "raw_produce": 0.9,
    "other": 1.5
}

def calculate_co2_saved(relays: list) -> float:
    total = 0
    for relay in relays:
        # Convert servings to kg (assume 0.35 kg per serving average)
        kg = relay["quantity"]["value"] * 0.35 if relay["quantity"]["unit"] == "servings" \
             else relay["quantity"]["value"]
        total += kg * CO2_PER_KG.get(relay["category"], 1.5)
    return round(total, 2)
```

---

## Appendix B: Legal & Compliance Notes

- **FSSAI:** PlateRelay is a marketplace/technology platform, not a food business operator. Donors remain responsible for food safety compliance under FSSAI Act 2006. Add this clearly in Terms of Service.
- **Privacy:** Collect only data necessary for matching. Donor contact info (phone number) shared only with claiming recipient, not public.
- **Payments:** Razorpay handles PCI-DSS compliance. PlateRelay never stores card data.
- **Liability:** Terms of Service must include clear disclaimer that PlateRelay facilitates connections but is not responsible for food quality outcomes. Donors bear full responsibility for food safety.
- **NGO verification:** PlateRelay verifies organizations in good faith but cannot guarantee legal standing. Add this caveat in Terms of Service.

---

## Appendix C: Brand Assets Needed

Before launch, create the following assets:

- Logo (SVG + PNG): plate with an arrow/relay motif, saffron + earth colors
- App icon (512x512)
- Open Graph image (1200x630) for social sharing
- Favicon (32x32)
- Email header banner (600px wide)

---

*End of PlateRelay Product Specification v2.0*
