import { getTransactions } from "@/lib/actions";
import { Plus, Minus } from "lucide-react";
import type { Transaction } from "@/types/transaction";

interface TransactionItemProps {
  transaction: Transaction;
}
interface TransactionGroupProps {
  date: string;
  transactions: Transaction[];
}
function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isIncome ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isIncome ? (
            <Plus className="w-3 h-3 text-green-600" />
          ) : (
            <Minus className="w-3 h-3 text-red-600" />
          )}
        </div>

        <div className="md:flex">
          {transaction.description && (
            <div className="font-medium text-sm">{transaction.description}</div>
          )}
          <div className=" text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-0.5 md:ml-2">
            {transaction.category}
          </div>
        </div>
      </div>

      <div
        className={`font-semibold text-sm ${
          isIncome ? "text-green-600" : "text-red-600"
        }`}
      >
        {isIncome ? "+" : "-"}₦{transaction.amount.toFixed(2)}
      </div>
    </div>
  );
}

function TransactionGroup({ date, transactions }: TransactionGroupProps) {
  return (
    <div className="mb-6">
      <div className="text-sm font-medium text-muted-foreground mb-3">
        {(() => {
          const d = new Date(date);
          const day = d.getDate().toString().padStart(2, "0");
          const month = (d.getMonth() + 1).toString().padStart(2, "0");
          const year = d.getFullYear();
          const weekday = d.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Sun"

          return (
            <>
              {`${day}/${month}/${year} `}
              <span
                className={`font-semibold ${
                  weekday === "Sun"
                    ? "text-red-600"
                    : weekday === "Sat"
                    ? "text-blue-600"
                    : "text-muted-foreground"
                }`}
              >
                ({weekday})
              </span>
            </>
          );
        })()}
      </div>
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}

export default async function TransactionList() {
  const transactions = await getTransactions();

  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <p className="text-muted-foreground text-sm mb-6">
          No transactions yet. Add your first transaction!
        </p>
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce(
    (groups: { [key: string]: Transaction[] }, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      // Get just the date part
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  // Sort each group from newest to oldest based on when they were added
  Object.keys(groupedTransactions).forEach((date) => {
    groupedTransactions[date].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalIncomes = transactions.filter((t) => t.type === "income").length;
  const totalExpenses = transactions.filter((t) => t.type === "expense").length;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
      <p className="text-muted-foreground text-sm mb-6">
        You have {totalIncomes} {totalIncomes > 1 ? "incomes" : "income"} and{" "}
        {totalExpenses} {totalExpenses > 1 ? "expenses" : "expense"} this month
      </p>

      <div>
        {sortedDates.map((date) => (
          <TransactionGroup
            key={date}
            date={date}
            transactions={groupedTransactions[date]}
          />
        ))}
      </div>
    </div>
  );
}
