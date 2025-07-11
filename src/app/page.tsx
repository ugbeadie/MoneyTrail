import { AmountDashboard } from "@/components/AmountDashboard";
import TransactionList from "@/components/transaction-list";
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AmountDashboard />
      <TransactionList />
    </div>
  );
}
