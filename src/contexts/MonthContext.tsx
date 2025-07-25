"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { months } from "@/lib/constants";

interface MonthContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedMonthIndex: number;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return months[currentMonth];
  });

  const selectedMonthIndex = months.indexOf(selectedMonth);

  return (
    <MonthContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        selectedMonthIndex,
      }}
    >
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error("useMonth must be used within a MonthProvider");
  }
  return context;
}
