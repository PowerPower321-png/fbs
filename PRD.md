# Product Requirements Document (PRD)

## FB ROI Checker - Facebook Ads ROI Calculator

---

## 1. Product Overview

**FB ROI Checker** is a Progressive Web Application (PWA) that helps marketers and business owners instantly calculate their Facebook Ads Return on Investment (ROI), including ROAS (Return on Ad Spend), LTV (Customer Lifetime Value), and CPA (Cost Per Acquisition). The app provides AI-powered advice on whether to scale or kill advertising campaigns.

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth (Magic Link + OAuth)
- **Database**: Supabase PostgreSQL
- **Payments**: Dodo Payments integration
- **UI Components**: Custom components with Framer Motion animations

---

## 2. User Personas

### Primary User: Digital Marketer / Business Owner

- Runs Facebook/Meta advertising campaigns
- Needs quick ROI calculations without spreadsheets
- Wants actionable insights on campaign performance

---

## 3. Features & User Flows

### 3.1 Landing Page (`/`)

**Purpose**: Convert visitors into users

**Elements**:

- Hero section with headline "Stop Wasting $5,000/mo on Bad Ads"
- "Use Calculator Free" CTA button → navigates to `/dashboard`
- "View Pricing" button → navigates to `/pricing`
- Three feature cards: Instant Analysis, Industry Benchmarks, Privacy First
- Trust badges: 100% Free to Start, No Credit Card Required, Instant Results

### 3.2 Dashboard (`/dashboard`)

**Purpose**: Main calculator functionality

**Elements**:

- **CalculatorForm** (left panel):

  - Input fields for: Total Ad Spend ($), Total Clicks, Total Sales ($), Customers, Repeat Rate (Multiplier)
  - "Save Calculation" button
  - Form validation with Zod schema

- **ResultsDashboard** (right panel):
  - Displays calculated metrics: ROAS, CPA, LTV
  - Color-coded health indicators
  - AI-powered recommendations

**User Flow**:

1. User enters ad metrics
2. Real-time calculation updates results
3. User clicks "Save Calculation" to save to history
4. Toast notification confirms save

### 3.3 Login Page (`/login`)

**Purpose**: User authentication

**Elements**:

- Email input for Magic Link authentication
- "Send Magic Link" button
- Demo login option (demo@demo.com / demo123)
- Redirect to dashboard after successful login

### 3.4 Billing Page (`/billing`)

**Purpose**: Subscription management

**Elements**:

- Current plan display (Free or PRO)
- Free tier: "Limited to 3 calculations/month"
- Pro tier: "$9/month" with Crown badge
- "Upgrade to Pro" button for free users
- Pro benefits list for subscribed users
- Account information section (email, account creation date)
- Renewal date display for Pro users

### 3.5 Pricing Page (`/pricing`)

**Purpose**: Display pricing options and drive upgrades

**Elements**:

- Free tier card with limitations
- Pro tier card ($9/month) with benefits
- "Upgrade to Pro" CTA that initiates checkout

### 3.6 History Page (`/history`)

**Purpose**: View past calculations

**Elements**:

- List of saved calculations with timestamps
- Option to view details or delete entries

### 3.7 Payment Success Page (`/payment-success`)

**Purpose**: Confirm successful payment

**User Flow**:

1. User completes Dodo Payments checkout
2. Redirected to this page
3. API call to `/api/upgrade-pro` updates user to Pro
4. Display success message
5. Redirect to dashboard/billing

---

## 4. API Routes

### 4.1 POST `/api/demo-login`

**Purpose**: Handle demo user authentication

- Creates demo session cookie
- Returns success response

### 4.2 POST `/api/upgrade-pro`

**Purpose**: Upgrade user to Pro subscription
**Request Body**: `{ userId: string, renewalDate: string }`
**Authentication**: Required (Supabase auth or demo cookie)
**Flow**:

1. Verify user authentication
2. Check if user exists in `users` table
3. Create or update user record with `subscription_status: 'pro'`
4. Update auth metadata with `is_pro: true`
5. Return success response

