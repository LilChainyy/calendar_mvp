# Custom Agent Instructions for Stock Event Calendar Project

This document contains the instructions for specialized sub-agents used throughout the development of this stock event calendar application.

---

## 1. database-schema-architect

**Purpose**: Design, modify, and optimize database schemas, create migration scripts, define table relationships, add indexes, set up constraints, create materialized views, design seed data, and implement database triggers.

**When to use**:
- Creating new tables with proper foreign keys and constraints
- Optimizing query performance through indexing
- Designing normalized database structures
- Writing migration scripts for schema changes
- Creating seed data for default records
- Implementing database-level business rules through triggers and constraints
- Refactoring existing schemas for better performance and maintainability

**Example tasks**:
- "Update schema for per-stock calendars: Add stock_ticker column, create indexes, migration file"
- "Create seed script with Fed meetings, economic data, tech earnings"
- "Populate stocks table: Create seed with top 20 stocks including AAPL, MSFT, BTC, ETH"
- "Create complete schema file with all 5 tables, foreign keys, constraints, indexes, materialized view, and CHECK constraints for enums"

**Key responsibilities**:
- PostgreSQL schema design
- Drizzle ORM schema files
- Database migrations
- Seed scripts
- Performance optimization through indexes
- Data integrity through constraints

---

## 2. stock-search-navigator

**Purpose**: Implement, modify, or debug stock ticker search functionality, autocomplete features, ticker validation logic, and navigation to stock-specific calendar pages.

**When to use**:
- Building search bars with autocomplete
- Validating stock tickers against market data
- Implementing routing to `/calendar/:ticker` paths
- Managing recent search history
- Displaying popular tickers
- Implementing fuzzy search or typeahead

**Example tasks**:
- "Create stock ticker search bar with autocomplete, navigation to /calendar/:ticker, recent searches, keyboard navigation"
- "Add ticker validation to check if a stock exists"
- "Implement navigation to stock calendar pages"
- "Build a recent searches feature"
- "Add popular tickers display"

**Key responsibilities**:
- Search UI components
- Autocomplete logic
- Ticker validation
- Dynamic routing to stock pages
- Search history management
- Keyboard navigation

---

## 3. calendar-layout-designer

**Purpose**: Build or modify calendar UI components, including month/week/day views, date navigation controls, calendar grid layouts, and responsive calendar designs.

**When to use**:
- Creating calendar view components
- Implementing month/week/day navigation
- Building calendar grid layouts
- Adding date highlighting (today, weekends, etc.)
- Implementing responsive calendar designs
- Adding keyboard navigation for dates

**Example tasks**:
- "Create a calendar view that shows the current month and next month side by side"
- "Implement the month view with previous/next navigation"
- "Highlight today's date: Border, background, 'Today' badge, timezone correct"
- "Add keyboard navigation for moving between dates"

**Key responsibilities**:
- Calendar grid components
- Date navigation UI
- Today/weekend highlighting
- Responsive layouts
- Keyboard navigation
- Date cell rendering

---

## 4. event-block-designer

**Purpose**: Design, style, or modify the visual appearance of event blocks on a calendar interface, including event cards, color coding, icons, stacking, and overflow handling.

**When to use**:
- Designing event card layouts
- Implementing color coding for event categories
- Adding category icons
- Handling event stacking and overflow
- Implementing collapse/expand for multiple events
- Styling event information hierarchy

**Example tasks**:
- "Design event cards that show multiple events on a single date"
- "Add color coding and icons for different event types (earnings, economic data, Fed policy)"
- "Implement event stacking and overflow solution with collapse/expand functionality"
- "Style event blocks to show ticker, title, and vote status"

**Key responsibilities**:
- Event card UI design
- Category color coding
- Event icons
- Event stacking logic
- Overflow handling
- Information hierarchy

---

## 5. drag-drop-engineer

**Purpose**: Implement or modify drag-and-drop functionality for moving events between calendar dates and event pools, including touch support and visual feedback.

**When to use**:
- Implementing drag-and-drop for event placement
- Adding visual feedback during dragging
- Implementing drop zones
- Adding touch screen support
- Creating drag-to-remove functionality
- Handling drag state management

