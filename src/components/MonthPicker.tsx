"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { months } from "@/lib/constants";

interface MonthPickerProps {
  selectedMonth: string;
  onSelect: (month: string) => void;
}

export function MonthPicker({ selectedMonth, onSelect }: MonthPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-foreground hover:bg-transparent p-0 cursor-pointer"
        >
          {selectedMonth}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {months.map((month) => (
          <DropdownMenuItem
            key={month}
            onClick={() => onSelect(month)}
            className="cursor-pointer"
          >
            {month}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