### 4.3 POST `/api/checkout`

**Purpose**: Initiate Dodo Payments checkout session
**Request Body**: `{ priceId: string }`
**Response**: `{ checkoutUrl: string }`

### 4.4 POST `/api/webhooks`

**Purpose**: Handle Dodo Payments webhook events

- Verify webhook signature
- Process payment events
- Update user subscription status

---

## 5. Database Schema (Supabase)

### Table: `users`

| Column              | Type      | Description           |
| ------------------- | --------- | --------------------- |
| id                  | uuid (PK) | Matches auth.users.id |
| email               | text      | User email            |
| full_name           | text      | User display name     |
| subscription_status | text      | 'free' or 'pro'       |
| created_at          | timestamp | Account creation date |

### Table: `calculations` (if exists)

| Column      | Type      | Description            |
| ----------- | --------- | ---------------------- |
| id          | uuid (PK) | Calculation ID         |
| user_id     | uuid (FK) | References users.id    |
| spend       | numeric   | Ad spend amount        |
| clicks      | integer   | Total clicks           |
| sales       | numeric   | Total sales            |
| customers   | integer   | Customer count         |
| repeat_rate | numeric   | Repeat rate multiplier |
| roas        | numeric   | Calculated ROAS        |
| cpa         | numeric   | Calculated CPA         |
| ltv         | numeric   | Calculated LTV         |
| created_at  | timestamp | Calculation date       |

---

## 6. Business Rules

### Free Tier Limitations

- Maximum 3 calculations per month
- Limited history access

### Pro Tier Benefits

- Unlimited ROI calculations
- Full calculation history
- Export to PDF & CSV
- Priority support
- $9/month subscription

---

## 7. Test Scenarios

### Frontend Tests

#### Landing Page Tests

- [ ] Page loads successfully
- [ ] "Use Calculator Free" button navigates to /dashboard
- [ ] "View Pricing" button navigates to /pricing
- [ ] Feature cards render correctly
- [ ] Animations work on page load

#### Dashboard Tests

- [ ] Calculator form renders with all input fields
- [ ] Form validation works (prevents invalid inputs)
- [ ] Real-time calculation updates results
- [ ] "Save Calculation" button works
- [ ] Toast notification appears on save
- [ ] Results display ROAS, CPA, LTV correctly
- [ ] Mobile responsive layout (scroll message appears)

#### Authentication Tests

- [ ] Login page renders
- [ ] Magic link email can be submitted
- [ ] Demo login works with demo credentials
- [ ] Redirect to dashboard after login
- [ ] Protected routes redirect unauthenticated users to login

#### Billing Tests

- [ ] Page shows "Sign in" prompt for unauthenticated users
- [ ] Free user sees "Free" badge and limitations
- [ ] Free user sees "Upgrade to Pro" button
- [ ] Pro user sees "PRO" badge with crown
- [ ] Pro user sees benefits list
- [ ] Account information displays correctly

#### Pricing Tests

- [ ] Free and Pro tiers display correctly
- [ ] Pro tier shows $9/month price
- [ ] "Upgrade to Pro" initiates checkout flow

### Backend/API Tests

#### /api/upgrade-pro Tests

- [ ] Returns 401 for unauthenticated requests
- [ ] Creates user record if doesn't exist
- [ ] Updates existing user to Pro status
- [ ] Updates auth metadata correctly
- [ ] Returns success response

#### /api/demo-login Tests

- [ ] Sets demo_user cookie
- [ ] Returns success response

#### /api/checkout Tests (if exists)

- [ ] Initiates checkout session
- [ ] Returns checkout URL

#### /api/webhooks Tests

- [ ] Verifies webhook signature
- [ ] Processes payment.completed event
- [ ] Updates user subscription status

---

## 8. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
DODO_API_KEY=<dodo_payments_key>
DODO_WEBHOOK_SECRET=<webhook_secret>
```

---

## 9. Success Metrics

- Page load time < 3 seconds
- Calculator provides instant feedback
- Login flow completes in < 30 seconds
- Upgrade flow completes successfully
- All API routes return expected responses
