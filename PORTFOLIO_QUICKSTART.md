# Portfolio Integration - Quick Start Guide

## Setup (5 minutes)

### 1. Database Migration
```bash
psql postgresql://lilchainyy@localhost:5432/charting -f drizzle/0005_portfolio_integration.sql
```

### 2. Environment Variables
Already configured in `.env.local`:
```
PORTFOLIO_ENCRYPTION_KEY=989b1121d91a4d90d6d5143d02e6e6f19f78b92769a76d84f1b671124500a2f8
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Verify Encryption
```bash
node test-encryption.js
```
Expected output: ✅ Encryption test PASSED!

### 4. Seed Demo Data (Optional)
```bash
npx tsx src/lib/db/seeds/003_portfolio_demo.ts
```

### 5. Start Dev Server
```bash
npm run dev
```

---

## Test the Feature

### Test OAuth Connection Flow (Mock)
1. Visit: `http://localhost:3000/portfolio/connect`
2. Click "Connect" on any broker
3. Follow the mock OAuth flow
4. See portfolio sync automatically
5. View holdings at `/portfolio`

### Test Manual Stock Selection
1. Visit: `http://localhost:3000/portfolio/manual`
2. Add tickers: AAPL, GOOGL, MSFT
3. Click "Save Portfolio"
4. View at `/portfolio`

### Test API Directly
```bash
# Get holdings (using demo_user from seed)
curl http://localhost:3000/api/portfolio/holdings \
  -H "Cookie: user_id=demo_user"

# Create manual portfolio
curl -X POST http://localhost:3000/api/portfolio/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: user_id=test_user" \
  -d '{"tickers":["AAPL","GOOGL","MSFT"]}'
```

---

## Key Routes

| Route | Description |
|-------|-------------|
| `/portfolio` | Portfolio management dashboard |
| `/portfolio/connect` | Connect brokerage account |
| `/portfolio/manual` | Manually select stocks |
| `/portfolio/success` | OAuth success page |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/portfolio/connect` | Start OAuth flow |
| GET | `/api/portfolio/callback` | Handle OAuth callback |
| POST | `/api/portfolio/sync` | Sync holdings |
| GET | `/api/portfolio/holdings` | Get all holdings |
| DELETE | `/api/portfolio/disconnect` | Remove portfolio |
| POST | `/api/portfolio/manual` | Create manual portfolio |

---

## MVP Limitations

- ⚠️ Uses mock OAuth flow (not real broker connections)
- ⚠️ Returns hardcoded holdings data
- ⚠️ In-memory rate limiting (resets on server restart)
- ⚠️ No automatic token refresh

---

## Production TODOs

1. Register OAuth apps with brokers
2. Replace mock holdings with real API calls
3. Implement token refresh automation
4. Add Redis for rate limiting
5. Validate OAuth state against database

---

## Files Created

**Database:**
- `drizzle/0005_portfolio_integration.sql`
- `src/lib/db/schema.ts` (modified)

**API Routes (6):**
- `src/app/api/portfolio/connect/route.ts`
- `src/app/api/portfolio/callback/route.ts`
- `src/app/api/portfolio/sync/route.ts`
- `src/app/api/portfolio/holdings/route.ts`
- `src/app/api/portfolio/disconnect/route.ts`
- `src/app/api/portfolio/manual/route.ts`

**Pages (5):**
- `src/app/portfolio/page.tsx`
- `src/app/portfolio/connect/page.tsx`
- `src/app/portfolio/manual/page.tsx`
- `src/app/portfolio/success/page.tsx`
- `src/app/portfolio/error/page.tsx`

**Components:**
- `src/components/PortfolioHoldings.tsx`

**Utilities:**
- `src/lib/crypto.ts`
- `src/lib/types.ts` (modified)
- `src/lib/db/seeds/003_portfolio_demo.ts`

**Docs:**
- `PORTFOLIO_INTEGRATION.md` (detailed)
- `PORTFOLIO_IMPLEMENTATION_SUMMARY.md` (executive summary)
- `PORTFOLIO_QUICKSTART.md` (this file)

---

## Troubleshooting

**"Encryption key not set"**
→ Already configured in `.env.local`, run: `node test-encryption.js`

**"Rate limit exceeded"**
→ Wait 1 minute or restart server

**"Portfolio not found"**
→ Check user_id cookie is set

**Database errors**
→ Verify: `psql postgresql://lilchainyy@localhost:5432/charting -c "SELECT 1"`

---

## Questions?

See full documentation: `PORTFOLIO_INTEGRATION.md`
