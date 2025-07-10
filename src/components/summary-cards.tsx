import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactionSummary } from "@/lib/actions";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { TransactionSummary } from "@/types/transaction";

interface SummaryCardsProps {
  className?: string;
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

function SummaryCard({ title, value, icon, colorClass }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex-shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>
          ${Math.abs(value).toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SummaryCards({ className }: SummaryCardsProps) {
  const summary: TransactionSummary = await getTransactionSummary();

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className || ""}`}>
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
      <SummaryCard
        title="Balance"
        value={summary.balance}
        icon={<Wallet className="h-4 w-4 text-blue-600" />}
        colorClass={summary.balance >= 0 ? "text-green-600" : "text-red-600"}
      />
    </div>
  );
}
