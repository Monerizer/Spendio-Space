# Spendio App Flow & Architecture

## 🎯 Core Philosophy
Spendio is a **personal money clarity app** for manual data entry + AI analysis. No bank connections, just clarity.

---

## 📊 How Users Enter Data

### Step 1: Income Entry
**Location:** Financial Data → 💰 Income Tab

Users MUST select an **income type**:
- Salary
- Freelance
- Business
- Investments
- Bonus
- Other

Then enter the amount. This creates a breakdown by income source.

**What happens:**
- Income is tracked by type
- Total income = sum of all income types
- Data is stored in `incomeBreakdown`

### Step 2: Expense Entry
**Location:** Financial Data → 📊 Expenses Tab

Users MUST select an **expense category**:
- Housing
- Food
- Transport
- Utilities
- Health/Medical
- Insurance
- Pets
- Fun
- Subscriptions
- Personal
- Other
- (+ custom categories)

Then enter the amount. This creates a breakdown by category.

**What happens:**
- Expenses are tracked by category
- Total expenses = sum of all expense categories
- Data is stored in `expenseBreakdown`

### Step 3: Savings & Investing
**Location:** Financial Data → 💾 Savings Tab

Users enter amounts they're setting aside (not spending).

### Step 4: Debts
**Location:** Financial Data → 💳 Debts Tab

For each debt:
- Type (Bank loan, Personal loan, Credit card, Other)
- Name
- Total balance
- Monthly payment

This helps the Money Health Score evaluate debt burden.

### Step 5: Current Balances (Snapshot)
**Location:** Financial Data → 🏦 Balances Tab

Today's account balances:
- Cash
- Emergency fund
- Savings
- Investing
- Total debt

This is the **starting point** for evaluation, not synced from banks.

---

## 💡 Money Health Score Calculation

**Formula:**
```
Score = 0-100 (based on these factors)

1. Cash Flow Balance (0-30 pts)
   - Remaining cash = Income - Expenses - Savings - Investing - Debt Payments
   - Ratio vs income determines points

2. Savings Discipline (0-25 pts)
   - Savings Rate = Savings / Income
   - Higher savings % = more points

3. Investing Consistency (0-15 pts)
   - Investing Rate = Investing / Income
   - Consistent investing improves score

4. Debt Burden (0-20 pts)
   - Debt Ratio = Monthly Debt Payments / Income
   - Lower debt ratio = better score

5. Trend Stability (0-10 pts)
   - Compares current month vs previous
   - Improving trends = more points
```

**Interpretation:**
- 85-100: Excellent control
- 70-84: Healthy & stable
- 50-69: Needs attention
- 30-49: Financial stress
- <30: High risk

---

## 🤖 AI Integration Points

### 1. Home Page - AI Tips Modal
When user clicks "Get tips", the modal:
1. Fetches AI recommendations via `/api/ai/recommend`
2. Sends context: snapshot, debts, targets, monthly totals
3. Displays insights about:
   - Setup status
   - Recommended actions
   - Action severity (🟢 good, 🟡 warning, 🔴 risk)

### 2. AI Advisor Chat
**Location:** Bottom navigation → 💬 AI Advisor

User can ask questions like:
- "Can I afford this purchase?"
- "Why is my score low?"
- "What should I focus on?"

**Context sent to AI:**
- Current balances
- Monthly income/expenses
- Debts
- Targets
- Recent transactions

**Your API Key:**
Set in server/.env as `OPENAI_API_KEY`

Endpoints:
- `/api/ai/recommend` - Get action recommendations
- `/api/ai/chat` - Free-form conversation

---

## 📱 Mobile & Desktop UI

### Mobile (< 640px)
- Stack layout
- Full-width forms
- Bottom navigation tabs
- Slide-out menu
- Readable fonts

### Tablet/Desktop (640px+)
- Grid layout
- 2-3 columns
- Sidebar navigation
- Larger content areas
- More white space

The app is **100% responsive** using Tailwind CSS breakpoints.

---

## 🗂️ Data Structure

```javascript
// User object
{
  email: "user@example.com",
  pass: "hashed_password",
  name: "John",
  data: {
    snapshot: {
      cash: 5000,
      emergency: 2000,
      savings: 10000,
      investing: 5000,
      debt: 3000
    },
    
    debts: [
      {
        id: "debt_123",
        type: "Credit card",
        name: "Chase",
        total: 3000,
        monthly: 200
      }
    ],
    
    targets: {
      savings: 500,      // Monthly target
      investing: 300     // Monthly target
    },
    
    months: {
      "2025-01": {
        totals: {
          income: 5000,
          expenses: 3000,
          savings: 500,
          investing: 300,
          debtPay: 200
        },
        incomeBreakdown: {
          "Salary": 4500,
          "Freelance": 500
        },
        expenseBreakdown: {
          "Housing": 1200,
          "Food": 500,
          "Transport": 300,
          "Other": 1000
        }
      }
    },
    
    currentMonth: "2025-01",
    incomeTypes: ["Salary", "Freelance", "Business", ...],
    expenseCategories: ["Housing", "Food", "Transport", ...]
  }
}
```

---

## 🔄 User Journey

### First Time
1. Sign up
2. See empty home with setup card
3. Go to Financial Data
4. Enter today's balances
5. Enter monthly totals (income, expenses, savings, investing)
6. Add debts if any
7. Set savings/investing targets
8. Setup card disappears
9. Home shows Money Health Score

### Monthly Routine
1. Update monthly totals in Financial Data
2. Check Money Health Score on Home
3. Click "Get tips" to see AI recommendations
4. Chat with AI Advisor for guidance
5. View Analytics to see trends

### End of Month
1. Review Analytics
2. Close month (creates new blank month)
3. Set targets for next month

---

## 🔐 Data Privacy

- Data stored **locally in browser** (localStorage)
- No server backend needed for MVP
- No bank connections
- No data sharing
- User controls everything

---

## 🚀 Ready for AI Integration

The app is fully structured to pass context to AI:

```javascript
// Context sent to AI
{
  now_month: "2025-01",
  snapshot: { cash: 5000, ... },
  debts: [ { name: "Chase", monthly: 200 } ],
  targets: { savings: 500, investing: 300 },
  month: {
    totals: { income: 5000, expenses: 3000, ... },
    incomeBreakdown: { "Salary": 4500, ... },
    expenseBreakdown: { "Housing": 1200, ... }
  }
}
```

This gives AI complete context for **accurate, personalized recommendations**.

---

## ✅ What's Implemented

✓ User authentication (local)
✓ Financial data entry (income types + expense categories)
✓ Money Health Score calculation
✓ Monthly tracking
✓ Debts management
✓ Targets tracking
✓ AI Tips modal
✓ AI Advisor chat
✓ Analytics dashboard
✓ Mobile + Desktop responsive UI
✓ Wealth Building progress
✓ Settings & data export

## 📝 Next Steps

1. **Test with real data** - Create accounts, enter financial data
2. **Integrate ChatGPT API** - Set OPENAI_API_KEY in server/.env
3. **Refine AI prompts** - Adjust recommendations based on feedback
4. **Add more analytics** - Charts, comparisons, forecasts
5. **Cloud sync (later)** - Optional data storage in DB

---

## 📧 API Endpoints

### Backend (Express Server)

```
POST /api/ai/recommend
Body: { now_month, snapshot, debts, targets, month }
Returns: { setup, actions }

POST /api/ai/chat
Body: { message, context }
Returns: { reply }
```

Both endpoints require `OPENAI_API_KEY` in `.env`

---

**Spendio**: A calm, clear way to understand your money. 🌱