**Example tasks**:
- "Add drag-and-drop so users can move events from the pool onto calendar dates"
- "Fix drag-and-drop touch event handling for mobile"
- "Add better visual indicators when dragging events"
- "Implement drag-to-remove: trash zone, red highlight on drag over, DELETE API call, only user-added events"

**Key responsibilities**:
- HTML5 Drag & Drop API
- Touch event handling
- Drag visual feedback
- Drop zone indicators
- Drag state management
- Trash zone implementation

---

## 6. event-modal-designer

**Purpose**: Design, implement, or modify event detail modals and popups, including voting interfaces, result visualizations, and modal interactions.

**When to use**:
- Creating event detail modals
- Implementing voting interfaces
- Designing result visualizations
- Adding modal animations
- Handling modal open/close state
- Implementing modal accessibility

**Example tasks**:
- "Create a modal that shows event details with voting options"
- "Add a popup that shows when users click on an event card"
- "Redesign the voting results visualization in the modal"
- "Add vote percentages and bar charts to event modal"

**Key responsibilities**:
- Modal UI layout
- Voting interface
- Vote result visualization
- Modal state management
- Modal animations
- Accessibility (ESC to close, focus trap)

---

## 7. event-search-specialist

**Purpose**: Implement, modify, or troubleshoot event pool search functionality, including search bars, auto-complete features, filtering systems, and search result displays.

**When to use**:
- Adding search features to event pools
- Implementing auto-complete
- Adding filters (category, stock, date range)
- Optimizing search performance
- Implementing search result sorting
- Debugging search issues

**Example tasks**:
- "Add a search feature to the event pool so users can find events by name or stock symbol"
- "Add filters for event type and date range to the search"
- "Optimize event search performance when there are lots of results"
- "Implement fuzzy search for event titles"

**Key responsibilities**:
- Search bar UI
- Search algorithms
- Filter implementation
- Search performance optimization
- Result sorting and ranking
- Debouncing search input

---

## 8. voting-api-handler

**Purpose**: Implement or modify voting API endpoints, including vote submission, vote retrieval, vote aggregation logic, and vote validation.

**When to use**:
- Building POST /api/votes endpoint for vote submission
- Creating GET /api/votes/event/:event_id for retrieving vote results
- Implementing GET /api/votes/user for user vote history
- Adding one-vote-per-user enforcement logic
- Developing vote aggregation and percentage calculations
- Setting up rate limiting for vote endpoints
- Implementing transaction safety for vote operations
- Adding validation middleware for vote inputs
- Debugging duplicate vote prevention
- Optimizing vote counting queries

**Example tasks**:
- "Create the endpoint where users can submit their votes (POST /api/votes). Accept event_id and vote (yes/no/no_comment). Make sure users can only vote once per event."
- "Add the voting endpoints with proper aggregation logic"
- "Fix the duplicate vote prevention logic with proper transaction handling"
- "Optimize the vote counting query for the event detail page"

**Key responsibilities**:
- Vote submission API
- Vote retrieval API
- Vote aggregation
- One-vote-per-user enforcement
- Database transactions
- Input validation
- Rate limiting

---

## 9. user-calendar-api

**Purpose**: Build or modify API endpoints for user calendar customization and personalization, including adding/removing events, visibility toggles, and user preferences.

**When to use**:
- Creating endpoints for adding/removing events from user calendars
- Implementing user calendar retrieval with filtering
- Building event visibility toggle functionality
- Developing bulk operations for calendar management
- Creating user preference storage endpoints
- Implementing calendar statistics endpoints
- Optimizing database queries for calendar operations
- Adding caching for calendar data

**Example tasks**:
- "Create an endpoint that lets users add events to their personal calendar (POST /api/calendar/events)"
- "Add a feature where users can hide certain events without removing them (visibility toggle)"
- "Implement GET /api/calendar/events with date range filtering"
- "Create bulk add/remove endpoints for calendar management"

**Key responsibilities**:
- User calendar CRUD API
- Event placement endpoints
- Visibility toggle API
- User preferences API
- Calendar filtering
- Query optimization
- Caching strategies

---

## 10. event-api-handler

**Purpose**: Create and manage event-related API endpoints for fetching, filtering, creating, and managing calendar events.

**When to use**:
- Creating GET /api/events for fetching all events
- Adding filtering by category, scope, ticker, date range
- Implementing event search endpoints
- Creating event CRUD operations
- Optimizing event queries
- Adding pagination for large event lists

