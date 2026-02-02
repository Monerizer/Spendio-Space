import { createContext, useContext, useEffect, useState } from "react";
import { detectCurrencyFromTimezone } from "@/utils/currencyDetection";
import { supabase } from "@/lib/supabaseClient";
import { transactionsService, debtsService, snapshotsService } from "@/lib/supabaseService";

export interface Snapshot {
  cash: number;
  emergency: number;
  savings: number;
  investing: number;
  debt: number;
}

export interface DebtItem {
  id: string;
  type: string;
  name: string;
  total: number;
  monthly: number;
}

export interface Transaction {
  id: string;
  type: string;
  date: string;
  cat: string;
  subCat?: string;
  name: string;
  amt: number;
}

export interface ExpenseCategory {
  name: string;
  subCategories: string[];
}

export interface MonthData {
  totals: {
    income: number;
    expenses: number;
    savings: number;
    investing: number;
    debtPay: number;
  };
  tx: Transaction[];
  incomeBreakdown?: Record<string, number>; // income by type
  expenseBreakdown?: Record<string, number>; // expenses by category
}

export interface UserData {
  email: string;
  pass: string;
  name: string;
  currency?: string; // "EUR", "USD", "GBP", etc. - set by backend
  subscription?: {
    status: "free" | "pro"; // "free" or "pro"
    createdAt?: string;
    upgradePopupShown?: boolean; // Track if upgrade modal was shown this session
  };
  data: {
    snapshot: Snapshot | null;
    debts: DebtItem[];
    targets: { savings: number; investing: number };
    months: Record<string, MonthData>;
    currentMonth: string;
    incomeTypes: ExpenseCategory[];
    expenseCategories: ExpenseCategory[];
  };
}

export interface Session {
  email: string;
}

interface SpendioContextType {
  user: UserData | null;
  session: Session | null;
  loading: boolean;
  signUp: (name: string, email: string, pass: string) => Promise<boolean>;
  signIn: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: UserData) => Promise<void>;
  updateSubscription: (status: "free" | "pro") => void;
}

const SpendioContext = createContext<SpendioContextType | undefined>(undefined);

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const DEFAULT_INCOME_TYPES: ExpenseCategory[] = [
  { name: "Salary", subCategories: ["Base Salary", "Bonus", "Commission", "Overtime", "Other"] },
  { name: "Freelance", subCategories: ["Consulting", "Writing", "Design", "Development", "Other"] },
  { name: "Business", subCategories: ["Product Sales", "Services", "Licensing", "Other"] },
  { name: "Investments", subCategories: ["Dividends", "Capital Gains", "Interest", "Crypto", "Other"] },
  { name: "Side Hustle", subCategories: ["E-commerce", "Freelance", "Content Creation", "Tutoring", "Other"] },
  { name: "Other", subCategories: ["Gift", "Refund", "Reimbursement", "Other"] },
];

const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { name: "Housing", subCategories: ["Rent", "Mortgage", "Repairs", "Property Tax", "Other"] },
  { name: "Food", subCategories: ["Groceries", "Restaurants", "Delivery", "Coffee", "Other"] },
  { name: "Transport", subCategories: ["Gas/Fuel", "Public Transit", "Car Payment", "Insurance", "Maintenance", "Parking", "Other"] },
  { name: "Utilities", subCategories: ["Electricity", "Water", "Gas", "Internet", "Phone", "Other"] },
  { name: "Health/Medical", subCategories: ["Doctor Visits", "Medications", "Dental", "Eye Care", "Gym", "Other"] },
  { name: "Insurance", subCategories: ["Car", "Home", "Health", "Life", "Other"] },
  { name: "Pets", subCategories: ["Food", "Vet", "Toys", "Grooming", "Other"] },
  { name: "Fun", subCategories: ["Movies", "Games", "Hobbies", "Travel", "Events", "Other"] },
  { name: "Subscriptions", subCategories: ["Streaming", "Software", "Gym", "Music", "News", "Other"] },
  { name: "Personal", subCategories: ["Clothing", "Haircut", "Beauty", "Books", "Other"] },
  { name: "Loan", subCategories: ["Bank Loan", "Personal Loan", "Credit Card Payment", "Student Loan", "Car Loan", "Other"] },
  { name: "Other", subCategories: ["Misc"] },
];

