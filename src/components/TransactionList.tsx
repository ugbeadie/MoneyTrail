import { cn } from "@/lib/utils"; // Optional utility if using class merging
import { getTransactions } from "@/lib/actions";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { TransactionImage } from "./transaction-image";

interface TransactionListProps {
  className?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
}
// const transactions = [
//   {
//     date: "Today",
//     items: [
//       { name: "Netflix", category: "Streaming", icon: "🍿", amount: -17.99 },
//     ],
//   },
//   {
//     date: "Yesterday",
//     items: [
//       { name: "Car payment", category: "Car", icon: "🚗", amount: -200 },
//       { name: "Food", category: "Groceries", icon: "🛒", amount: -50 },
//       { name: "Salary", category: "Salary", icon: "💼", amount: 5000 },
//     ],
//   },
// ];

function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = isIncome ? "text-green-500" : "text-red-500";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";
  const amountPrefix = isIncome ? "+" : "-";
  return (
    <div key={transaction.id} className="mb-6">
      <h3 className="text-md font-medium text-muted-foreground mb-3">
        {new Date(transaction.createdAt).toLocaleDateString()}
      </h3>

      <ul className="divide-y divide-border border rounded-md overflow-hidden">
        <li
          key={transaction.id}
          className="flex items-center justify-between px-4 py-3 bg-background"
        >
          <div className="flex items-center space-x-3">
            <div className="text-xl">
              <Icon className={`w-5 h-5 ${iconColor} mt-1 flex-shrink-0`} />
            </div>
            <div className="flex flex-row justify-center items-center">
              <span className="font-medium text-sm">
                {transaction.description}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1 ml-2">
                {transaction.category}
              </span>
            </div>
          </div>
          <div className={`font-medium text-sm ${amountColor}`}>
            {amountPrefix}₦{transaction.amount.toFixed(2)}
          </div>
        </li>
      </ul>
    </div>
  );
}

export default async function TransactionList() {
  const transactions = await getTransactions();

  return (
    <div className="w-full md:max-w-xl md:mx-auto px-6 py-6">
      <h2 className="text-2xl font-semibold mb-1">Transactions</h2>
      <p className="text-sm text-muted-foreground mb-6">
        You had 2 incomes and 23 expenses this month
      </p>

      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}

      <button className="text-sm text-primary underline mt-4">Load More</button>
    </div>
  );
}
