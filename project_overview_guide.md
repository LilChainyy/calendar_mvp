# Financial Event Calendar - Complete Project Guide

## 🎯 Project Vision

A collaborative calendar showing predictable financial events (earnings, Fed meetings, economic data) with crowd-sourced impact voting. Users can customize their calendar by dragging events from a searchable pool.

---

## 📋 Custom Subagents Created (10 Total)

### **Frontend UI Layer**
1. **calendar-layout-designer** - Calendar grid, date navigation, month/week views
2. **event-block-designer** - Visual design of event cards on calendar
3. **drag-drop-engineer** - Drag-and-drop from event pool to calendar
4. **event-modal-designer** - Event detail popups with voting interface
5. **event-search-specialist** - Search and filter event pool

### **Backend API Layer**
6. **event-api-handler** - CRUD operations for events
7. **voting-api-handler** - Vote submission and aggregation
8. **user-calendar-api** - User's custom calendar management

### **Data & Infrastructure Layer**
9. **database-schema-architect** - Database design, migrations, indexes
10. **auth-specialist** - User authentication, JWT tokens, security

---

## 🗄️ Database Schema Summary

```
users
├── id, username, email, password_hash
└── preferences (JSONB)

stocks
├── id, ticker, name, type
└── sector, market_cap

events
├── id, title, description, event_date
├── event_type, impact_scope, certainty_level
├── primary_ticker, affected_tickers[]
└── is_default, source_url

votes
├── id, user_id, event_id
├── vote ('yes', 'no', 'no_comment')
└── voted_at
└── CONSTRAINT: one vote per user per event

user_calendar_events
├── id, user_id, event_id
├── added_at, is_visible
└── CONSTRAINT: unique user-event pair
```

---

## 🎨 User Flow

### **First Visit (Not Logged In)**
1. See calendar with default events (Fed meetings, major earnings, CPI, etc.)
2. Click event → See details + voting prompt
3. "Sign up to vote" → Registration flow
4. After login → Can vote and customize calendar

### **Logged In User**
1. See calendar with default events
2. Vote on events → See aggregate results
3. Search event pool → Find specific events
4. Drag event onto calendar date → Added to personal calendar
5. Drag event to trash → Removed from personal calendar

### **Voting Flow**
```
User clicks event
  ↓
Modal opens (pre-vote state)
  ↓
User selects: 👍 Yes | 👎 No | 💬 No Comment
  ↓
API call submits vote
  ↓
Modal updates (post-vote state)
  ↓
Shows: "68% also voted Yes (851/1,247 total votes)"
  ↓
User CANNOT change vote (one-time decision)
```

---

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS for styling
- React hooks for state management
- date-fns for date handling
- Optional: react-beautiful-dnd for drag-drop

**Backend:**
- Node.js + Express
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing

**Deployment (Future):**
- Frontend: Vercel/Netlify
- Backend: Railway/Render
- Database: Railway/Supabase

---

## 📦 Project Structure

```
financial-calendar/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar/
│   │   │   │   ├── CalendarGrid.tsx
│   │   │   │   ├── DateCell.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── Events/
│   │   │   │   ├── EventBlock.tsx
│   │   │   │   ├── EventModal.tsx
│   │   │   │   └── EventPool.tsx
│   │   │   ├── Voting/
│   │   │   │   ├── VoteButtons.tsx
│   │   │   │   └── VoteResults.tsx
│   │   │   └── Auth/
│   │   │       ├── Login.tsx
│   │   │       └── Register.tsx
│   │   ├── hooks/
│   │   │   ├── useCalendar.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useVoting.ts
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   └── App.tsx
│   └── package.json
│
├── server/                    # Backend API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── votes.js
│   │   └── calendar.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── db/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seeds/
│   ├── config/
│   │   └── database.js
│   └── server.js
│
├── .env.example
├── README.md
└── package.json
```

---

## 🚀 Development Phases

### **Phase 1: Foundation (Week 1-2)**
**Agents to use:**
- database-schema-architect (create schema)
- auth-specialist (setup registration/login)
- event-api-handler (basic CRUD)

**Deliverables:**
- Database setup with migrations
- User authentication working
- Basic event API endpoints

**Test:**
```bash
# Create user
POST /api/auth/register

# Login
POST /api/auth/login

# Get events
GET /api/events
```

### **Phase 2: Calendar UI (Week 3-4)**
**Agents to use:**
- calendar-layout-designer (build grid)
- event-block-designer (event cards)
- event-modal-designer (click interactions)

**Deliverables:**
- Calendar displays month view
- Events show on correct dates
- Click event → modal opens
- Responsive mobile design

### **Phase 3: Voting System (Week 5)**
**Agents to use:**
- voting-api-handler (API endpoints)
- event-modal-designer (voting UI)

**Deliverables:**
- Vote submission works
- Results show after voting
- Aggregation displays correctly
- One vote per user enforced

### **Phase 4: Customization (Week 6)**
**Agents to use:**
- event-search-specialist (search UI)
- drag-drop-engineer (drag functionality)
- user-calendar-api (save preferences)

**Deliverables:**
- Event pool searchable
- Drag event to calendar works
- User's calendar persists
- Remove events works

### **Phase 5: Polish (Week 7-8)**
**Agents to use:**
- All agents for refinements

**Deliverables:**
- Loading states
- Error handling
- Performance optimization
- Mobile refinements
- Initial event data seeded

---

## 💡 How to Use the Subagents

### **Installation**
```bash
cd ~/.claude
git clone https://github.com/wshobson/agents.git

# Copy your custom agents
cp /path/to/your/agents/*.md ~/.claude/agents/
```

### **Example Prompts for Claude Code**

