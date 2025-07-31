import { MonthPickerTab } from "@/components/MonthPickerTab";
import TransactionManager from "@/components/TransactionManager";
import { MonthProvider } from "@/contexts/MonthContext";

export default function HomePage() {
  return (
    <MonthProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-0 flex-1 w-full flex flex-col">
          <MonthPickerTab />
          <div className="w-full flex-1">
            <TransactionManager />
          </div>
        </main>
      </div>
    </MonthProvider>
  );
}
