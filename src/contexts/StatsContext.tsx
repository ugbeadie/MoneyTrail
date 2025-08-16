"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { months } from "@/lib/constants";

interface StatsContextType {
  selectedPeriod: "weekly" | "monthly" | "annually";
  selectedMonth: string;
  activeTab: "income" | "expense";
  setSelectedPeriod: (period: "weekly" | "monthly" | "annually") => void;
  setSelectedMonth: (month: string) => void;
  setActiveTab: (tab: "income" | "expense") => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "annually"
  >("monthly");
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");

  return (
    <StatsContext.Provider
      value={{
        selectedPeriod,
        selectedMonth,
        activeTab,
        setSelectedPeriod,
        setSelectedMonth,
        setActiveTab,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}
