# Supabase Integration Quick Start Checklist

Your Spendio Space project is now ready to connect with Supabase! Follow this checklist to get started.

## ✅ Completed Setup

The following have been prepared for you:

- [x] Supabase JavaScript client (`client/lib/supabaseClient.ts`)
- [x] Authentication hook (`client/hooks/useSupabaseAuth.ts`)
- [x] Auth context provider (`client/context/SupabaseAuthContext.tsx`)
- [x] Database service layer (`client/lib/supabaseService.ts`)
- [x] Environment variable template (`.env.example`)
- [x] Supabase package installed (`@supabase/supabase-js@2.93.3`)

## 🚀 Next Steps (In Order)

### Step 1: Create Supabase Project
- [ ] Go to [https://app.supabase.com](https://app.supabase.com)
- [ ] Sign up or log in
- [ ] Click "New Project"
- [ ] Fill in project details and create it
- [ ] Wait for the project to initialize (2-3 minutes)

### Step 2: Get API Credentials
- [ ] In Supabase dashboard, go to **Settings > API**
- [ ] Copy your **Project URL** and save it
- [ ] Copy your **anon public** key and save it

### Step 3: Configure Environment Variables
- [ ] Open `.env` file (or create `.env.local`)
- [ ] Add these lines:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  ```
- [ ] Save the file
- [ ] Restart your dev server (if running)

### Step 4: Create Database Tables
- [ ] In your Supabase dashboard, go to **SQL Editor**
- [ ] Copy and run all SQL queries from `SUPABASE_SETUP.md` (section "Create Database Tables")
- [ ] Tables created:
  - [ ] `user_profiles` - User account and profile data
  - [ ] `transactions` - Income and expense transactions
  - [ ] `debts` - Debt tracking
  - [ ] `financial_targets` - Savings and investing goals
  - [ ] `snapshots` - Financial snapshots over time

### Step 5: Test Authentication (Optional)
- [ ] Use the example in `client/examples/AuthPageWithSupabase.example.tsx`
- [ ] This shows how to integrate Supabase with your existing AuthPage component
- [ ] You can:
  - **Option A**: Keep using localStorage (existing behavior)
  - **Option B**: Switch to Supabase authentication
  - **Option C**: Use both in parallel for a gradual migration

### Step 6: Migrate or Add Data Integration (Optional)
- [ ] Import service functions from `client/lib/supabaseService.ts`
- [ ] Start syncing transaction data to Supabase
- [ ] Example:
  ```tsx
  import { transactionsService } from '@/lib/supabaseService';
  
  // Save a transaction to Supabase
  const newTx = await transactionsService.createTransaction(userId, {
    type: 'expense',
    date: '2024-01-15',
    category: 'Food',
    name: 'Groceries',
    amount: 50.00
  });
  ```

## 📚 Available Files & Documentation

### Configuration Files
- `.env.example` - Environment variable template (copy to `.env`)
- `SUPABASE_SETUP.md` - Detailed setup guide with all SQL queries
- `SUPABASE_QUICKSTART.md` - This file (quick reference)

### Client-Side Integration Files
- `client/lib/supabaseClient.ts` - Supabase client initialization
- `client/hooks/useSupabaseAuth.ts` - React hook for auth state
- `client/context/SupabaseAuthContext.tsx` - Context provider for auth
- `client/lib/supabaseService.ts` - Database CRUD operations

### Examples
- `client/examples/AuthPageWithSupabase.example.tsx` - How to integrate with AuthPage

## 🔄 Two Integration Options

### Option A: Keep Existing (Recommended for Start)
Keep using `SpendioContext` with localStorage. Add Supabase gradually:

```tsx
import { useSupabaseAuthContext } from '@/context/SupabaseAuthContext';
import { useSpendio } from '@/context/SpendioContext';

// Use SpendioContext as before
const { user, signIn, signOut } = useSpendio();

// But also have Supabase auth available for new features
const { signIn: supabaseSignIn } = useSupabaseAuthContext();
```

### Option B: Switch to Supabase (Full Migration)
Replace localStorage auth with Supabase completely:

```tsx
// Update App.tsx to wrap with SupabaseAuthProvider
import { SupabaseAuthProvider } from '@/context/SupabaseAuthContext';

<SupabaseAuthProvider>
  {/* Your app */}
</SupabaseAuthProvider>

// Use Supabase auth in components
const { user, signIn, signOut } = useSupabaseAuthContext();
```

## ⚠️ Important Notes

1. **Environment Variables**: Never commit `.env` files with real credentials. Use the platform's environment variable settings (Netlify, Vercel, etc.) for production.

2. **Row-Level Security (RLS)**: All tables have RLS enabled by default. This means:
   - Users can only see their own data
   - You must be authenticated to make database requests
   - The `auth.uid()` in SQL policies ensures data isolation

3. **Test Accounts**: Your current test accounts (test1@gmail.com, test2@gmail.com) are stored in localStorage. When you move to Supabase, you can:
   - Create new test accounts through the Supabase auth UI
   - Or migrate existing data to Supabase

4. **Free Tier Limits**: Supabase free tier includes:
   - Up to 500 MB database storage
   - Up to 2 GB bandwidth/month
   - Unlimited auth users
   - Great for development and testing!

## 🆘 Troubleshooting

### "Supabase environment variables are not configured"
**Solution**: Check that `.env` file exists with correct values, and restart dev server.

### Auth methods not connecting
**Solution**: Check browser console for errors. Ensure:
- Supabase URL and anon key are correct
- Network request is reaching Supabase servers
- Supabase project is active

### "Row Level Security violation" errors
**Solution**: 
- Make sure you're authenticated before making requests
- Check that the user ID in your JWT matches the `auth.uid()` in RLS policies

## 📖 Learn More

- **Supabase Docs**: https://supabase.com/docs
- **Authentication Guide**: https://supabase.com/docs/guides/auth
- **Realtime Guide**: https://supabase.com/docs/guides/realtime
- **Storage Guide**: https://supabase.com/docs/guides/storage

## ✨ Next Advanced Features (When Ready)

Once basic setup is working, consider:

1. **Real-time Subscriptions** - Live updates when data changes
2. **File Storage** - Save receipts, invoices, documents
3. **Edge Functions** - Backend logic without managing servers
4. **Webhooks** - Integrate with Stripe for payments
5. **Database Backups** - Automated daily backups

---

**You're all set to connect Spendio Space with Supabase!** 🎉

Start with **Step 1** above and work through each step. If you have any questions, check the full guide in `SUPABASE_SETUP.md`.
