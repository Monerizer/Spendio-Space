# Supabase Integration Guide for Spendio Space

This guide explains how to set up and integrate Supabase with your Spendio Space application.

## Overview

The Supabase integration includes:
- **Authentication**: User sign-up, sign-in, password reset
- **Database Service Layer**: CRUD operations for users, transactions, debts, targets, and snapshots
- **Environment Configuration**: Easy setup with environment variables

## Files Created

### Client-Side
- `client/lib/supabaseClient.ts` - Supabase client initialization
- `client/hooks/useSupabaseAuth.ts` - React hook for authentication state and methods
- `client/context/SupabaseAuthContext.tsx` - Context provider for auth state
- `client/lib/supabaseService.ts` - Database service layer for CRUD operations

### Configuration
- `.env.example` - Environment variables template

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project Name: `spendio-space` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Click "Create new project" and wait for it to initialize

### 2. Get API Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy:
   - **Project URL** - This is your `VITE_SUPABASE_URL`
   - **anon public** key - This is your `VITE_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

Create a `.env` file in your project root (or update `.env.local`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Or set these as environment variables in your deployment platform (Netlify, Vercel, etc.)

### 4. Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run these queries to create the necessary tables:

#### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_date_idx ON transactions(date);
```

#### Debts Table
```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  total NUMERIC NOT NULL,
  monthly NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts"
  ON debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts"
  ON debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
  ON debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
  ON debts FOR DELETE
  USING (auth.uid() = user_id);
```

#### Financial Targets Table
```sql
CREATE TABLE financial_targets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  savings NUMERIC DEFAULT 0,
  investing NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE financial_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own targets"
  ON financial_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own targets"
  ON financial_targets FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Snapshots Table
```sql
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cash NUMERIC DEFAULT 0,
  emergency NUMERIC DEFAULT 0,
  savings NUMERIC DEFAULT 0,
  investing NUMERIC DEFAULT 0,
  debt NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots"
  ON snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots"
  ON snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX snapshots_user_id_idx ON snapshots(user_id);
CREATE INDEX snapshots_created_at_idx ON snapshots(created_at);
```

### 5. Integration with Existing Code

The Supabase auth can work alongside the existing `SpendioContext`. Here's how to integrate:

#### Option A: Dual Auth (Keep existing + add Supabase)
Keep `SpendioContext` for local storage and add `SupabaseAuthProvider` for Supabase:

```tsx
// In App.tsx
import { SpendioProvider } from '@/context/SpendioContext';
import { SupabaseAuthProvider } from '@/context/SupabaseAuthContext';

<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <SpendioProvider>
      <SupabaseAuthProvider>
        <QuickAddProvider>
          {/* Your app */}
        </QuickAddProvider>
      </SupabaseAuthProvider>
    </SpendioProvider>
  </TooltipProvider>
</QueryClientProvider>
```

Then use in components:
```tsx
import { useSupabaseAuthContext } from '@/context/SupabaseAuthContext';
import { useSpendio } from '@/context/SpendioContext';

export function MyComponent() {
  const { signIn: supabaseSignIn } = useSupabaseAuthContext();
  const { signIn: localSignIn } = useSpendio();
  
  // Handle both auth systems as needed
}
```

#### Option B: Full Migration (Replace localStorage with Supabase)
This would require updating `SpendioContext` to:
1. Load user data from Supabase instead of localStorage
2. Sync transactions/debts/targets to Supabase when updated
3. Use Supabase auth instead of custom password checking

## Using the Database Service Layer

The `supabaseService.ts` file provides ready-to-use functions for common operations:

```tsx
import { transactionsService } from '@/lib/supabaseService';

// Get all transactions for current user
const transactions = await transactionsService.getTransactions(userId);

// Get transactions for a specific month
const monthTransactions = await transactionsService.getTransactionsByMonth(userId, 2024, 1);

// Create a new transaction
const newTx = await transactionsService.createTransaction(userId, {
  type: 'expense',
  date: '2024-01-15',
  category: 'Food',
  name: 'Groceries',
  amount: 50.00
});

// Update a transaction
await transactionsService.updateTransaction(transactionId, {
  amount: 55.00
});

// Delete a transaction
await transactionsService.deleteTransaction(transactionId);
```

Similar services exist for:
- `userProfileService` - User profile operations
- `debtsService` - Debt tracking
- `financialTargetsService` - Savings/investing targets
- `snapshotsService` - Financial snapshots

## Next Steps

1. **Set up Supabase project** following steps 1-4 above
2. **Create database tables** using the SQL queries provided
3. **Test authentication** by updating `AuthPage.tsx` to use `useSupabaseAuthContext` (optional)
4. **Migrate data** from localStorage to Supabase (optional)
5. **Enable additional Supabase features** like:
   - Real-time subscriptions for live updates
   - Storage for file uploads (receipts, documents)
   - Edge functions for backend logic
   - Webhooks for payment processing (Stripe)

## Troubleshooting

### "Supabase environment variables are not configured"
- Ensure `.env` file exists in your project root
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart your dev server after updating `.env`

### "signUp failed: User already registered"
- This is expected if the email already exists in your Supabase auth
- You can delete test users in Supabase dashboard > Authentication > Users

### "Row Level Security (RLS) violation"
- Make sure you're authenticated before making database requests
- Check that RLS policies are correctly configured
- The user making the request must match `auth.uid()`

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Spendio Space Repository](#) - Your project repository
