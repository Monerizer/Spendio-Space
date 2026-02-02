import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpendio } from "@/context/SpendioContext";
import { Layout } from "@/components/Layout";
import { CustomSelect } from "@/components/CustomSelect";
import { Download, Trash2, AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_CURRENCIES, getUserTimezone } from "@/utils/currencyDetection";

export default function Settings() {
  const { user, logout, updateUser } = useSpendio();
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "EUR");
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState("");

  useEffect(() => {
    setDetectedTimezone(getUserTimezone());
    // Sync selectedCurrency with user.currency
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user?.currency]);

  if (!user) return null;

  const handleChangePassword = () => {
    if (!newPass || !confirmPass) {
      toast.error("Please enter both passwords");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPass.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    const updated = { ...user };
    updated.pass = newPass;
    updateUser(updated);
    setNewPass("");
    setConfirmPass("");
    toast.success("Password updated successfully!");
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(user.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spendio-export-${user.data.currentMonth}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    const updated = { ...user };
    // Clear all financial data but keep account
    updated.data.months = {};
    updated.data.currentMonth = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0");
    updated.data.months[updated.data.currentMonth] = {
      totals: { income: 0, expenses: 0, savings: 0, investing: 0, debtPay: 0 },
      tx: [],
      incomeBreakdown: {},
      expenseBreakdown: {},
    };
    updated.data.snapshot = null;
    updated.data.debts = [];
    updated.data.targets = { savings: 0, investing: 0 };

    updateUser(updated);
    setShowClearDataConfirm(false);
    toast.success("All financial data has been cleared. Your account remains active.");
  };

  const handleTerminateAccount = async () => {
    try {
      // Sign out the user
      await logout();

      setShowTerminateConfirm(false);
      navigate("/");
      toast.success("Your account has been terminated. To permanently delete your data, please contact support.");
    } catch (error) {
      console.error("Error terminating account:", error);
      toast.error("Failed to terminate account");
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    const updated = { ...user };
    updated.currency = newCurrency;
    updateUser(updated);
    toast.success(`Currency changed to ${AVAILABLE_CURRENCIES.find((c) => c.code === newCurrency)?.name || newCurrency}`);
  };

  return (
    <Layout currentPage="settings">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Account Settings */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Account & Security</h2>
          <p className="text-sm text-[#666666] mb-6">Manage your account settings</p>

          <div className="space-y-6">
            {/* Account Info */}
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Account Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[#666666] mb-1">Username</label>
                  <div className="px-4 py-2 bg-[#f3f3f3] rounded-lg text-[#1a1a1a] font-medium">{user.name}</div>
                </div>
                <div>
                  <label className="block text-sm text-[#666666] mb-1">Email</label>
                  <div className="px-4 py-2 bg-[#f3f3f3] rounded-lg text-[#1a1a1a] font-medium">{user.email}</div>
                </div>
                <div>
                  <CustomSelect
                    label="Currency"
                    value={selectedCurrency}
                    onChange={(value) => handleCurrencyChange(value)}
                    options={AVAILABLE_CURRENCIES.map((currency) => ({
                      value: currency.code,
                      label: `${currency.name} - ${currency.regions}`,
                    }))}
                    placeholder="Select currency..."
                  />
                  <p className="text-xs text-[#999999] mt-2">
                    Auto-detected timezone: <strong>{detectedTimezone}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="New password (4+ characters)"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Data Management</h3>
              <div className="space-y-3">
                <div>
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
                  >
                    <Download size={18} />
                    Export Data as JSON
                  </button>
                  <p className="text-xs text-[#999999] text-center mt-1">Download your financial data to keep a backup</p>
                </div>

                <div>
                  <button
                    onClick={() => setShowClearDataConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-yellow-300 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-50 transition"
                  >
                    <Trash2 size={18} />
                    Clear All Financial Data
                  </button>
                  <p className="text-xs text-[#999999] text-center mt-1">Delete all transactions, income, expenses, and analytics (account remains active)</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} />
                Danger Zone
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTerminateConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-300 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition"
                >
                  <AlertTriangle size={18} />
                  Terminate Account
                </button>
                <p className="text-xs text-[#999999] text-center">Permanently delete your account and all associated data. This cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] rounded-2xl p-6">
          <h3 className="font-semibold text-[#1a1a1a] mb-3">About Spendio Space</h3>
          <p className="text-sm text-[#666666] leading-relaxed">
            Spendio Space is a personal finance app focused on giving you clarity about your money. All your data is stored
            locally on this device—we don't connect to your bank accounts, and we don't keep your data on our servers.
          </p>
          <p className="text-sm text-[#666666] leading-relaxed mt-3">
            Your AI Financial Advisor is powered by advanced AI and has access to your complete financial profile to provide personalized insights and recommendations.
          </p>
          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#1a1a1a]">Clear All Financial Data?</h3>
              <p className="text-[#666666] mt-2">
                This will delete all your transactions, income, expenses, and analytics. Your account will remain active and you can start fresh.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-[#666666]">
              <strong className="text-yellow-700">What will be deleted:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>All transactions (income, expenses, savings, etc.)</li>
                <li>Account balances and snapshots</li>
                <li>Debt records</li>
                <li>Analytics and charts</li>
              </ul>
              <p className="mt-2 text-yellow-700"><strong>What remains:</strong> Your account, username, password</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearDataConfirm(false)}
                className="flex-1 border border-[#e5e5e5] text-[#1a1a1a] font-semibold py-2 rounded-lg hover:bg-[#f3f3f3] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 bg-yellow-600 text-white font-semibold py-2 rounded-lg hover:bg-yellow-700 transition"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Account Confirmation Modal */}
      {showTerminateConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-red-600">Terminate Account?</h3>
              <p className="text-[#666666] mt-2">
                This will permanently delete your account and all financial data. This action cannot be undone.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-[#666666]">
              <strong className="text-red-600">Permanent deletion includes:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Your account login credentials</li>
                <li>All financial data and transactions</li>
                <li>Analytics and charts</li>
                <li>All account settings and preferences</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTerminateConfirm(false)}
                className="flex-1 border border-[#e5e5e5] text-[#1a1a1a] font-semibold py-2 rounded-lg hover:bg-[#f3f3f3] transition"
              >
                Keep Account
              </button>
              <button
                onClick={handleTerminateAccount}
                className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