// Helper function to load all user data including transactions, debts, and snapshots
async function loadUserDataFromSupabase(userId: string, email: string, profile: any): Promise<UserData> {
  try {
    // Load transactions with timeout
    let transactions = [];
    try {
      transactions = await Promise.race([
        transactionsService.getTransactions(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Transactions load timeout")), 3000))
      ]) as any[];
    } catch (e) {
      console.warn("Failed to load transactions:", e);
      transactions = [];
    }

    // Load debts with timeout
    let debts = [];
    try {
      debts = await Promise.race([
        debtsService.getDebts(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Debts load timeout")), 3000))
      ]) as any[];
    } catch (e) {
      console.warn("Failed to load debts:", e);
      debts = [];
    }

    // Load latest snapshot with timeout
    let snapshot = null;
    try {
      snapshot = await Promise.race([
        snapshotsService.getLatestSnapshot(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Snapshot load timeout")), 3000))
      ]) as any;
    } catch (e) {
      console.warn("Failed to load snapshot:", e);
      snapshot = null;
    }

    // Organize transactions by month
    const months: Record<string, MonthData> = {};
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    transactions.forEach((tx: any) => {
      const monthKey = tx.date.substring(0, 7); // "YYYY-MM"
      if (!months[monthKey]) {
        months[monthKey] = {
          totals: { income: 0, expenses: 0, savings: 0, investing: 0, debtPay: 0 },
          tx: [],
          incomeBreakdown: {},
          expenseBreakdown: {},
        };
      }

      // Add transaction with correct field mapping
      months[monthKey].tx.push({
        id: tx.id,
        type: tx.type,
        date: tx.date,
        cat: tx.cat,
        subCat: tx.subCat,
        name: tx.name,
        amt: tx.amt,
      });
    });

    // Ensure current month exists
    if (!months[currentMonth]) {
      months[currentMonth] = {
        totals: { income: 0, expenses: 0, savings: 0, investing: 0, debtPay: 0 },
        tx: [],
        incomeBreakdown: {},
        expenseBreakdown: {},
      };
    }

    const userData: UserData = {
      email,
      pass: '',
      name: profile.name || email.split('@')[0],
      currency: profile.currency || detectCurrencyFromTimezone(),
      subscription: { status: 'free' },
      data: {
        snapshot: snapshot ? {
          cash: snapshot.cash,
          emergency: snapshot.emergency,
          savings: snapshot.savings,
          investing: snapshot.investing,
          debt: snapshot.debt,
        } : null,
        debts: debts || [],
        targets: { savings: 0, investing: 0 },
        months,
        currentMonth,
        incomeTypes: [],
        expenseCategories: [],
      },
    };

    return ensureShape(userData);
  } catch (error) {
    console.error("Error loading user data from Supabase:", error);
    // Fall back to basic user data if loading fails
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const userData: UserData = {
      email,
      pass: '',
      name: profile.name || email.split('@')[0],
      currency: profile.currency || detectCurrencyFromTimezone(),
      subscription: { status: 'free' },
      data: {
        snapshot: null,
        debts: [],
        targets: { savings: 0, investing: 0 },
        months: {
          [currentMonth]: {
            totals: { income: 0, expenses: 0, savings: 0, investing: 0, debtPay: 0 },
            tx: [],
            incomeBreakdown: {},
            expenseBreakdown: {},
          },
        },
        currentMonth,
        incomeTypes: [],
        expenseCategories: [],
      },
    };
    return ensureShape(userData);
  }
}

function ensureShape(user: UserData): UserData {
  // Set currency from user's timezone if not already set
  if (!user.currency) {
    user.currency = detectCurrencyFromTimezone();
  }
  user.subscription ??= { status: "free" }; // Default to free plan
  user.data ??= {} as any;
  user.data.snapshot ??= null;
  user.data.debts ??= [];
  user.data.targets ??= { savings: 0, investing: 0 };
  user.data.months ??= {};
  user.data.currentMonth ??= getCurrentMonth();

  // Fix income types - convert old string format to new object format AND merge in any missing defaults
  if (Array.isArray(user.data.incomeTypes) && user.data.incomeTypes.length > 0) {
    if (typeof user.data.incomeTypes[0] === "string") {
      // Old format - convert to new format
      const oldTypes = user.data.incomeTypes as any[];
      user.data.incomeTypes = DEFAULT_INCOME_TYPES.map(type => ({
        ...type,
        name: type.name,
      }));
      // Add any custom types
      oldTypes.forEach(type => {
        if (!DEFAULT_INCOME_TYPES.find(dt => dt.name === type)) {
          (user.data.incomeTypes as ExpenseCategory[]).push({
            name: type,
            subCategories: ["Other"],
          });
        }
      });
    } else {
      // New format - merge in any missing default types
      const existingTypeNames = new Set((user.data.incomeTypes as ExpenseCategory[]).map(t => t.name));
      DEFAULT_INCOME_TYPES.forEach(defaultType => {
        if (!existingTypeNames.has(defaultType.name)) {
          (user.data.incomeTypes as ExpenseCategory[]).push(
            JSON.parse(JSON.stringify(defaultType))
          );
        }
      });
    }
  } else {
    user.data.incomeTypes = JSON.parse(JSON.stringify(DEFAULT_INCOME_TYPES));
  }

  // Fix expense categories - convert old string format to new object format AND merge in any missing defaults
  if (Array.isArray(user.data.expenseCategories) && user.data.expenseCategories.length > 0) {
    if (typeof user.data.expenseCategories[0] === "string") {
      // Old format - convert to new format
      const oldCats = user.data.expenseCategories as any[];
      user.data.expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        name: cat.name,
      }));
      // Add any custom categories
      oldCats.forEach(cat => {
        if (!DEFAULT_EXPENSE_CATEGORIES.find(dc => dc.name === cat)) {
          (user.data.expenseCategories as ExpenseCategory[]).push({
            name: cat,
            subCategories: ["Other"],
          });
        }
      });
    } else {
      // New format - merge in any missing default categories
      const existingCatNames = new Set((user.data.expenseCategories as ExpenseCategory[]).map(c => c.name));
      DEFAULT_EXPENSE_CATEGORIES.forEach(defaultCat => {
        if (!existingCatNames.has(defaultCat.name)) {
          (user.data.expenseCategories as ExpenseCategory[]).push(
            JSON.parse(JSON.stringify(defaultCat))
          );
        }
      });
    }
  } else {
    user.data.expenseCategories = JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
  }

  if (!user.data.months[user.data.currentMonth]) {
    user.data.months[user.data.currentMonth] = {
      totals: { income: 0, expenses: 0, savings: 0, investing: 0, debtPay: 0 },
      tx: [],
      incomeBreakdown: {},
      expenseBreakdown: {},
    };
  }

  return user;
}

