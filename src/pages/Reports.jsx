
import { useMemo, useState } from "react";

import {
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ChartNoAxesCombined,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { useFinance } from "../context/FinanceContext";

import {
  money,
  summarize,
  getMonthlyTransactions,
  getMonthlyChartData,
  categoryTotals,
  getTopCategory,
} from "../utils/finance";

const COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#F43F5E",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
];

function Reports() {
  const { transactions, settings } = useFinance();

  const currency = settings?.currency || "INR";
  const isDark = settings?.theme === "dark";

  const today = new Date();

  const [period, setPeriod] = useState("monthly");

  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`
  );

  const [selectedYear, setSelectedYear] = useState(
    String(today.getFullYear())
  );

  const availableYears = useMemo(() => {
    const years = transactions
      .map((item) => new Date(item.date).getFullYear())
      .filter(Number.isFinite);

    years.push(today.getFullYear());

    return [...new Set(years)].sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const date = new Date(`${transaction.date}T00:00:00`);

      if (Number.isNaN(date.getTime())) return false;

      if (period === "monthly") {
        return transaction.date.startsWith(selectedMonth);
      }

      return (
        date.getFullYear() === Number(selectedYear)
      );
    });
  }, [
    transactions,
    period,
    selectedMonth,
    selectedYear,
  ]);

  const summary = useMemo(
    () => summarize(filteredTransactions),
    [filteredTransactions]
  );

  const spendingData = useMemo(
    () => categoryTotals(filteredTransactions, "expense"),
    [filteredTransactions]
  );

  const incomeCategories = useMemo(
    () => categoryTotals(filteredTransactions, "income"),
    [filteredTransactions]
  );

  const topCategory = useMemo(
    () => getTopCategory(filteredTransactions, "expense"),
    [filteredTransactions]
  );

  const monthlyChart = useMemo(
    () =>
      getMonthlyChartData(
        transactions,
        Number(selectedYear)
      ),
    [transactions, selectedYear]
  );

  const comparisonData = [
    {
      name: "Income",
      amount: summary.income,
    },
    {
      name: "Expenses",
      amount: summary.expenses,
    },
    {
      name: "Net Savings",
      amount: summary.balance,
    },
  ];

  const periodLabel =
    period === "monthly"
      ? new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        )
      : selectedYear;

  const exportCSV = () => {
    const headers = [
      "Title",
      "Type",
      "Category",
      "Amount",
      "Date",
      "Payment Method",
      "Note",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredTransactions.map((item) => [
      item.title,
      item.type,
      item.category,
      item.amount,
      item.date,
      item.method,
      item.note,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `spendwise-report-${periodLabel.replace(/\s+/g, "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8"
          : "min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6 lg:p-8"
      }
    >

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className={isDark ? "mb-2 text-sm text-slate-400" : "mb-2 text-sm text-gray-500"}>
            Understand your financial performance
          </p>

          <h1 className={isDark ? "text-2xl font-bold text-white sm:text-3xl" : "text-2xl font-bold text-[#17152A] sm:text-3xl"}>
            Reports & Analytics
          </h1>

          <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-gray-500"}>
            Analyze your income, expenses and savings.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredTransactions.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Period Selector */}
      <section
        className={
          isDark
            ? "mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 sm:flex-row sm:items-center"
            : "mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
        }
      >
        <div className="flex items-center gap-3">
          <div
            className={
              isDark
                ? "rounded-xl bg-violet-500/10 p-3 text-violet-300"
                : "rounded-xl bg-violet-50 p-3 text-violet-600"
            }
          >
            <CalendarDays size={21} />
          </div>

          <div>
            <h2 className={isDark ? "font-bold text-white" : "font-bold text-slate-800"}>
              Report Period
            </h2>

            <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
              Showing data for {periodLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={
                isDark
                  ? "appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-violet-400"
                  : "appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-violet-500"
              }
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <CalendarDays size={16} />
            </span>
          </div>

          {period === "monthly" ? (
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={
                  isDark
                    ? "appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-violet-400"
                    : "appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-violet-500"
                }
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <CalendarDays size={16} />
              </span>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={
                  isDark
                    ? "appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-violet-400"
                    : "appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-violet-500"
                }
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <CalendarDays size={16} />
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Income"
          value={money(summary.income, currency)}
          icon={TrendingUp}
          color="green"
          isDark={isDark}
        />

        <SummaryCard
          title="Total Expenses"
          value={money(summary.expenses, currency)}
          icon={TrendingDown}
          color="red"
          isDark={isDark}
        />

        <SummaryCard
          title="Net Savings"
          value={money(summary.balance, currency)}
          icon={Wallet}
          color="violet"
          isDark={isDark}
        />

        <SummaryCard
          title="Savings Rate"
          value={`${summary.savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          color="orange"
          isDark={isDark}
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Income vs Expenses */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#17152A]">
              Income vs Expenses
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Financial comparison for {periodLabel}
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EEEEF4"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />

                <Tooltip
                  formatter={(value) => money(value, currency)}
                />

                <Bar
                  dataKey="amount"
                  radius={[7, 7, 0, 0]}
                  barSize={55}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F87171" />
                  <Cell fill="#8B5CF6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Expense Categories */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#17152A]">
              Expense Categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Category-wise expense distribution
            </p>
          </div>

          {spendingData.length > 0 ? (
            <>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {spendingData.map((item, index) => (
                        <Cell
                          key={item.category}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        money(value, currency)
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyChart message="No expense data for this period." />
          )}
        </section>
      </div>

      {/* Yearly Cash Flow */}
      <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#17152A]">
            Monthly Cash Flow
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Income and expenses throughout {selectedYear}
          </p>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyChart}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#EEEEF4"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
              />

              <Tooltip
                formatter={(value) => money(value, currency)}
              />

              <Legend />

              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                strokeWidth={3}
                fill="#10B981"
                fillOpacity={0.08}
              />

              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#F87171"
                strokeWidth={3}
                fill="#F87171"
                fillOpacity={0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Top Expense Category */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
              <ChartNoAxesCombined size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Top Spending Category
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your highest expense category
              </p>
            </div>
          </div>

          {topCategory ? (
            <div>
              <h3 className="text-2xl font-bold text-[#17152A]">
                {topCategory.category}
              </h3>

              <p className="mt-2 text-lg font-semibold text-orange-500">
                {money(topCategory.total, currency)}
              </p>
            </div>
          ) : (
            <p className="py-5 text-sm text-gray-400">
              No spending data available.
            </p>
          )}
        </section>

        {/* Income Categories */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-bold text-gray-800">
            Income Sources
          </h2>

          {incomeCategories.length > 0 ? (
            <div className="space-y-4">
              {incomeCategories.slice(0, 5).map((item) => {
                const percentage =
                  summary.income > 0
                    ? (item.total / summary.income) * 100
                    : 0;

                return (
                  <div key={item.category}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-700">
                        {item.category}
                      </span>

                      <span className="font-semibold text-gray-800">
                        {money(item.total, currency)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-5 text-sm text-gray-400">
              No income data available.
            </p>
          )}
        </section>
      </div>

      {/* Report Footer */}
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
        <FileSpreadsheet size={15} />
        Reports are generated from your locally stored transactions.
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color, isDark = false }) {
  const styles = {
    green: isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-green-50 text-green-600",
    red: isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-500",
    violet: isDark ? "bg-violet-500/10 text-violet-300" : "bg-violet-50 text-violet-600",
    orange: isDark ? "bg-amber-500/10 text-amber-300" : "bg-orange-50 text-orange-500",
  };

  return (
    <div
      className={
        isDark
          ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>{title}</p>

          <h3 className={isDark ? "mt-1 truncate text-xl font-bold text-white" : "mt-1 truncate text-xl font-bold text-slate-900"}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">
      {message}
    </div>
  );
}

export default Reports;
