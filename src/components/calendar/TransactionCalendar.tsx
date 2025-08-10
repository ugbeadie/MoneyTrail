"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Transaction } from "@/types/transaction";
import { getTransactionsByMonth } from "@/lib/actions";
import { useMonth } from "@/contexts/MonthContext";
import { months } from "@/lib/constants";
import { CalendarCell } from "./CalendarCell";

export interface DayData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

interface TransactionCalendarProps {
  onDaySelected: (dateStr: string, dayData: DayData | null) => void;
}

const formatDateForKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const processTransactions = (
  transactions: Transaction[]
): Record<string, DayData> => {
  const grouped: Record<string, DayData> = {};

  transactions.forEach((transaction) => {
    const dateStr = formatDateForKey(new Date(transaction.date));

    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        date: dateStr,
        income: 0,
        expense: 0,
        balance: 0,
        transactions: [],
      };
    }

    grouped[dateStr].transactions.push(transaction);
    transaction.type === "income"
      ? (grouped[dateStr].income += transaction.amount)
      : (grouped[dateStr].expense += transaction.amount);

    grouped[dateStr].balance =
      grouped[dateStr].income - grouped[dateStr].expense;
  });

  return grouped;
};
export default function TransactionCalendar({
  onDaySelected,
}: TransactionCalendarProps) {
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedMonthIndex, setSelectedMonth, selectedMonth } = useMonth();

  const fetchCalendarData = async (month: number, year: number) => {
    try {
      setLoading(true);
      const transactions = await getTransactionsByMonth(month, year);
      setDayData(processTransactions(transactions));
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedMonth(months[today.getMonth()]);
    setCurrentYear(today.getFullYear());
  };

  const handleDayClick = (info: any) => {
    const dateStr = formatDateForKey(new Date(info.date));
    onDaySelected(dateStr, dayData[dateStr] || null);
  };

  useEffect(() => {
    fetchCalendarData(selectedMonthIndex, currentYear);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      Promise.resolve().then(() => {
        calendarApi.gotoDate(new Date(currentYear, selectedMonthIndex, 1));
      });
    }
  }, [selectedMonthIndex, currentYear]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      calendarRef.current?.getApi().updateSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Card className="h-full flex flex-col mb-8 border-0 shadow-none bg-transparent">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="max-w-28 md:w-28 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="max-w-22 cursor-pointer"
              onClick={handleTodayClick}
            >
              Today
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-0">
        <div ref={containerRef} className="w-full h-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={new Date(currentYear, selectedMonthIndex, 1)}
              dateClick={handleDayClick}
              height="auto"
              headerToolbar={false}
              dayMaxEvents={false}
              moreLinkClick="popover"
              dayHeaderFormat={{ weekday: "short" }}
              dayCellClassNames={(info) =>
                dayData[formatDateForKey(new Date(info.date))]
                  ? "has-transactions"
                  : ""
              }
              dayCellContent={(info) => {
                const dateStr = formatDateForKey(new Date(info.date));
                return (
                  <CalendarCell
                    dayNumber={info.dayNumberText}
                    data={dayData[dateStr]}
                  />
                );
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
