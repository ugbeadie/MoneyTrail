"use client";

import { MonthPicker } from "./MonthPicker";
import { useMonth } from "@/contexts/MonthContext";

export function MonthPickerTab() {
  const { selectedMonth, setSelectedMonth } = useMonth();

  return (
    <div className="flex justify-between items-center mt-2 mb-2">
      <p className="font-bold text-2xl">Summary</p>
      <MonthPicker selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
    </div>
  );
}
