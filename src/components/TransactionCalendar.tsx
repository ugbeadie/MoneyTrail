"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  onAddTransaction: () => void; // Callback for the floating plus button
  onEditTransaction: (transaction: Transaction) => void; // Callback for editing from panel
}

// Helper function to format date consistently for keys (local date)
const formatDateForKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TransactionCalendar({
  onDaySelected,
  onAddTransaction,
  onEditTransaction,
}: TransactionCalendarProps) {
  const [dayData, setDayData] = useState<{ [key: string]: DayData }>({});
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the calendar container
  const { selectedMonthIndex, setSelectedMonth, selectedMonth } = useMonth();

  // Fetch transactions and calculate day data
  const fetchCalendarData = async (month: number, year: number) => {
    try {
      setLoading(true);
      const transactions = await getTransactionsByMonth(month, year);

      const grouped: { [key: string]: DayData } = {};

      transactions.forEach((transaction) => {
        // Ensure transaction date is treated as local for grouping
        const transactionDate = new Date(transaction.date); // This is a UTC date object from Prisma
        const localYear = transactionDate.getFullYear();
        const localMonth = transactionDate.getMonth();
        const localDay = transactionDate.getDate();
        const dateStr = formatDateForKey(
          new Date(localYear, localMonth, localDay)
        ); // Create a new Date object for local date

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

      setDayData(grouped);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when month or year changes
  useEffect(() => {
    fetchCalendarData(selectedMonthIndex, currentYear);

    // Update calendar view when month changes
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(new Date(currentYear, selectedMonthIndex, 1));
    }
  }, [selectedMonthIndex, currentYear]);

  // Handle month change from dropdown
  const handleMonthChange = (monthName: string) => {
    setSelectedMonth(monthName);
  };

  // Handle year change
  // const handleYearChange = (year: string) => {
  //   setCurrentYear(Number.parseInt(year));
  // };

  // Handle today button
  const handleTodayClick = () => {
    const today = new Date();
    const todayMonth = months[today.getMonth()];
    const todayYear = today.getFullYear();

    setSelectedMonth(todayMonth);
    setCurrentYear(todayYear);
  };

  // Handle day click - emit event to parent
  const handleDayClick = (info: any) => {
    const clickedDate = new Date(info.date);
    const dateStr = formatDateForKey(clickedDate);
    const data = dayData[dateStr] || null; // Get data for the clicked day
    onDaySelected(dateStr, data);
  };

  // Resize Observer to update calendar size
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Generate year options (current year ± 5 years)
  // const yearOptions = Array.from({ length: 11 }, (_, i) => {
  //   const year = new Date().getFullYear() - 5 + i;
  //   return year.toString();
  // });

  return (
    <Card className="h-full flex flex-col mb-8 border-0 shadow-none">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-end">
          {/* <CardTitle>Transaction Calendar</CardTitle> */}
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
            {/* <Select
              value={currentYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="max-w-22">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
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
          {/* Calendar Container */}
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
              headerToolbar={false} // Remove default header
              dayMaxEvents={false}
              moreLinkClick="popover"
              dayHeaderFormat={{ weekday: "short" }}
              dayCellClassNames={(info) => {
                const cellDate = new Date(info.date);
                const dateStr = formatDateForKey(cellDate);
                const data = dayData[dateStr];
                return data ? "has-transactions" : "";
              }}
              dayCellContent={(info) => {
                const cellDate = new Date(info.date);
                const dateStr = formatDateForKey(cellDate);
                const data = dayData[dateStr];
                const dayNumber = info.dayNumberText;

                return (
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
                          {data.balance !== 0 && (
                            <div
                              className={`font-bold lg:text-sm ${
                                data.balance >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ₦{Math.abs(data.balance).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
