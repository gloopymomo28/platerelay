# 🍽️ PlateRelay

### *Every surplus meal finds its next table.*

**PlateRelay** is a zero-waste food logistics platform connecting restaurants, hotels, and caterers with local shelters, NGOs, and community kitchens. When a donor has surplus food, they post a "relay" — a time-boxed listing with a food photo, meal count, and pickup window. Registered recipients get instant notifications and can claim it in one tap.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free M0 cluster)
- Supabase account
- Cloudinary account
- Resend account
- Razorpay account (test mode)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp ../.env.example .env  # Fill in your values
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp ../.env.example .env  # Copy VITE_ vars only
npm run dev
```

### Deploy to Vercel

1. Push to GitHub
2. Import on Vercel → deploy `/backend` and `/frontend` as separate projects
3. Add environment variables in Vercel dashboard
4. Set MongoDB Atlas IP allowlist to `0.0.0.0/0`

---

## 🎯 Demo Credentials (Razorpay Test Mode)

| Method | Value |
|--------|-------|
| Card | `4111 1111 1111 1111` (any future expiry, any CVV) |
| UPI | `success@razorpay` |
| Failed card | `4000 0000 0000 0002` |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI + Mangum (Vercel serverless) |
| Database | MongoDB Atlas (M0 free) |
| Auth | Supabase Auth |
| Storage | Cloudinary |
| Email | Resend |
| Payments | Razorpay (test mode) |
| Maps | Leaflet.js + OpenStreetMap |
| Animations | Anime.js |
| Hosting | Vercel (free hobby plan) |

---

## 🎖️ Donor Rewards

| Badge | Criteria |
|-------|----------|
| 🌱 First Relay | 1 completed relay |
| 🦸 Hunger Hero | 10 completed relays |
| 🏅 Food Champion | 25 completed relays |
| 🏆 PlateRelay Legend | 50 completed relays |
| 👑 Consistency King | 7 consecutive days posting |
| 🏛️ Community Pillar | Donated to 10+ unique shelters |
| 💯 Century Club | 100+ total meals donated |

---

## 📁 Project Structure

```
platerelay/
├── backend/           # FastAPI serverless backend
│   ├── main.py        # App entry + Mangum handler
│   ├── api/           # Route handlers
│   ├── auth/          # Supabase auth middleware
│   ├── models/        # Pydantic models
│   ├── services/      # Business logic
│   └── vercel.json    # Vercel config
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── store/
│   │   └── lib/
│   └── index.html
├── .env.example
└── README.md
```

---

## 📄 License

Built with ❤️ for Hackprix 2026.

*Because leftovers deserve a standing ovation.* 🍽️
