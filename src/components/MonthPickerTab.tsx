"use client";

import { MonthPicker } from "@/components/MonthPicker";
import { useMonth } from "@/contexts/MonthContext";

export function MonthPickerTab() {
  const { selectedMonth, setSelectedMonth } = useMonth();

  return (
    <div className="flex justify-between items-center">
      <p className="font-bold text-2xl">Summary</p>
      <MonthPicker selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
    </div>
  );
}