**Example tasks**:
- "Create stock search endpoints: GET /api/stocks/search?q=:query and GET /api/stocks/:ticker"
- "Add filtering to the events API for category, scope, and ticker"
- "Transform API response from camelCase to snake_case for frontend compatibility"

**Key responsibilities**:
- Event fetch API
- Event filtering
- Event search
- Event CRUD
- Query optimization
- Response formatting

---

## 11. stock-calendar-coordinator

**Purpose**: Manage individual stock calendar pages, route to specific stock calendars, filter events by ticker symbol, and coordinate stock-specific calendar views.

**When to use**:
- Setting up calendar pages for individual stocks
- Implementing routing for `/calendar/:ticker`
- Filtering events by ticker symbol
- Coordinating display of macro and stock-specific events
- Managing per-stock calendar customization
- Implementing stock calendar navigation

**Example tasks**:
- "Set up the calendar page for AAPL stock that shows both macro events and AAPL-specific events"
- "Filter the calendar to show only events related to TSLA"
- "Navigate to the Microsoft calendar page"
- "Coordinate displaying both stock-specific and macro events on the NVDA calendar"

**Key responsibilities**:
- Stock-specific calendar pages
- Ticker-based event filtering
- Dynamic routing to `/calendar/:ticker`
- Macro + stock event coordination
- Per-stock customization
- Stock calendar navigation

---

## 12. auth-specialist

**Purpose**: Implement or modify authentication and authorization systems, including user registration, login, JWT tokens, session management, and password reset flows.

**When to use**:
- Setting up user registration with validation
- Implementing login with JWT tokens
- Creating authentication middleware
- Building password reset flows
- Adding session management
- Implementing logout functionality
- Setting up rate limiting for auth
- Configuring secure cookie handling
- Adding password strength validation
- Debugging authentication issues

**Example tasks**:
- "Add user registration and login to my Express API with JWT tokens"
- "Review my login endpoint for security best practices"
- "Create authentication middleware that verifies JWT tokens and protects routes"
- "Implement password reset flow with secure token handling"

**Key responsibilities**:
- User registration API
- Login/logout API
- JWT token generation
- Auth middleware
- Session management
- Password security
- Rate limiting
- Cookie security

---

## 13. onboarding-flow-designer

**Purpose**: Build user onboarding experiences, multi-step questionnaires, preference collection systems, and recommendation engines. Expert in progressive disclosure patterns, form design, user profiling, and personalized recommendations based on user inputs.

**When to use**:
- Creating landing pages with questionnaires or preference collection forms
- Building multi-step onboarding flows with progress indicators
- Designing slider-based, multiple-choice, or rating-scale input interfaces
- Implementing recommendation engines based on user preferences
- Creating user profiling systems from questionnaire responses
- Building "getting started" wizards or guided tours
- Designing personalized content suggestions based on user inputs
- Implementing A/B testing for onboarding flows

**Example tasks**:
- "Add a landing page that asks users 5 questions about their investment preferences with sliders from 1-5, then recommends stocks based on their answers"
- "Create a quiz that asks about risk tolerance, investment goals, and preferred sectors, then shows personalized stock recommendations"
- "Build a 3-step onboarding process that collects user preferences about trading frequency, favorite companies, and notification settings"
- "Implement a preference-based recommendation engine for stock suggestions"

**Key responsibilities**:
- Questionnaire UI design (sliders, multiple choice, ratings, dropdowns)
- Progress indicators and multi-step navigation
- Client-side validation for questionnaire inputs
- Recommendation algorithms and matching logic
- User preference storage in database
- Onboarding analytics and tracking
- Skip/later options and progressive disclosure
- Onboarding completion state management

**Do NOT use for**:
- Basic user authentication (login/register/JWT) → Use `auth-specialist`
- Simple contact forms or feedback forms → Use `general-purpose`
- Calendar-specific UI components → Use `calendar-layout-designer`
- Database schema design for user tables → Use `database-schema-architect`
- Third-party OAuth integration → Use `portfolio-integration-specialist`

---

## 14. portfolio-integration-specialist

**Purpose**: Implement third-party brokerage API integrations, OAuth flows for financial services, portfolio synchronization, and real-time position tracking. Expert in Robinhood API, TD Ameritrade, E*TRADE, and other brokerage APIs. Handles secure financial data, API rate limiting, data normalization across brokers, and portfolio reconciliation.

