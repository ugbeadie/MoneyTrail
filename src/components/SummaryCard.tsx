"use client";

import React from "react";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactionSummaryByMonth } from "@/lib/actions";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { TransactionSummary } from "@/types/transaction";
import { useMonth } from "@/contexts/MonthContext";
import { Spinner } from "@/components/ui/spinner";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  colorClass: string;
}

function SummaryCard({ title, value, icon, colorClass }: SummaryCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex-shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>
          ₦{Math.abs(value).toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SummaryCards() {
  // This needs to be converted to a client component to use the context
  // We'll create a wrapper component instead
  return <SummaryCardsClient />;
}

function SummaryCardsClient() {
  const { selectedMonthIndex } = useMonth();
  const [summary, setSummary] = React.useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        const data = await getTransactionSummaryByMonth(
          selectedMonthIndex,
          currentYear
        );
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [selectedMonthIndex]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-4 w-full">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <div className="flex-shrink-0">
                <Wallet className="h-4 w-4 text-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-8">
                <Spinner />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <div className="flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-8">
                <Spinner />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <div className="flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-8">
                <Spinner />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-4 w-full">
        <SummaryCard
          title="Balance"
          value={summary.balance}
          icon={<Wallet className="h-4 w-4 text-blue" />}
          colorClass={summary.balance >= 0 ? "text-green-600" : "text-red-600"}
        />
        <SummaryCard
          title="Total Income"
          value={summary.totalIncome}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          colorClass="text-green-600"
        />
        <SummaryCard
          title="Total Expenses"
          value={summary.totalExpenses}
          icon={<TrendingDown className="h-4 w-4 text-red-600" />}
          colorClass="text-red-600"
        />
      </div>
    </div>
  );
}
