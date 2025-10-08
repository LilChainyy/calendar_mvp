# Portfolio Integration Documentation

## Overview

This document describes the portfolio integration feature that allows users to connect their brokerage accounts (Robinhood, TD Ameritrade, E*TRADE) or manually select stocks to track on their calendar.

## Architecture

### Database Schema

#### `user_portfolios` Table
- `id` (uuid) - Primary key
- `user_id` (text) - References cookie-based user ID
- `broker_name` (text) - 'robinhood' | 'td_ameritrade' | 'etrade' | 'manual'
- `access_token_encrypted` (text) - AES-256-GCM encrypted OAuth access token
- `refresh_token_encrypted` (text) - AES-256-GCM encrypted OAuth refresh token
- `token_expires_at` (timestamp) - Token expiration time
- `connection_status` (text) - 'connected' | 'disconnected' | 'error'
- `last_sync_at` (timestamp) - Last successful sync timestamp
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `portfolio_user_id_idx` on `user_id`
- `broker_name_idx` on `broker_name`
- `connection_status_idx` on `connection_status`
- `user_broker_idx` composite on `(user_id, broker_name)`

#### `portfolio_holdings` Table
- `id` (uuid) - Primary key
- `portfolio_id` (uuid) - Foreign key to `user_portfolios.id` (CASCADE DELETE)
- `ticker` (text) - Stock ticker symbol
- `quantity` (numeric 18,8) - Number of shares
- `cost_basis` (numeric 18,2) - Average cost per share
- `current_value` (numeric 18,2) - Current market value
- `last_updated` (timestamp) - Last update timestamp
- `created_at` (timestamp)

**Indexes:**
- `portfolio_id_idx` on `portfolio_id`
- `holding_ticker_idx` on `ticker`
- `portfolio_ticker_idx` composite on `(portfolio_id, ticker)`

### API Routes

#### 1. `POST /api/portfolio/connect`
Initiates OAuth connection flow for a broker.

**Request:**
```json
{
  "broker": "robinhood" | "td_ameritrade" | "etrade"
}
```

**Response:**
```json
{
  "success": true,
  "authorization_url": "https://broker.com/oauth/authorize?...",
  "state": "oauth_state_token",
  "broker": "robinhood",
  "broker_name": "Robinhood",
  "mock_callback_url": "http://localhost:3000/api/portfolio/callback?..." // MVP only
}
```

#### 2. `GET /api/portfolio/callback`
Handles OAuth callback from broker. Exchanges code for tokens and stores encrypted credentials.

**Query Parameters:**
- `code` - OAuth authorization code
- `state` - OAuth state parameter (CSRF protection)

**Redirects to:**
- Success: `/portfolio/success?broker={broker}`
- Error: `/portfolio/error?message={error}`

#### 3. `POST /api/portfolio/sync`
Syncs portfolio holdings from broker API.

**Request:**
```json
{
  "portfolio_id": "uuid" // Optional: sync specific portfolio
}
```

**Response:**
```json
{
  "success": true,
  "holdings": [...],
  "last_sync_at": "2025-10-07T12:00:00.000Z",
  "portfolios_synced": 1
}
```

**Rate Limiting:** 1 request per minute per user

#### 4. `GET /api/portfolio/holdings`
Retrieves user's current holdings.

**Response:**
```json
{
  "success": true,
  "portfolios": [
    {
      "id": "uuid",
      "broker_name": "robinhood",
      "connection_status": "connected",
      "last_sync_at": "2025-10-07T12:00:00.000Z",
      "holdings": [
        {
          "id": "uuid",
          "ticker": "AAPL",
          "quantity": "10",
          "cost_basis": "150.00",
          "current_value": "1750.50",
          "last_updated": "2025-10-07T12:00:00.000Z"
        }
      ]
    }
  ],
  "summary": {
    "total_portfolios": 1,
    "total_holdings": 5,
    "unique_tickers": 5,
    "connected_brokers": 1
  }
}
```

#### 5. `DELETE /api/portfolio/disconnect`
Disconnects a portfolio and removes holdings.

**Request:**
```json
{
  "portfolio_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio disconnected successfully",
  "broker_name": "robinhood"
}
```

#### 6. `POST /api/portfolio/manual`
Creates/updates manual portfolio with selected tickers.

**Request:**
```json
{
  "tickers": ["AAPL", "GOOGL", "MSFT"]
}
```

**Response:**
```json
{
  "success": true,
  "portfolio_id": "uuid",
  "holdings": [...],
  "message": "Manual portfolio created successfully",
  "tickers_added": 3
}
```

**Validation:**
- Tickers must be 1-5 uppercase letters
- Maximum 50 tickers per manual portfolio

