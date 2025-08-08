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

export interface DayData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

interface TransactionCalendarProps {
  onDaySelected: (dateStr: string, dayData: DayData | null) => void;
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

const formatDateForKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const processTransactions = (
  transactions: Transaction[]
): { [key: string]: DayData } => {
  const grouped: { [key: string]: DayData } = {};

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    const dateStr = formatDateForKey(
      new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate()
      )
    );

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

    if (transaction.type === "income") {
      grouped[dateStr].income += transaction.amount;
    } else {
      grouped[dateStr].expense += transaction.amount;
    }

    grouped[dateStr].balance =
      grouped[dateStr].income - grouped[dateStr].expense;
  });

  return grouped;
};

const CalendarCell = ({
  dayNumber,
  data,
}: {
  dayNumber: string;
  data?: DayData;
}) => (
  <div className="fc-daygrid-day-frame">
    <div className="fc-daygrid-day-top">
      <div className="fc-daygrid-day-number">{dayNumber}</div>
    </div>
    {data && (
      <div className="fc-daygrid-day-events">
        <div className="transaction-summary p-1 text-xs space-y-1">
          {data.income > 0 && (
            <div className="text-green-600 font-medium lg:text-sm">
              ₦{data.income.toLocaleString()}
            </div>
          )}
          {data.expense > 0 && (
            <div className="text-red-600 font-medium lg:text-sm">
              ₦{data.expense.toLocaleString()}
            </div>
          )}
          <div
            className={`font-bold lg:text-sm ${
              data.balance > 0
                ? "text-green-600"
                : data.balance < 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            ₦{Math.abs(data.balance).toLocaleString()}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function TransactionCalendar({
  onDaySelected,
  onAddTransaction,
  onEditTransaction,
}: TransactionCalendarProps) {
  const [dayData, setDayData] = useState<{ [key: string]: DayData }>({});
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
    <Card className="h-full flex flex-col mb-8 border-0 shadow-none">
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
              dayCellClassNames={(info) => {
                const dateStr = formatDateForKey(new Date(info.date));
                return dayData[dateStr] ? "has-transactions" : "";
              }}
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

      {/* Custom CSS for calendar styling */}
      <style jsx global>{`
        .fc-daygrid-day-frame {
          min-height: 80px;
          position: relative;
        }
        .fc-daygrid-day-top {
          display: flex;
          justify-content: flex-start;
        }
        .fc-daygrid-day-number {
          padding: 4px;
          font-weight: bold;
        }
        .fc-daygrid-day-events {
          position: absolute;
          top: 25px;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        .transaction-summary {
          font-size: 10px;
          line-height: 1.2;
        }
        .has-transactions {
          background-color: #f8f9fa;
        }
        .fc-daygrid-day:hover {
          background-color: #e9ecef;
          cursor: pointer;
        }
        /* Dark mode fixes */
        .dark .fc-daygrid-day-number {
          color: hsl(var(--foreground));
        }
        .dark .fc-col-header-cell {
          color: hsl(var(--foreground));
        }
        .dark .fc-daygrid-day {
          border-color: hsl(var(--border));
        }
        .dark .fc-scrollgrid {
          border-color: hsl(var(--border));
        }
        .dark .has-transactions {
          background-color: hsl(var(--muted));
        }
        .dark .fc-daygrid-day:hover {
          background-color: hsl(var(--muted));
        }
        /* Day header styling */
        .fc-col-header-cell {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }
        .dark .fc-col-header-cell {
          background-color: hsl(var(--muted));
        }
      `}</style>
    </Card>
  );
}
