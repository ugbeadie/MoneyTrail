"use client";
import { useState } from "react";
import { MonthPicker } from "@/components/MonthPicker";
import { months } from "@/lib/constants";

export function MonthPickerTab() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return months[currentMonth];
  });
  return (
    <div className="flex justify-between items-center">
      <p className="font-bold text-2xl">Summary</p>
      <MonthPicker selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
    </div>
  );
}
