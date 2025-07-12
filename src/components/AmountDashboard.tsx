"use client";

import type React from "react";
import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowUp } from "lucide-react";
import type { TransactionSummary } from "@/types/transaction";
import { MonthPicker } from "./MonthPicker";

interface SummaryCardsProps {
  className?: string;
}

interface SummaryMetricProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

function SummaryMetric({ title, value, icon, colorClass }: SummaryMetricProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <span>{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-semibold ${colorClass}`}>
        {Math.abs(value).toFixed(2)} ₦
      </div>
    </div>
  );
}

export default function SummaryCards({ className }: SummaryCardsProps) {
  const [selectedMonth, setSelectedMonth] = useState("July");

  // For now, we'll use static data, but this could be filtered by month
  const summary: TransactionSummary = {
    totalIncome: 4250.0,
    totalExpenses: 400.0,
    balance: 3850.0,
  };

  return (
    <div className={`${className || ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Summary</h1>
        <MonthPicker
          selectedMonth={selectedMonth}
          onSelect={setSelectedMonth}
        />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <SummaryMetric
          title="Balance"
          value={summary.balance}
          icon={<ArrowUp className="h-4 w-4 text-blue-600" />}
          colorClass="text-foreground"
        />
        <SummaryMetric
          title="Income"
          value={summary.totalIncome}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          colorClass="text-foreground"
        />
        <SummaryMetric
          title="Expenses"
          value={summary.totalExpenses}
          icon={<TrendingDown className="h-4 w-4 text-red-600" />}
          colorClass="text-foreground"
        />
      </div>
    </div>
  );
}
