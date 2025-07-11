"use client";

import { useState, useEffect } from "react";
import { getTransactionSummary } from "@/lib/actions";
import type { TransactionSummary } from "@/types/transaction";
import { MonthPicker } from "@/components/MonthPicker";
import { SummaryStats } from "@/components/SummaryStats";
import { months } from "@/lib/constants";

export function AmountDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return months[currentMonth];
  });

  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const data = await getTransactionSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch transaction summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [selectedMonth]); // Refetch when month changes

  return (
    <div className="w-full">
      {/* Desktop: Single row with 5 columns - even spacing */}
      <div className="hidden md:flex justify-between items-center py-4 w-full px-6">
        {/*Summary */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-semibold text-foreground">Summary</h1>
        </div>

        <SummaryStats summary={summary} isLoading={isLoading} />

        {/*Month Picker */}
        <div className="flex-1 flex flex-col items-end">
          <MonthPicker
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="md:hidden py-4 space-y-6 px-6">
        {/* Top row: Summary and Month Picker */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">Summary</h1>
          <MonthPicker
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>

        {/* Financial amounts in single column */}
        <div className="space-y-4">
          {/* Net Total */}
          <div className="flex flex-col">
            <SummaryStats summary={summary} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="border-b border-border" />
    </div>
  );
}
