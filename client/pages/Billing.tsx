import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpendio } from "@/context/SpendioContext";
import { Layout } from "@/components/Layout";
import { PublicLayout } from "@/components/PublicLayout";
import { Check, X } from "lucide-react";
import { isProPlan } from "@/utils/subscriptionUtils";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "sonner";

export default function Billing() {
  const navigate = useNavigate();
  const { user, updateSubscription } = useSpendio();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const LayoutComponent = user ? Layout : PublicLayout;

  const userIsPro = isProPlan(user);
  // Billing is always in EUR, regardless of user's currency preference
  const billingCurrency = "EUR";

  const plans = [
    {
      name: "Free",
      price: formatCurrency(0, billingCurrency),
      cycle: "",
      description: "Perfect for getting started",
      features: [
        { name: "Manual data entry", included: true },
        { name: "Money Health Score", included: true },
        { name: "Income & expense tracking", included: true },
        { name: "Monthly dashboard", included: true },
        { name: "AI summaries (limited)", included: true },
        { name: "Up to 1 transaction per category/month", included: true },
        { name: "Unlimited AI advisor", included: false },
        { name: "Full analytics history", included: false },
        { name: "Advanced insights", included: false },
        { name: "Export & reports", included: false },
      ],
      highlighted: false,
      cta: userIsPro ? "Downgrade" : "Current Plan",
      ctaDisabled: userIsPro ? false : true,
    },
    {
      name: "Premium",
      price: billingCycle === "monthly" ? formatCurrency(11.99, billingCurrency) : formatCurrency(99, billingCurrency),
      cycle: billingCycle === "monthly" ? "/month" : "/year",
      description: "Unlock full financial control",
      features: [
        { name: "Manual data entry", included: true },
        { name: "Money Health Score", included: true },
        { name: "Income & expense tracking", included: true },
        { name: "Monthly dashboard", included: true },
        { name: "AI summaries (unlimited)", included: true },
        { name: "Unlimited transactions", included: true },
        { name: "Unlimited AI advisor", included: true },
        { name: "Full analytics history", included: true },
        { name: "Advanced insights", included: true },
        { name: "Export & reports", included: true },
      ],
      highlighted: true,
      cta: userIsPro ? "Current Plan" : "Start 7-Day Free Trial",
      ctaDisabled: userIsPro ? true : false,
    },
  ];

  return (
    <LayoutComponent currentPage="settings">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Current Plan Badge - Only show if authenticated */}
        {user && (
          <div className="flex justify-center">
            <div className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-4 ${
              userIsPro
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-blue-100 text-blue-700 border border-blue-300"
            }`}>
              Current Plan: <strong>{userIsPro ? "Premium" : "Free"}</strong>
              {userIsPro && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="ml-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition"
                >
                  Cancel Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Simple, Transparent Pricing</h1>
          <p className="text-lg text-[#666666]">Choose the plan that fits your financial clarity needs</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4">
          <span className={`font-medium ${billingCycle === "monthly" ? "text-[#1a1a1a]" : "text-[#666666]"}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative inline-flex h-8 w-16 items-center rounded-full bg-[#e5e5e5]"
          >
            <span
              className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition ${
                billingCycle === "yearly" ? "translate-x-8" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`font-medium ${billingCycle === "yearly" ? "text-[#1a1a1a]" : "text-[#666666]"}`}>
            Yearly <span className="text-xs bg-[#1db584] text-white px-2 py-1 rounded ml-2">Save 31%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border transition-all ${
                plan.highlighted
                  ? "border-[#1db584] bg-gradient-to-br from-green-50 to-white shadow-lg scale-105"
                  : "border-[#e5e5e5] bg-white shadow-sm"
              }`}
            >
              <div className="p-8">
                {/* Badge */}
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-[#1db584] text-white text-xs font-bold rounded-full mb-3">
                    Most Popular
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">{plan.name}</h3>
                <p className="text-sm text-[#666666] mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#1a1a1a]">
                    {plan.price}
                    <span className="text-sm text-[#666666]">{plan.cycle}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  disabled={plan.ctaDisabled}
                  onClick={() => {
                    if (plan.name === "Premium" && !userIsPro) {
                      if (!user) {
                        // Not authenticated - navigate to signup
                        navigate("/?signup=true");
                      } else {
                        // Authenticated - Open Stripe Checkout
                        // This should open a Stripe Checkout session
                        // Once integrated, replace with: window.location.href = `${STRIPE_CHECKOUT_URL}?email=${user.email}`
                        toast.info("Opening secure payment...");
                        // Temporary: Show message that payment is required
                        alert("Payment processing is coming soon. Your 7-day free trial will start after payment.");
                        // TODO: Integrate with Stripe Checkout to collect payment before activating
                        // Only activate AFTER successful payment processing
                        // Do NOT call updateSubscription("pro") until payment is confirmed
                      }
                    } else if (plan.name === "Free" && userIsPro) {
                      // Show downgrade confirmation
                      setShowCancelConfirm(true);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition mb-8 ${
                    plan.highlighted
                      ? "bg-[#1db584] text-white hover:bg-[#0f8a56] disabled:opacity-50 disabled:cursor-not-allowed"
                      : "border border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#f3f3f3] disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-3 border-t border-[#e5e5e5] pt-6">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check size={18} className="text-[#22c55e] flex-shrink-0" />
                      ) : (
                        <X size={18} className="text-[#999999] flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-[#1a1a1a]" : "text-[#999999]"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, absolutely. Cancel your Premium subscription anytime with no questions asked. You'll keep access until the end of your billing cycle.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All new Premium subscriptions include a 7-day free trial. A valid credit card is required to activate the trial.",
              },
              {
                q: "What happens to my data if I downgrade?",
                a: "Your data stays safe. If you downgrade from Premium to Free, you'll lose access to advanced features, but your data remains in your account.",
              },
              {
                q: "Can I change my plan later?",
                a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers.",
              },
              {
                q: "Is my financial data secure?",
                a: "Yes. All data is encrypted in transit and at rest. We never share your data with third parties, and we comply with GDPR and other privacy standards.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="group border border-[#e5e5e5] rounded-lg p-4 hover:bg-[#f9f9f9] cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-[#1a1a1a]">
                  {faq.q}
                  <span className="text-[#666666] group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-[#666666] mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Trust Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Your financial data is yours alone</h3>
          <p className="text-[#666666] max-w-2xl mx-auto">
            Spendio uses bank-grade encryption. We never sell your data. We never connect to your bank accounts. Your financial privacy is
            our top priority.
          </p>
        </div>
      </div>

      {/* Cancel Plan Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#1a1a1a]">Cancel Premium Plan?</h3>
              <p className="text-[#666666] mt-2">
                You're about to downgrade to the Free plan. You'll lose access to unlimited transactions and advanced features.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-[#666666]">
              <strong className="text-red-600">What you'll lose:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Unlimited transactions (limited to 1 per category/month)</li>
                <li>Advanced financial insights</li>
                <li>Full analytics & export features</li>
                <li>Unlimited AI advisor access</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-[#e5e5e5] text-[#1a1a1a] font-semibold py-2 rounded-lg hover:bg-[#f3f3f3] transition"
              >
                Keep Premium
              </button>
              <button
                onClick={() => {
                  updateSubscription("free");
                  setShowCancelConfirm(false);
                  alert("Your Premium plan has been cancelled. You're now on the Free plan.");
                }}
                className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}