export function SpendioProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session and user from Supabase
    const loadSessionAndUser = async () => {
      try {
        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session load timeout")), 5000)
        );

        const sessionPromise = supabase.auth.getSession();
        const { data: { session: authSession }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise as any
        ]);

        if (sessionError) {
          console.error("Error loading session:", sessionError);
          setLoading(false);
          return;
        }

        if (authSession?.user?.email) {
          setSession({ email: authSession.user.email });

          // Load user profile from Supabase
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authSession.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error loading profile:", profileError);
            setLoading(false);
            return;
          } else if (profile) {
            // Load all user data including transactions, debts, and snapshots
            try {
              const userData = await loadUserDataFromSupabase(authSession.user.id, profile.email, profile);
              setUser(userData);
            } catch (loadError) {
              console.error("Error loading user data:", loadError);
              // Still allow login even if data loading fails
            }
          }
        }
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setLoading(false);
      }
    };

    // Call with a small delay to ensure Supabase is initialized
    const timeoutId = setTimeout(loadSessionAndUser, 100);

    return () => clearTimeout(timeoutId);

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (authSession?.user?.email) {
        setSession({ email: authSession.user.email });

        // Load user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authSession.user.id)
          .single();

        if (profile) {
          // Load all user data including transactions, debts, and snapshots
          const userData = await loadUserDataFromSupabase(authSession.user.id, profile.email, profile);
          setUser(userData);
        }
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (name: string, email: string, pass: string): Promise<boolean> => {
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();

    if (name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }
    if (pass.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      // Create auth user
      const { data: { user: authUser, session }, error: signUpError } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);

        // Handle specific Supabase errors
        const errorMsg = signUpError.message?.toLowerCase() || "";

        if (errorMsg.includes("already registered") || errorMsg.includes("already exists")) {
          throw new Error("This email is already registered. Please sign in instead.");
        } else if (errorMsg.includes("rate limit")) {
          throw new Error("Too many signup attempts. Please wait a few minutes and try again.");
        } else if (errorMsg.includes("invalid") && errorMsg.includes("email")) {
          throw new Error("Email validation failed. Supabase rejected this email. Please try another address.");
        } else {
          throw new Error(signUpError.message || "Unable to create account. Please try again.");
        }
      }

      if (!authUser) {
        throw new Error("Unable to create account. Please try again.");
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          email,
          name,
          currency: detectCurrencyFromTimezone(),
        });

      if (profileError) {
        console.error("Error creating profile:", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
        });

        // Handle specific profile errors
        if (profileError.code === "23505") {
          // Unique constraint violation
          throw new Error("This email is already in use. Please sign in instead.");
        } else if (profileError.message?.includes("violates row level security")) {
          throw new Error("Unable to save profile due to security policy. Please contact support.");
        } else {
          throw new Error("Account created but unable to save profile. Please contact support at support@spendio.space");
        }
      }

      // If email confirmation is disabled, session will be returned automatically
      // If email confirmation is enabled, we need to wait for user to confirm
      if (session) {
        // User is automatically logged in (email confirmation disabled)
        console.log("User auto-logged in after signup");
        setSession({ email });
        setUser(ensureShape({ email, pass: '', name, currency: detectCurrencyFromTimezone(), data: {} as any }));
        return true;
      } else {
        // Email confirmation is enabled - user needs to confirm email
        console.log("Email confirmation required - user must verify email");
        throw new Error(`Account created! Please check your email (${email}) to confirm your account.`);
      }
    } catch (e) {
      console.error("Sign up failed:", e);
      throw e;
    }
  };

  const signIn = async (email: string, pass: string): Promise<boolean> => {
    email = (email || "").trim().toLowerCase();

    if (!email) {
      throw new Error("Email is required");
    }
    if (!pass) {
      throw new Error("Password is required");
    }

    try {
      const { data: { session: authSession }, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.error("Sign in error:", error);

        const errorMsg = error.message?.toLowerCase() || "";

        if (errorMsg.includes("invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        } else if (errorMsg.includes("email not confirmed") || errorMsg.includes("not verified")) {
          throw new Error("Please check your email and confirm your account before signing in.");
        } else if (errorMsg.includes("email_not_confirmed")) {
          throw new Error("Email not confirmed. Please click the confirmation link sent to your email.");
        } else {
          throw new Error(error.message || "Unable to sign in. Please try again.");
        }
      }

      if (!authSession?.user?.email) {
        throw new Error("Unable to sign in. Please try again.");
      }

      // User data will be loaded via auth state change listener
      return true;
    } catch (e) {
      console.error("Sign in failed:", e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
      setSession(null);
      setUser(null);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const updateUser = async (updatedUser: UserData) => {
    if (!session?.email || !user) return;

    try {
      // Get the current authenticated user ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.id) return;

      // Update user profile in Supabase
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          name: updatedUser.name,
          currency: updatedUser.currency,
          updated_at: new Date().toISOString(),
        })
        .eq('email', session.email);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return;
      }

      // Sync transactions: compare old and new transactions
      if (updatedUser.data.months) {
        const oldTransactions = new Map();
        const newTransactions = new Map();

        // Build map of old transactions
        Object.values(user.data.months).forEach((month) => {
          month.tx.forEach((tx) => {
            oldTransactions.set(tx.id, tx);
          });
        });

        // Build map of new transactions
        Object.values(updatedUser.data.months).forEach((month) => {
          month.tx.forEach((tx) => {
            newTransactions.set(tx.id, tx);
          });
        });

        // Find added transactions
        for (const [id, tx] of newTransactions) {
          if (!oldTransactions.has(id)) {
            // New transaction - create in Supabase
            await transactionsService.createTransaction(authUser.id, tx).catch(e => {
              console.error("Error creating transaction:", e);
            });
          }
        }

        // Find deleted transactions
        for (const [id, tx] of oldTransactions) {
          if (!newTransactions.has(id)) {
            // Deleted transaction - remove from Supabase
            await transactionsService.deleteTransaction(id).catch(e => {
              console.error("Error deleting transaction:", e);
            });
          }
        }
      }

      // Sync debts
      if (updatedUser.data.debts) {
        const oldDebtIds = new Set(user.data.debts.map(d => d.id));
        const newDebtIds = new Set(updatedUser.data.debts.map(d => d.id));

        // Find new debts
        for (const debt of updatedUser.data.debts) {
          if (!oldDebtIds.has(debt.id)) {
            await debtsService.createDebt(authUser.id, debt).catch(e => {
              console.error("Error creating debt:", e);
            });
          }
        }

        // Find deleted debts
        for (const debt of user.data.debts) {
          if (!newDebtIds.has(debt.id)) {
            await debtsService.deleteDebt(debt.id).catch(e => {
              console.error("Error deleting debt:", e);
            });
          }
        }
      }

      // Sync snapshot
      if (updatedUser.data.snapshot && updatedUser.data.snapshot !== user.data.snapshot) {
        await snapshotsService.createSnapshot(authUser.id, updatedUser.data.snapshot).catch(e => {
          console.error("Error creating snapshot:", e);
        });
      }

      setUser(updatedUser);
    } catch (e) {
      console.error("Update user failed:", e);
    }
  };

  const updateSubscription = (status: "free" | "pro") => {
    if (!user) return;
    const updatedUser = { ...user };
    updatedUser.subscription = { status, upgradePopupShown: false };
    updateUser(updatedUser);
  };

  return (
    <SpendioContext.Provider value={{ user, session, loading, signUp, signIn, logout, updateUser, updateSubscription }}>
      {children}
    </SpendioContext.Provider>
  );
}

export function useSpendio() {
  const context = useContext(SpendioContext);
  if (context === undefined) {
    throw new Error("useSpendio must be used within SpendioProvider");
  }
  return context;
}
