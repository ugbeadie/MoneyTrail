"use client";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

// Helper function to format date consistently for keys (local date)
const formatDateForKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TransactionCalendar = forwardRef<
  { triggerResize: () => void },
  TransactionCalendarProps
>(({ onDaySelected, onAddTransaction, onEditTransaction }, ref) => {
  const [dayData, setDayData] = useState<{ [key: string]: DayData }>({});
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<FullCalendar>(null);
  const { selectedMonthIndex, setSelectedMonth, selectedMonth } = useMonth();

  useImperativeHandle(ref, () => ({
    triggerResize: () => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        // Use the correct FullCalendar API methods
        calendarApi.updateSize();
        // Force a re-render by calling changeView to the same view
        setTimeout(() => {
          calendarApi.changeView("dayGridMonth");
        }, 10);
      }
    },
  }));

  // Fetch transactions and calculate day data
  const fetchCalendarData = async (month: number, year: number) => {
    try {
      setLoading(true);
      const transactions = await getTransactionsByMonth(month, year);
      const grouped: { [key: string]: DayData } = {};

      transactions.forEach((transaction) => {
        // Ensure transaction date is treated as local for grouping
        const transactionDate = new Date(transaction.date);
        const localYear = transactionDate.getFullYear();
        const localMonth = transactionDate.getMonth();
        const localDay = transactionDate.getDate();
        const dateStr = formatDateForKey(
          new Date(localYear, localMonth, localDay)
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
    const data = dayData[dateStr] || null;
    onDaySelected(dateStr, data);
  };

  return (
    <Card className="h-full flex flex-col mb-8 border-0 shadow-none">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-end">
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
            aspectRatio={1.35}
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
                          <div className="font-bold text-black-600 lg:text-sm">
                            ₦{data.balance.toLocaleString()}
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
        /* Day header styling and dark mode fixes for header */
        /* Reset FC's default white header background */
        .fc-theme-standard th,
        .fc-theme-standard .fc-scrollgrid {
          background-color: transparent;
        }

        /* Header cell background + text */
        .fc .fc-col-header-cell {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }

        /* The actual weekday label lives in the "cushion" element */
        .fc .fc-col-header-cell-cushion {
          color: hsl(var(--foreground));
          font-weight: 600;
          text-decoration: none; /* remove possible link styling */
        }

        /* Dark mode: ensure background + text are set with high specificity */
        .dark .fc .fc-col-header-cell {
          background-color: hsl(var(--muted)) !important;
        }
        .dark .fc .fc-col-header-cell-cushion {
          color: hsl(var(--foreground)) !important;
        }
        .dark .fc-theme-standard th {
          background-color: transparent !important;
        }

        /* Keep your existing border and other dark mode styles */

        /* Force calendar to be responsive */
        .fc {
          width: 100% !important;
        }
        .fc-view-harness {
          width: 100% !important;
        }
        .fc-scrollgrid {
          width: 100% !important;
        }
      `}</style>
    </Card>
  );
});

export default TransactionCalendar;
