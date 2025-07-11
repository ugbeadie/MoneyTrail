import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { TransactionSummary } from "@/types/transaction";
import Spinner from "@/components/ui/spinner";

interface SummaryStatsProps {
  summary: TransactionSummary;
  isLoading: boolean;
}

export function SummaryStats({ summary, isLoading }: SummaryStatsProps) {
  const formatAmount = (value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const items = [
    {
      label: "Balance",
      value: summary.balance,
      color: "text-muted-foreground",
      icon: <Wallet className="h-4 w-4 text-blue-500" />,
    },
    {
      label: "Income",
      value: summary.totalIncome,
      color: "text-green-600",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />,
    },
    {
      label: "Expenses",
      value: summary.totalExpenses,
      color: "text-red-600",
      icon: <TrendingDown className="h-4 w-4 text-red-600" />,
    },
  ];

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between w-full">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex-1 flex flex-col text-center space-y-1"
          >
            <div
              className={`text-sm font-medium ${item.color} flex justify-center align-center`}
            >
              {item.label}
              <span className="ml-2 mt-[3px]">{item.icon}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  {formatAmount(item.value)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ₦
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <div className={`text-sm font-medium mb-2 ${item.color} flex`}>
              {item.label} <span className="ml-2 mt-[3px]">{item.icon}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <div className="animate-pulse bg-muted h-8 w-40 rounded" />
              ) : (
                <>
                  {formatAmount(item.value)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ₦
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
