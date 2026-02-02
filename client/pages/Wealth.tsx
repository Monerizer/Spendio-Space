import React, { useState } from "react";
import { useSpendio } from "@/context/SpendioContext";
import { Layout } from "@/components/Layout";
import { formatCurrency } from "@/utils/calculations";
import { Edit2, Trash2, Check, X, Lock } from "lucide-react";
import { toast } from "sonner";
import { isFreePlan } from "@/utils/subscriptionUtils";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function Wealth() {
  const { user, updateUser } = useSpendio();
  const [editingTarget, setEditingTarget] = useState<"savings" | "investing" | null>(null);
  const [editValues, setEditValues] = useState({
    savings: user?.data.targets?.savings || 0,
    investing: user?.data.targets?.investing || 0
  });
  const [newSavingsInput, setNewSavingsInput] = useState("");
  const [newInvestingInput, setNewInvestingInput] = useState("");
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    features: [] as string[],
  });

  if (!user) return null;

  const savedTargets = user.data.targets;

  const showUpgradeModal = () => {
    setUpgradeModal({
      isOpen: true,
      title: "Upgrade to Set Wealth Targets",
      description: "Wealth targets and goal setting is a Premium feature. Upgrade to Pro to set and track your savings and investing goals.",
      features: [
        "Unlimited transactions",
        "Unlimited AI advisor",
        "Full analytics & export",
        "Advanced financial insights"
      ],
    });
  };

  const handleEditTarget = (type: "savings" | "investing") => {
    if (isFreePlan(user)) {
      showUpgradeModal();
      return;
    }
    setEditingTarget(type);
    if (type === "savings") {
      setEditValues({ ...editValues, savings: savedTargets.savings });
    } else {
      setEditValues({ ...editValues, investing: savedTargets.investing });
    }
  };

  const handleConfirmEdit = (type: "savings" | "investing") => {
    if (isFreePlan(user)) {
      showUpgradeModal();
      return;
    }
    const updated = { ...user };
    const amount = type === "savings" ? editValues.savings : editValues.investing;
    if (type === "savings") {
      updated.data.targets.savings = editValues.savings;
    } else {
      updated.data.targets.investing = editValues.investing;
    }
    updateUser(updated);
    setEditingTarget(null);
    toast.success(`${type === "savings" ? "Savings" : "Investing"} target updated: ${formatCurrency(amount)}`);
  };

  const handleDeleteTarget = (type: "savings" | "investing") => {
    if (isFreePlan(user)) {
      showUpgradeModal();
      return;
    }
    const updated = { ...user };
    if (type === "savings") {
      updated.data.targets.savings = 0;
    } else {
      updated.data.targets.investing = 0;
    }
    updateUser(updated);
    toast.success(`${type === "savings" ? "Savings" : "Investing"} target deleted`);
  };

  const handleSaveNewTargets = () => {
    if (isFreePlan(user)) {
      showUpgradeModal();
      return;
    }
    const updated = { ...user };
    const newSavings = Number(newSavingsInput) || 0;
    const newInvesting = Number(newInvestingInput) || 0;
    updated.data.targets = { savings: newSavings, investing: newInvesting };
    updateUser(updated);
    toast.success("Wealth targets saved successfully!");
    setNewSavingsInput("");
    setNewInvestingInput("");
  };

  const currentMonth = user.data.months[user.data.currentMonth];

  return (
    <Layout currentPage="wealth">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          title={upgradeModal.title}
          description={upgradeModal.description}
          features={upgradeModal.features}
          onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
        />

        {/* Free Plan Banner */}
        {isFreePlan(user) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <Lock size={20} className="text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900">Wealth Targets Locked</h3>
              <p className="text-sm text-yellow-800">Upgrade to Premium to set and track your savings and investing goals.</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Your Wealth Targets</h2>
          <p className="text-sm text-[#666666] mb-6">Set your monthly goals for savings and investing. These targets help calculate your Money Health Score.</p>

          <div className="space-y-6">
            {/* Targets */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1a1a1a]">Monthly Targets</h3>

              {/* Display saved targets or input form */}
              {savedTargets.savings > 0 || savedTargets.investing > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Savings Target Card */}
                  <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#f9f9f9]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-[#1a1a1a]">Savings Target</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTarget("savings")}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Edit savings target"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTarget("savings")}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Delete savings target"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingTarget === "savings" ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={editValues.savings || ""}
                          onChange={(e) => setEditValues({ ...editValues, savings: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmEdit("savings")}
                            className="flex-1 py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTarget(null)}
                            className="flex-1 py-2 px-3 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-[#1db584]">{formatCurrency(savedTargets.savings)}</div>
                        <p className="text-xs text-[#666666] mt-1">How much you want to save monthly</p>
                      </div>
                    )}
                  </div>

                  {/* Investing Target Card */}
                  <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#f9f9f9]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-[#1a1a1a]">Investing Target</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTarget("investing")}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Edit investing target"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTarget("investing")}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Delete investing target"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingTarget === "investing" ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={editValues.investing || ""}
                          onChange={(e) => setEditValues({ ...editValues, investing: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmEdit("investing")}
                            className="flex-1 py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                            <Check size={16} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTarget(null)}
                            className="flex-1 py-2 px-3 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-[#1db584]">{formatCurrency(savedTargets.investing)}</div>
                        <p className="text-xs text-[#666666] mt-1">How much you want to invest monthly</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Set your first wealth targets</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Savings Target</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newSavingsInput}
                        onChange={(e) => setNewSavingsInput(e.target.value)}
                        className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Investing Target</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newInvestingInput}
                        onChange={(e) => setNewInvestingInput(e.target.value)}
                        className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveNewTargets}
                    className="w-full py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                  >
                    Save Targets
                  </button>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-4 pt-6 border-t border-[#e5e5e5]">
              <h3 className="font-semibold text-[#1a1a1a]">This Month's Progress</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#1a1a1a]">Savings Progress</label>
                    <span className="text-sm font-bold text-[#1db584]">{savedTargets.savings ? Math.round((currentMonth.totals.savings / savedTargets.savings) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-[#f3f3f3] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1db584] to-[#4dd4a4] transition-all duration-300"
                      style={{ width: `${Math.min(100, savedTargets.savings ? Math.round((currentMonth.totals.savings / savedTargets.savings) * 100) : 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    {formatCurrency(currentMonth.totals.savings)} of {formatCurrency(savedTargets.savings)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#1a1a1a]">Investing Progress</label>
                    <span className="text-sm font-bold text-[#1db584]">{savedTargets.investing ? Math.round((currentMonth.totals.investing / savedTargets.investing) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-[#f3f3f3] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1db584] to-[#4dd4a4] transition-all duration-300"
                      style={{ width: `${Math.min(100, savedTargets.investing ? Math.round((currentMonth.totals.investing / savedTargets.investing) * 100) : 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    {formatCurrency(currentMonth.totals.investing)} of {formatCurrency(savedTargets.investing)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