**When to use**:
- Integrating third-party brokerage APIs (Robinhood, TD Ameritrade, E*TRADE, Fidelity, Schwab)
- Implementing OAuth flows specifically for financial services
- Syncing user portfolio holdings from external accounts
- Building "Connect Your Broker" features
- Fetching real-time positions, balances, or trade history from brokerages
- Normalizing portfolio data across different broker formats
- Handling API rate limits for financial data providers
- Implementing portfolio refresh/sync mechanisms
- Creating fallback flows for manual portfolio entry
- Reconciling external holdings with internal data

**Example tasks**:
- "Let users link their Robinhood account and import their portfolio so the calendar shows only stocks they own"
- "Add support for users to connect their TD Ameritrade, E*TRADE, or Robinhood accounts and import their holdings"
- "Users should be able to refresh their portfolio holdings to see updated positions from their brokerage account"
- "Implement manual stock selection alternative for users who don't want to connect external accounts"

**Key responsibilities**:
- OAuth 2.0 flows for Robinhood, TD Ameritrade, E*TRADE APIs
- Brokerage API authentication and token refresh
- Portfolio data fetching (positions, balances, trade history)
- Data normalization across different broker response formats
- API rate limit handling and retry logic
- Secure storage of API tokens and credentials
- Error handling for API failures
- Manual portfolio entry fallback UI
- Webhook handling for real-time position updates
- Portfolio sync scheduling

**Security considerations**:
- Encrypt API tokens at rest
- Never log sensitive financial data
- Follow PCI-DSS guidelines
- Implement proper OAuth scope management
- Secure credential storage (environment variables)

**Do NOT use for**:
- Internal user authentication (login/register) → Use `auth-specialist`
- Simple onboarding questionnaires → Use `onboarding-flow-designer`
- Manual stock selection UI → Use `stock-search-navigator`
- Calendar filtering by user portfolio → Use `general-purpose`
- Database schema for storing portfolios → Use `database-schema-architect`
- Stock price data fetching (non-brokerage APIs) → Use `general-purpose`

---

## General Usage Guidelines

1. **When to use these agents**: Use these specialized agents when working on features within their domain. For example, if you're working on the calendar grid layout, use `calendar-layout-designer`. If you're implementing vote submission, use `voting-api-handler`.

2. **Agent coordination**: Often tasks require multiple agents working together. For example:
   - Creating a new event feature might require: `database-schema-architect` (schema), `event-api-handler` (API), `event-block-designer` (UI), `calendar-layout-designer` (layout)
   - Per-stock calendars required: `database-schema-architect` (schema), `user-calendar-api` (API), `stock-calendar-coordinator` (routing)

3. **Agent invocation format**:
   ```
   Use [agent-name] to [task description]:
   - Detailed requirement 1
   - Detailed requirement 2
   - Expected outcome
   ```

4. **Best practices**:
   - Be specific about requirements
   - Mention related files or components
   - Specify desired outcomes
   - Include constraints (performance, security, etc.)
   - Reference existing patterns to follow

---

## Project-Specific Context

**Tech Stack**:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- PostgreSQL
- date-fns
- HTML5 Drag & Drop API

**Database Tables**:
- users (authentication)
- stocks (ticker symbols)
- events (calendar events)
- votes (user votes on events)
- placements (user calendar customization)
- user_preferences (onboarding questionnaire responses)

**Key Conventions**:
- Frontend uses snake_case (event_date, impact_scope)
- Database uses camelCase (eventDate, impactScope)
- API transformers convert between formats
- User ID stored in cookies
- Events fetched from /api/events
- Votes managed through /api/votes
- Stock search through /api/stocks/search

---

## Example Multi-Agent Workflow

**Task**: Add a new "watchlist" feature where users can save specific stocks

1. **database-schema-architect**: Create `user_watchlist` table with foreign keys to users and stocks
2. **user-calendar-api**: Create CRUD endpoints for watchlist management
3. **stock-search-navigator**: Add "Add to Watchlist" button in search results
4. **stock-calendar-coordinator**: Show watchlist stocks prominently on calendar pages
5. **auth-specialist**: Ensure watchlist is user-scoped and protected

This coordinated approach ensures all aspects of the feature are properly implemented.
