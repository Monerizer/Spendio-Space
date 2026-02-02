import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpendioProvider } from "./context/SpendioContext";
import { QuickAddProvider } from "./context/QuickAddContext";
import { QuickAddModal } from "./components/QuickAddModal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FinancialData from "./pages/FinancialData";
import Wealth from "./pages/Wealth";
import Analytics from "./pages/Analytics";
import Advisor from "./pages/Advisor";
import Guides from "./pages/Guides";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Support from "./pages/Support";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import TransactionHistory from "./pages/TransactionHistory";
import Security from "./pages/Security";
import Features from "./pages/Features";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SpendioProvider>
        <QuickAddProvider>
          <QuickAddModal />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/data" element={<FinancialData />} />
            <Route path="/wealth" element={<Wealth />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/support" element={<Support />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/accessibility" element={<AccessibilityStatement />} />
            <Route path="/security" element={<Security />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </QuickAddProvider>
      </SpendioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
