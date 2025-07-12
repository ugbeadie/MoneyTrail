import TransactionForm from "@/components/transaction-form";
import TransactionList from "@/components/TransactionList";
import SummaryCards from "@/components/summary-cards";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto p-6">
        <div className="space-y-8">
          {/* Summary Section */}
          <Suspense fallback={<Spinner />}>
            <SummaryCards />
          </Suspense>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Transaction List */}
            <div className="lg:order-1">
              <Suspense fallback={<Spinner />}>
                <TransactionList />
              </Suspense>
            </div>

            {/* Transaction Form */}
            <div className="lg:order-2">
              <TransactionForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
