import { MonthPickerTab } from "@/components/MonthPickerTab";
import TransactionManager from "@/components/TransactionManager";
import { MonthProvider } from "@/contexts/MonthContext";

export default function HomePage() {
  return (
    <MonthProvider>
      <div className="min-h-screen bg-background">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-0">
          <MonthPickerTab />
          <div className="w-full">
            <TransactionManager />
          </div>
        </main>
      </div>
    </MonthProvider>
  );
}
