import React, { useState } from "react";
import { CustomSelect } from "./CustomSelect";
import { Search, X } from "lucide-react";

interface TransactionFilterProps {
  onFilterChange: (filters: FilterState) => void;
  categories?: string[];
}

export interface FilterState {
  search: string;
  category: string;
  minAmount: number | null;
  maxAmount: number | null;
  type: string;
}

export function TransactionFilter({ onFilterChange, categories = [] }: TransactionFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    minAmount: null,
    maxAmount: null,
    type: "all",
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const cleared: FilterState = {
      search: "",
      category: "",
      minAmount: null,
      maxAmount: null,
      type: "all",
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.category || filters.minAmount || filters.maxAmount || filters.type !== "all";

  return (
    <div className="space-y-3 mb-4">
      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
        <input
          type="text"
          placeholder="Search by description..."
          value={filters.search}
          onChange={(e) => handleChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium text-[#1db584] hover:text-[#0f8a56] transition"
      >
        {isOpen ? "Hide Filters" : "Show Filters"} {hasActiveFilters && <span className="ml-1 text-xs bg-[#1db584] text-white px-2 py-1 rounded-full">Active</span>}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#f9f9f9] space-y-3">
          {/* Type Filter */}
          <CustomSelect
            label="Type"
            value={filters.type}
            onChange={(value) => handleChange({ ...filters, type: value })}
            options={[
              { value: "all", label: "All Types" },
              { value: "income", label: "Income" },
              { value: "expense", label: "Expense" },
              { value: "savings", label: "Savings" },
              { value: "investing", label: "Investing" },
              { value: "debt_payment", label: "Debt Payment" },
            ]}
            placeholder="All Types"
          />

          {/* Category Filter */}
          {categories.length > 0 && (
            <CustomSelect
              label="Category"
              value={filters.category}
              onChange={(value) => handleChange({ ...filters, category: value })}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((cat) => ({
                  value: cat,
                  label: cat,
                })),
              ]}
              placeholder="All Categories"
            />
          )}

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Min Amount</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount || ""}
                onChange={(e) => handleChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Max Amount</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxAmount || ""}
                onChange={(e) => handleChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] outline-none transition"
              />
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#666666] hover:bg-white rounded-lg transition"
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
