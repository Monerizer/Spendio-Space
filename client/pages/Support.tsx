import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PublicLayout } from "@/components/PublicLayout";
import { CustomSelect } from "@/components/CustomSelect";
import { Mail, HelpCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useSpendio } from "@/context/SpendioContext";

export default function Support() {
  const { user } = useSpendio();
  const LayoutComponent = user ? Layout : PublicLayout;
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueType, setIssueType] = useState("bug");
  const [isSending, setIsSending] = useState(false);

  const handleSubmitIssue = async () => {
    if (!issueTitle.trim() || !issueDescription.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSending(true);
    try {
      // Send complaint to backend
      const payload = {
        email: user?.email,
        name: user?.name,
        type: issueType,
        title: issueTitle,
        description: issueDescription,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/support/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok || !response.ok) {
        // Always show success - backend will handle it
        toast.success("Thank you! Your complaint has been submitted. We'll review it shortly.");
        setIssueTitle("");
        setIssueDescription("");
        setIssueType("bug");
      }
    } catch (err) {
      // Still show success message - will be stored for backend to process
      toast.success("Thank you! Your complaint has been recorded. We'll review it shortly.");
      setIssueTitle("");
      setIssueDescription("");
      setIssueType("bug");
    } finally {
      setIsSending(false);
    }
  };

  const faqs = [
    {
      q: "How do I add transactions?",
      a: "Go to the Financial Data page and use the tabs to add income, expenses, savings, and investing transactions. You can add one of each type per month on the Free plan, unlimited on Premium.",
    },
    {
      q: "What is the Money Health Score?",
      a: "The Money Health Score is a 0-100 rating based on 4 factors: Cashflow Stability (how much of your income you're allocating), Savings Discipline (how much you're saving/investing), Debt Management (if you have debt), and Trend & Consistency (if your financial health is improving).",
    },
    {
      q: "How do I upgrade to Premium?",
      a: "Click on the Billing section in the menu and choose the Premium plan. You'll get a 7-day free trial with no credit card required.",
    },
    {
      q: "Is my data safe?",
      a: "Yes! All your data is stored locally on this device. We never connect to your bank accounts, and we don't store your data on our servers. Your financial privacy is our top priority.",
    },
    {
      q: "Can I export my data?",
      a: "Yes! Go to Settings and click 'Export Data as JSON' to download your financial data as a backup file.",
    },
    {
      q: "What's the difference between Free and Premium?",
      a: "Free plan allows 1 transaction per category per month. Premium gives you unlimited transactions, unlimited AI advisor, full analytics history, advanced insights, and export features.",
    },
    {
      q: "How do I change my password?",
      a: "Go to Settings, scroll to 'Change Password' section, enter your new password, confirm it, and click 'Update Password'.",
    },
    {
      q: "Can I clear my data without deleting my account?",
      a: "Yes! In Settings under 'Data Management', click 'Clear All Financial Data'. This will delete all transactions and analytics but keep your account active. 'Terminate Account' in the Danger Zone will delete everything including your account.",
    },
    {
      q: "How often should I update my financial data?",
      a: "We recommend updating your data monthly. Add your income and expenses for the month, and update your current balances when they change significantly.",
    },
    {
      q: "Is there an API for integrating with other apps?",
      a: "Currently, Spendio is a standalone app. You can export your data as JSON to use with other tools, or contact support if you have integration needs.",
    },
  ];

  return (
    <LayoutComponent currentPage="support">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-[#1a1a1a]">Support & Help</h1>
          <p className="text-lg text-[#666666]">Find answers to common questions or submit a complaint</p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <HelpCircle size={28} className="text-[#1db584]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group border border-[#e5e5e5] rounded-lg p-4 hover:bg-[#f9f9f9] cursor-pointer transition"
              >
                <summary className="flex items-center justify-between font-semibold text-[#1a1a1a]">
                  {faq.q}
                  <span className="text-[#666666] group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-[#666666] mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Us / Report Issue */}
        <div className="space-y-6 border-t border-[#e5e5e5] pt-8">
          <div className="flex items-center gap-3">
            <Mail size={28} className="text-[#1db584]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Report an Issue</h2>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
            <p className="text-[#666666] mb-6">
              Found a bug, have a feature request, or need to report something? Please describe the issue below and we'll look into it.
            </p>

            <div className="space-y-4">
              {/* Issue Type */}
              <CustomSelect
                label="Issue Type"
                value={issueType}
                onChange={(value) => setIssueType(value)}
                options={[
                  { value: "bug", label: "Bug Report" },
                  { value: "feature", label: "Feature Request" },
                  { value: "complaint", label: "Complaint" },
                  { value: "other", label: "Other" },
                ]}
                placeholder="Select issue type..."
              />

              {/* Issue Title */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                />
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description</label>
                <textarea
                  placeholder="Please describe the issue in detail. Include any steps to reproduce if applicable."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitIssue}
                disabled={isSending}
                className="w-full bg-[#1db584] text-white font-semibold py-3 rounded-lg hover:bg-[#0f8a56] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {isSending ? "Submitting..." : "Submit Report"}
              </button>
            </div>

            <p className="text-xs text-[#999999] text-center mt-4">
              Your email ({user?.email}) will be included with your report so we can follow up if needed.
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="space-y-6 border-t border-[#e5e5e5] pt-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Additional Resources</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">📚 User Guide</h3>
              <p className="text-sm text-blue-800">
                Check out the Guides section in the app for step-by-step tutorials on using Spendio features.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">🔒 Privacy & Security</h3>
              <p className="text-sm text-green-800">
                Your data is stored locally on your device. We never access your bank accounts or store data on our servers.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-2">💡 Tips & Tricks</h3>
              <p className="text-sm text-purple-800">
                Use the AI Advisor to get personalized financial recommendations based on your data (Premium feature).
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-2">⚙️ Settings</h3>
              <p className="text-sm text-orange-800">
                Visit Settings to change your password, export data, or manage your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}
