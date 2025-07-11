"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function AmountDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return months[currentMonth];
  });

  // Hardcoded data - will be replaced with actual values from Prisma later
  const income = 135780.47;
  const expenses = 87600.34;
  const netTotal = income - expenses;

  return (
    <div className="w-full">
      {/* Desktop: Single row with 5 columns - even spacing */}
      <div className="hidden md:flex justify-between items-start py-4 w-full">
        {/* Column 1: Summary */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-xl font-semibold text-foreground">Summary</h1>
        </div>

        {/* Column 2: Net Total */}
        <div className="flex-1 flex flex-col text-center">
          <div className="text-sm font-medium mb-2 text-muted-foreground">
            Balance
          </div>
          <div className="text-2xl font-bold text-foreground">
            {netTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Column 3: Income */}
        <div className="flex-1 flex flex-col text-center">
          <div className="text-sm font-medium mb-2 text-green-600">Income</div>
          <div className="text-2xl font-bold text-foreground">
            {income.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Column 4: Expenses */}
        <div className="flex-1 flex flex-col text-center">
          <div className="text-sm font-medium mb-2 text-red-600">Expenses</div>
          <div className="text-2xl font-bold text-foreground">
            {expenses.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Column 5: Month Picker */}
        <div className="flex-1 flex flex-col items-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-foreground hover:bg-transparent p-0"
              >
                {selectedMonth}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {months.map((month) => (
                <DropdownMenuItem
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className="cursor-pointer"
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="md:hidden py-4 space-y-6">
        {/* Top row: Summary and Month Picker */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">Summary</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-foreground hover:bg-transparent p-0"
              >
                {selectedMonth}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {months.map((month) => (
                <DropdownMenuItem
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className="cursor-pointer"
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Financial amounts in single column */}
        <div className="space-y-4">
          {/* Net Total */}
          <div className="flex flex-col">
            <div className="text-sm font-medium mb-2 text-muted-foreground">
              Net Total
            </div>
            <div className="text-2xl font-bold text-foreground">
              {netTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                €
              </span>
            </div>
          </div>

          {/* Income */}
          <div className="flex flex-col">
            <div className="text-sm font-medium mb-2 text-green-600">
              Income
            </div>
            <div className="text-2xl font-bold text-foreground">
              {income.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                €
              </span>
            </div>
          </div>

          {/* Expenses */}
          <div className="flex flex-col">
            <div className="text-sm font-medium mb-2 text-red-600">
              Expenses
            </div>
            <div className="text-2xl font-bold text-foreground">
              {expenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="border-b border-border" />
    </div>
  );
}
