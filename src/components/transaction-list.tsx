import { cn } from "@/lib/utils"; // Optional utility if using class merging

const transactions = [
  {
    date: "Today",
    items: [
      { name: "Netflix", category: "Streaming", icon: "🍿", amount: -17.99 },
    ],
  },
  {
    date: "Yesterday",
    items: [
      { name: "Car payment", category: "Car", icon: "🚗", amount: -200 },
      { name: "Food", category: "Groceries", icon: "🛒", amount: -50 },
      { name: "Salary", category: "Salary", icon: "💼", amount: 5000 },
    ],
  },
];

export default function TransactionList() {
  return (
    <div className="w-full md:max-w-xl md:mx-auto px-6 py-6">
      <h2 className="text-2xl font-semibold mb-1">Transactions</h2>
      <p className="text-sm text-muted-foreground mb-6">
        You had 2 incomes and 23 expenses this month
      </p>

      {transactions.map(({ date, items }) => (
        <div key={date} className="mb-6">
          <h3 className="text-md font-medium text-muted-foreground mb-3">
            {date}
          </h3>

          <ul className="divide-y divide-border border rounded-md overflow-hidden">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between px-4 py-3 bg-background"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{item.icon}</div>
                  <div className="flex flex-row justify-center items-center">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    item.amount >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {item.amount >= 0 ? "+" : "-"}₦
                  {Math.abs(item.amount).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button className="text-sm text-primary underline mt-4">Load More</button>
    </div>
  );
}