**When building calendar grid:**
```
"Use calendar-layout-designer to create a responsive month view 
calendar with date navigation."
```

**When building event cards:**
```
"Use event-block-designer to style the event blocks that appear 
on calendar dates. Make them minimal with emoji icons."
```

**When implementing drag-drop:**
```
"Use drag-drop-engineer to implement dragging events from the 
event pool onto calendar dates."
```

**When building voting:**
```
"Use voting-api-handler to create the POST /api/votes endpoint 
with proper validation and aggregation."
```

**When creating database:**
```
"Use database-schema-architect to generate the complete PostgreSQL 
schema with all tables, indexes, and constraints."
```

### **Multi-Agent Coordination**

For complex tasks, specify multiple agents:

```
"Use calendar-layout-designer and event-block-designer together to 
build the calendar view that displays events on dates."
```

```
"Use event-api-handler and voting-api-handler to build the complete 
backend for events and voting."
```

---

## 📊 Event Categories & Tagging

### **Event Types**
- 📊 **Earnings** - Quarterly/annual reports
- 🏛️ **Government** - Fed meetings, policy decisions, shutdowns
- 📈 **Economic Data** - CPI, PCE, jobs report, GDP
- 💊 **Regulatory** - FDA approvals, SEC decisions
- 🤝 **Corporate** - Mergers, splits, shareholder meetings
- 🌍 **Macro** - Elections, central bank decisions, trade deals

### **Impact Scope**
- 🎯 **Single Stock** - Affects one ticker
- 🏢 **Sector-wide** - Affects multiple stocks in sector
- 🌐 **Market-wide** - Affects entire market

### **Certainty Levels**
- ✅ **Confirmed** - Date is certain
- ⏰ **Likely** - Expected timeframe
- ❓ **Speculative** - Rumored/uncertain

---

## 🎯 MVP Feature Checklist

### **Must Have (Phase 1-4)**
- [ ] User registration & login
- [ ] Calendar displays month view
- [ ] Default events show on calendar
- [ ] Click event → modal with details
- [ ] Vote Yes/No/No Comment
- [ ] See vote results after voting
- [ ] One vote per user per event
- [ ] Search event pool
- [ ] Drag event to calendar
- [ ] Remove event from calendar
- [ ] User's calendar persists

### **Nice to Have (Phase 5+)**
- [ ] Week/day view toggle
- [ ] Multiple months displayed
- [ ] Event filtering by type/stock
- [ ] User watchlist (followed stocks)
- [ ] Real-time vote updates (WebSocket)
- [ ] Event reminders
- [ ] Export calendar (iCal)
- [ ] Dark mode

### **Future Features (Phase 2.0)**
- [ ] AI scraping of news/Reddit
- [ ] Correlation analysis (event → price impact)
- [ ] User-submitted events (with moderation)
- [ ] Comments on events
- [ ] Mobile app (React Native)
- [ ] Email notifications

---

## 🧪 Testing Strategy

### **Unit Tests**
- Vote submission logic
- Event search filtering
- Date calculations
- User authentication

### **Integration Tests**
- Full vote flow (submit → aggregate → display)
- Event CRUD operations
- User calendar management
- Drag-drop event addition

### **E2E Tests**
- User registration → login → vote → see results
- Search event → drag to calendar → remove
- Multiple users voting on same event

---

## 🔒 Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing with bcrypt
   - Rate limiting on auth endpoints

2. **Vote Integrity**
   - Database constraint: one vote per user per event
   - Rate limiting: 50 votes per hour per user
   - Require authentication for voting

3. **Data Validation**
   - Sanitize all user inputs
   - Validate event_id exists before voting
   - Check vote value is valid enum

4. **API Security**
   - CORS configuration
   - HTTPS in production
   - SQL injection prevention (parameterized queries)

---

## 🚀 Next Steps

1. **Set up development environment**
   ```bash
   # Clone repo
   git clone <your-repo>
   
   # Install dependencies
   cd client && npm install
   cd ../server && npm install
   
   # Setup database
   createdb financial_calendar
   psql financial_calendar < server/db/schema.sql
   
   # Run migrations
   npm run migrate
   
   # Seed default events
   npm run seed
   ```

2. **Start development**
   ```bash
   # Terminal 1: Start backend
   cd server && npm run dev
   
   # Terminal 2: Start frontend
   cd client && npm start
   ```

3. **Use Claude Code with subagents**
   ```bash
   # From project root
   claude-code
   
   # Then use prompts like:
   "Use database-schema-architect to create the initial migration"
   "Use calendar-layout-designer to build the calendar component"
   ```

---

## 📚 Resources

**APIs for Event Data (Future):**
- Financial Modeling Prep (earnings calendar)
- Alpha Vantage (stock data)
- Trading Economics (economic calendar)
- Federal Reserve (Fed meeting schedule)

**Documentation:**
- React: https://react.dev
- Express: https://expressjs.com
- PostgreSQL: https://postgresql.org/docs
- JWT: https://jwt.io

---

## 🤝 Contributing

When working on this project:
1. Use the appropriate subagent for each task
2. Keep agents focused on their specialty
3. Test thoroughly before integrating
4. Document any new patterns or decisions

---

## 📝 Notes

### **Simplified Event Strategy**
For MVP, don't build AI scraping. Instead:
- Manually seed 50-100 high-impact events
- Use free APIs for earnings dates
- Let users add custom events
- Phase 2: Add AI scraping & correlation

### **Vote Design Decision**
- Three options: Yes, No, No Comment
- One-time vote (cannot change)
- Results shown after voting
- Display: "68% also voted Yes (851 people)"

### **Calendar Customization**
- Default events shown initially
- Users drag events from pool to add
- Drag to trash to remove
- Simple, intuitive UX

---

**Good luck building! 🚀**