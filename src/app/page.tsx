import SummaryCards from "@/components/SummaryCard";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { MonthPickerTab } from "@/components/MonthPickerTab";
import TransactionManager from "@/components/TransactionManager";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto p-6 pt-0">
        <MonthPickerTab />
        <div className="space-y-8">
          {/* Summary Section */}
          <Suspense fallback={<Spinner />}>
            <SummaryCards />
          </Suspense>

          {/* Transaction Manager - handles both form and list */}
          <TransactionManager />
        </div>
      </main>
    </div>
  );
}
