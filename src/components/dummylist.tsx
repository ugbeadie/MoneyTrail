import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTransactions } from "@/lib/actions";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { TransactionImage } from "./transaction-image";

interface TransactionListProps {
  className?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionnItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = isIncome ? "text-green-500" : "text-red-500";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";
  const amountPrefix = isIncome ? "+" : "-";

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <Icon className={`w-5 h-5 ${iconColor} mt-1 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{transaction.category}</div>
          {transaction.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {transaction.description}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString()}
          </div>
          {transaction.imageUrl && (
            <div className="mt-2">
              <TransactionImage imageUrl={transaction.imageUrl} />
            </div>
          )}
        </div>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <div className={`font-semibold ${amountColor}`}>
          {amountPrefix}${transaction.amount.toFixed(2)}
        </div>
        <Badge variant="secondary" className="text-xs mt-1">
          {transaction.type}
        </Badge>
      </div>
    </div>
  );
}

export default async function TransactionList({
  className,
}: TransactionListProps) {
  const transactions = await getTransactions();

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <div className="space-y-2">
            <p>No transactions yet.</p>
            <p className="text-sm">Add your first transaction above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionnItem key={transaction.id} transaction={transaction} />
        ))}
      </CardContent>
    </Card>
  );
}
