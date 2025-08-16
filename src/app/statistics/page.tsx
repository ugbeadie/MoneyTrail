"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getStatsData,
  type StatsData,
  type CategoryStats,
} from "@/lib/actions";
import { months } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";
import { StatsChart } from "@/components/stats/TransactionChart";
import { CategoryList } from "@/components/stats/CategoryList";
import { useStats } from "@/contexts/StatsContext";

const periodOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

export default function StatsPage() {
  const [statsData, setStatsData] = useState<StatsData>({
    totalIncome: 0,
    totalExpenses: 0,
    incomeByCategory: [],
    expensesByCategory: [],
    dateRange: "",
  });
  const [loading, setLoading] = useState(true);

  // Use the global stats context
  const {
    selectedPeriod,
    selectedMonth,
    activeTab,
    setSelectedPeriod,
    setSelectedMonth,
    setActiveTab,
  } = useStats();

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const monthIndex = months.indexOf(selectedMonth);
      const currentYear = new Date().getFullYear();

      const data = await getStatsData(
        selectedPeriod,
        selectedPeriod === "monthly" ? monthIndex : undefined,
        currentYear
      );
      setStatsData(data);
    } catch (error) {
      console.error("Failed to fetch stats data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, [selectedPeriod, selectedMonth]);

  // Use current tab to determine which data to show
  const currentData =
    activeTab === "income"
      ? statsData.incomeByCategory
      : statsData.expensesByCategory;
  const currentTotal =
    activeTab === "income" ? statsData.totalIncome : statsData.totalExpenses;

  return (
    <div className="container mx-auto max-w-6xl px-4">
      <hr className="border-muted" />

      <div className="space-y-6 mt-1">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-2">
          <div>
            {statsData.dateRange && (
              <p className="text-md font-bold text-foreground">
                {statsData.dateRange}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedPeriod}
              onValueChange={(value: "weekly" | "monthly" | "annually") =>
                setSelectedPeriod(value)
              }
            >
              <SelectTrigger className="max-w-28 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPeriod === "monthly" && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="max-w-24 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem
                      key={month}
                      value={month}
                      className="cursor-pointer"
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Income/Expense Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "income" | "expense")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="income"
              className="flex items-center gap-2 cursor-pointer text-green-600"
            >
              Income:
              <span className="text-sm font-bold">
                ₦{statsData.totalIncome.toLocaleString()}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              className="flex items-center gap-2 cursor-pointer text-red-600"
            >
              Expense:
              <span className="text-sm font-bold">
                ₦{statsData.totalExpenses.toLocaleString()}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* One shared StatsContent instead of duplicating */}
          <TabsContent value={activeTab} className="mt-6">
            <StatsContent
              data={currentData}
              total={currentTotal}
              loading={loading}
              type={activeTab}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatsContentProps {
  data: CategoryStats[];
  total: number;
  loading: boolean;
  type: "income" | "expense";
}

function StatsContent({ data, total, loading, type }: StatsContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No {type} data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chart */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          {type === "income" ? (
            <h3 className="text-lg font-semibold capitalize text-green-600">
              {type} by Category
            </h3>
          ) : (
            <h3 className="text-lg font-semibold capitalize text-red-600">
              {type} by Category
            </h3>
          )}
        </CardHeader>
        <CardContent className="px-0 ">
          <StatsChart data={data} type={type} />
        </CardContent>
      </Card>

      {/* Category List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
        </CardHeader>
        <CardContent>
          <CategoryList data={data} type={type} />
        </CardContent>
      </Card>
    </div>
  );
}
