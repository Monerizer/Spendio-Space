import React, { createContext, useContext, useState } from "react";

interface QuickAddContextType {
  isOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
}

const QuickAddContext = createContext<QuickAddContextType | undefined>(undefined);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openQuickAdd = () => setIsOpen(true);
  const closeQuickAdd = () => setIsOpen(false);

  return (
    <QuickAddContext.Provider value={{ isOpen, openQuickAdd, closeQuickAdd }}>
      {children}
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const context = useContext(QuickAddContext);
  if (context === undefined) {
    throw new Error("useQuickAdd must be used within QuickAddProvider");
  }
  return context;
}