### Frontend Pages

#### `/portfolio/connect`
Broker selection page with OAuth connection flow.

**Features:**
- Broker cards (Robinhood, TD Ameritrade, E*TRADE)
- Manual stock selection option
- Security information
- Loading states

#### `/portfolio/manual`
Manual stock selection page.

**Features:**
- Stock ticker input with validation
- Popular stocks quick-add
- Selected stocks display with remove option
- Load existing manual portfolio on mount
- Maximum 50 tickers

#### `/portfolio/success`
OAuth callback success page with auto-sync.

**Features:**
- Automatic portfolio sync on load
- Loading states with progress indicators
- Auto-redirect to calendar after 2 seconds
- Error handling with manual retry

#### `/portfolio/error`
OAuth error page.

**Features:**
- Error message display
- Retry connection option
- Fallback to manual selection
- Skip option

#### `/portfolio`
Portfolio management dashboard.

**Features:**
- Portfolio summary statistics
- Holdings display per broker
- Sync portfolio button (rate-limited)
- Disconnect portfolio with confirmation modal
- Add new portfolio option

### Components

#### `PortfolioHoldings.tsx`
Reusable component for displaying and managing portfolios.

**Features:**
- Fetch and display all user portfolios
- Summary statistics card
- Per-portfolio sync functionality
- Disconnect with confirmation modal
- Loading and error states
- Empty state with call-to-action

## Security

### Token Encryption

All OAuth tokens are encrypted using AES-256-GCM before storage.

**Utility Functions:** `/src/lib/crypto.ts`

```typescript
encryptToken(plaintext: string): string
decryptToken(encrypted: string): string
generateEncryptionKey(): string
testEncryption(): boolean
```

**Encrypted Format:** `{iv}:{authTag}:{ciphertext}` (all hex-encoded)

**Environment Variable:**
```
PORTFOLIO_ENCRYPTION_KEY=<64 hex characters (32 bytes)>
```

Generate a new key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Security Best Practices

1. **Never log decrypted tokens or sensitive data**
2. **Tokens are encrypted at rest in database**
3. **OAuth state parameter validation (TODO: production)**
4. **Rate limiting on sync endpoints**
5. **User authentication via cookie-based user_id**
6. **HTTPS required for production OAuth callbacks**
7. **Minimum necessary OAuth scopes requested**

## Testing

### End-to-End Testing Flow

#### Test OAuth Connection (Mock Flow)
1. Navigate to `/portfolio/connect`
2. Click "Connect" on any broker
3. API returns mock OAuth URL with `mock_callback_url`
4. Redirects to mock callback
5. Callback processes mock tokens
6. Redirects to `/portfolio/success`
7. Auto-syncs portfolio (with mock data)
8. Redirects to `/calendar`

#### Test Manual Portfolio
1. Navigate to `/portfolio/manual`
2. Add tickers (e.g., AAPL, GOOGL, MSFT)
3. Click "Save Portfolio"
4. Redirects to `/calendar`

#### Test Portfolio Management
1. Navigate to `/portfolio`
2. View connected portfolios and holdings
3. Click "Sync Now" to refresh holdings
4. Click "Disconnect" to remove portfolio

### Seed Demo Data

Run the seed script to populate database with demo portfolio:

```bash
npx tsx src/lib/db/seeds/003_portfolio_demo.ts
```

**Demo Data:**
- User: `demo_user`
- Robinhood portfolio with 5 holdings
- Manual portfolio with 5 holdings
- Total 10 unique tickers

### API Testing with cURL

```bash
# Connect broker (returns mock OAuth URL)
curl -X POST http://localhost:3000/api/portfolio/connect \
  -H "Content-Type: application/json" \
  -b "user_id=demo_user" \
  -d '{"broker":"robinhood"}'

# Get holdings
curl http://localhost:3000/api/portfolio/holdings \
  -b "user_id=demo_user"

# Sync portfolio
curl -X POST http://localhost:3000/api/portfolio/sync \
  -H "Content-Type: application/json" \
  -b "user_id=demo_user" \
  -d '{}'

# Create manual portfolio
curl -X POST http://localhost:3000/api/portfolio/manual \
  -H "Content-Type: application/json" \
  -b "user_id=demo_user" \
  -d '{"tickers":["AAPL","GOOGL","MSFT"]}'
```

## Production TODOs

### High Priority

1. **Real OAuth Implementation**
   - Register apps with brokers (Robinhood, TD Ameritrade, E*TRADE)
   - Obtain client IDs and secrets
   - Configure OAuth redirect URIs
   - Implement state parameter validation with database storage
   - Add PKCE for mobile/SPA clients
   - Handle OAuth errors and edge cases

2. **Real Broker API Integration**
   - Replace mock `fetchBrokerHoldings()` with actual API calls
   - Handle broker-specific API formats
   - Implement automatic token refresh logic
   - Handle API rate limits and errors
   - Add retry logic with exponential backoff

3. **Token Refresh Automation**
   - Background job to refresh expiring tokens
   - Detect token expiration and trigger refresh
   - Update connection status on refresh failure
   - Notify users of expired connections

4. **Enhanced Security**
   - Implement OAuth state validation with database
   - Add CSRF tokens to forms
   - Rotate encryption keys periodically
   - Audit log for portfolio operations
   - Add 2FA for sensitive operations

### Medium Priority

5. **Rate Limiting**
   - Move from in-memory to Redis/database
   - Implement per-broker rate limits
   - Add retry-after headers
   - Queue sync requests when rate-limited

6. **Error Handling**
   - Better error messages for users
   - Distinguish between user errors and system errors
   - Implement circuit breaker for unreliable APIs
   - Add error recovery flows

7. **Data Validation**
   - Verify tickers against stock database
   - Validate holdings data from brokers
   - Detect and handle stale data
   - Reconciliation between broker and local data

8. **Performance**
   - Cache frequently accessed portfolio data
   - Optimize database queries with proper indexes
   - Implement pagination for large portfolios
   - Background sync jobs

### Low Priority

9. **Features**
   - Multiple accounts per broker
   - Portfolio performance tracking
   - Cost basis tracking and tax reporting
   - Dividend tracking
   - Alerts for position changes
   - Export portfolio data

10. **UI/UX**
    - Portfolio value charts
    - Holdings search and filtering
    - Bulk operations (select multiple holdings)
    - Mobile-optimized views
    - Accessibility improvements

## Known Limitations (MVP)

1. **Mock OAuth Flow**: Uses simulated broker connections with fake tokens
2. **Mock Holdings Data**: Returns hardcoded stock positions
3. **In-Memory Rate Limiting**: Does not persist across server restarts
4. **No Token Refresh**: Tokens expire but are not automatically refreshed
5. **No State Validation**: OAuth state parameter is not validated against stored values
6. **Single Account Per Broker**: Users can only connect one account per broker
7. **No Real-Time Updates**: Holdings only update on manual sync
8. **Basic Ticker Validation**: Only checks format, not existence in market

## Troubleshooting

### "PORTFOLIO_ENCRYPTION_KEY environment variable is not set"
Generate and add to `.env.local`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Rate limit exceeded"
Wait 1 minute between sync requests, or clear in-memory cache by restarting server.

### "Portfolio not found or unauthorized"
Ensure `user_id` cookie is set correctly. Check browser DevTools > Application > Cookies.

### "Failed to decrypt token"
Encryption key may have changed. Reconnect portfolio to generate new encrypted tokens.

### Database connection errors
Verify `DATABASE_URL` in `.env.local` and ensure PostgreSQL is running:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

## Files Created/Modified

### Database
- `/drizzle/0005_portfolio_integration.sql` - Migration
- `/src/lib/db/schema.ts` - Schema definitions

### API Routes
- `/src/app/api/portfolio/connect/route.ts`
- `/src/app/api/portfolio/callback/route.ts`
- `/src/app/api/portfolio/sync/route.ts`
- `/src/app/api/portfolio/holdings/route.ts`
- `/src/app/api/portfolio/disconnect/route.ts`
- `/src/app/api/portfolio/manual/route.ts`

### Frontend Pages
- `/src/app/portfolio/page.tsx` - Portfolio dashboard
- `/src/app/portfolio/connect/page.tsx` - Broker connection
- `/src/app/portfolio/manual/page.tsx` - Manual stock selection
- `/src/app/portfolio/success/page.tsx` - OAuth success
- `/src/app/portfolio/error/page.tsx` - OAuth error

### Components
- `/src/components/PortfolioHoldings.tsx` - Portfolio display

### Utilities
- `/src/lib/crypto.ts` - Token encryption
- `/src/lib/types.ts` - TypeScript types
- `/src/lib/db/seeds/003_portfolio_demo.ts` - Demo data seed

### Configuration
- `/.env.local` - Added `PORTFOLIO_ENCRYPTION_KEY` and `NEXT_PUBLIC_APP_URL`

## Support

For questions or issues:
1. Check this documentation
2. Review the code comments (extensively documented)
3. Test with demo data seed
4. Check console logs for errors (no sensitive data logged)

---

**Last Updated:** 2025-10-07
**Version:** 1.0.0 (MVP)
