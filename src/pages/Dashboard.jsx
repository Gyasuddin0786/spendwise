
import { useMemo } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  CalendarDays,
  ChevronRight,
  TrendingUp,
  ReceiptText,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useFinance } from "../context/FinanceContext";
import StatCard from "../components/StatCard";

import {
  summarize,
  getMonthlyTransactions,
  getMonthlyChartData,
  categoryTotals,
  getBudgetAnalysis,
  money,
  getMonthKey,
  formatDate,
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

function Dashboard({
  onAdd,
  setPage,
  theme = "light",
}) {
  const {
    transactions,
    budgets,
    settings,
  } = useFinance();

  const currency = settings?.currency || "INR";
  const isDark = theme === "dark";

  const currentMonth = getMonthKey();

  const monthlyTransactions = useMemo(
    () => getMonthlyTransactions(transactions, currentMonth),
    [transactions, currentMonth]
  );

  const summary = useMemo(
    () => summarize(monthlyTransactions),
    [monthlyTransactions]
  );

  const chartData = useMemo(() => {
    const allMonths = getMonthlyChartData(
      transactions,
      new Date().getFullYear()
    );

    return allMonths.slice(-6);
  }, [transactions]);

  const spendingData = useMemo(
    () => categoryTotals(monthlyTransactions, "expense"),
    [monthlyTransactions]
  );

  const budgetData = useMemo(
    () => getBudgetAnalysis(transactions, budgets, currentMonth),
    [transactions, budgets, currentMonth]
  );

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => {
          const dateDifference =
            new Date(b.date) - new Date(a.date);

          if (dateDifference !== 0) {
            return dateDifference;
          }

          return new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0);
        })
        .slice(0, 5),
    [transactions]
  );

  const totalSpending = spendingData.reduce(
    (total, item) => total + item.total,
    0
  );

  const currentDate = new Date().toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const handleNavigate = (page) => {
    if (setPage) {
      setPage(page);
    }
  };

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8"
          : "min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6 lg:p-8"
      }
    >
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className={isDark ? "mb-2 text-sm font-medium text-slate-400" : "mb-2 text-sm font-medium text-slate-500"}>
            {currentDate}
          </p>

          <h1
            className={
              isDark
                ? "text-2xl font-bold tracking-tight text-white sm:text-3xl"
                : "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            }
          >
            Financial Overview
          </h1>

          <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-slate-500"}>
            Here's what's happening with your money.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          type="income"
          value={summary.income}
          theme={theme}
          currency={currency}
        />

        <StatCard
          type="expense"
          value={summary.expenses}
          theme={theme}
          currency={currency}
        />

        <StatCard
          type="balance"
          value={summary.balance}
          theme={theme}
          currency={currency}
        />

        <StatCard
          type="savings"
          value={summary.savingsRate}
          theme={theme}
          currency={currency}
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Cash Flow Chart */}
        <section
          className={
            isDark
              ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 xl:col-span-2 sm:p-6"
              : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6"
          }
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
                Cash Flow
              </h2>

              <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
                Your income and expenses over time
              </p>
            </div>

            <span
              className={
                isDark
                  ? "rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300"
                  : "rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
              }
            >
              Last 6 months
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="incomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#8B5CF6"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="#8B5CF6"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="expenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#F87171"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="#F87171"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "#334155" : "#E2E8F0"}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 11 }}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `${(value / 1000).toFixed(0)}k`
                      : value
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    money(value, currency),
                    undefined,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                    color: isDark ? "#E2E8F0" : "#0F172A",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="url(#incomeGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#F87171"
                  strokeWidth={3}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-6">
            <div className={isDark ? "flex items-center gap-2 text-xs text-slate-400" : "flex items-center gap-2 text-xs text-slate-500"}>
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Income
            </div>

            <div className={isDark ? "flex items-center gap-2 text-xs text-slate-400" : "flex items-center gap-2 text-xs text-slate-500"}>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Expenses
            </div>
          </div>
        </section>

        <section
          className={
            isDark
              ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 sm:p-6"
              : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          }
        >
          <div className="mb-4">
            <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
              Spending Breakdown
            </h2>

            <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
              Where your money goes
            </p>
          </div>

          {spendingData.length > 0 ? (
            <>
              <div className="relative h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
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
                      contentStyle={{
                        borderRadius: "12px",
                        border: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
                        backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                        color: isDark ? "#E2E8F0" : "#0F172A",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                    Total Spent
                  </span>

                  <span className={isDark ? "mt-1 text-lg font-bold text-white" : "mt-1 text-lg font-bold text-slate-900"}>
                    {money(totalSpending, currency)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {spendingData.slice(0, 5).map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[index % COLORS.length],
                        }}
                      />

                      <span className={isDark ? "truncate text-sm text-slate-300" : "truncate text-sm text-slate-600"}>
                        {item.category}
                      </span>
                    </div>

                    <span className={isDark ? "shrink-0 text-sm font-semibold text-slate-100" : "shrink-0 text-sm font-semibold text-slate-800"}>
                      {money(item.total, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center">
              <ReceiptText
                size={35}
                className={isDark ? "mb-3 text-slate-500" : "mb-3 text-slate-300"}
              />

              <p className={isDark ? "font-semibold text-slate-200" : "font-semibold text-slate-700"}>
                No spending data yet
              </p>

              <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-400"}>
                Add an expense to see your breakdown.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Recent Transactions + Budgets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Recent Transactions */}
        <section
          className={
            isDark
              ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 xl:col-span-2 sm:p-6"
              : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6"
          }
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
                Recent Transactions
              </h2>

              <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
                Your latest financial activities
              </p>
            </div>

            <button
              onClick={() => handleNavigate("transactions")}
              className={
                isDark
                  ? "flex items-center gap-1 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                  : "flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              }
            >
              View All
              <ChevronRight size={16} />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {recentTransactions.map((transaction) => {
                const isIncome =
                  transaction.type === "income";

                return (
                  <div
                    key={transaction.id}
                    className={
                      isDark
                        ? "flex items-center justify-between gap-3 rounded-xl px-2 py-4 transition hover:bg-slate-800 sm:px-3"
                        : "flex items-center justify-between gap-3 rounded-xl px-2 py-4 transition hover:bg-slate-50 sm:px-3"
                    }
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={21} />
                        ) : (
                          <ArrowUpRight size={21} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className={isDark ? "truncate text-sm font-semibold text-slate-100" : "truncate text-sm font-semibold text-slate-800"}>
                          {transaction.title}
                        </p>

                        <p className={isDark ? "mt-1 truncate text-xs text-slate-400" : "mt-1 truncate text-xs text-slate-500"}>
                          {transaction.category} ·{" "}
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-sm font-bold ${
                        isIncome ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {money(transaction.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet size={36} className={isDark ? "mb-3 text-slate-500" : "mb-3 text-slate-300"} />

              <p className={isDark ? "font-semibold text-slate-200" : "font-semibold text-slate-700"}>
                No transactions yet
              </p>

              <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-400"}>
                Start by adding your first transaction.
              </p>

              <button
                onClick={onAdd}
                className={
                  isDark
                    ? "mt-4 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20"
                    : "mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                }
              >
                Add Transaction
              </button>
            </div>
          )}
        </section>

        <section
          className={
            isDark
              ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 sm:p-6"
              : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          }
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
                Budget Overview
              </h2>

              <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
                Monthly spending limits
              </p>
            </div>

            <button
              onClick={() => handleNavigate("budgets")}
              className={
                isDark
                  ? "rounded-lg bg-indigo-500/10 p-2 text-indigo-300 hover:bg-indigo-500/20"
                  : "rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {budgetData.length > 0 ? (
            <div className="space-y-6">
              {budgetData.slice(0, 5).map((budget) => {
                const percentage = Math.min(
                  budget.percentage,
                  100
                );

                const barColor = budget.isExceeded
                  ? "bg-red-500"
                  : budget.isWarning
                    ? "bg-amber-500"
                    : "bg-violet-500";

                return (
                  <div key={budget.id || budget.category}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={isDark ? "truncate text-sm font-medium text-slate-200" : "truncate text-sm font-medium text-slate-700"}>
                        {budget.category}
                      </span>

                      <span className={isDark ? "shrink-0 text-xs font-semibold text-slate-400" : "shrink-0 text-xs font-semibold text-slate-500"}>
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className={isDark ? "h-2 overflow-hidden rounded-full bg-slate-800" : "h-2 overflow-hidden rounded-full bg-slate-100"}>
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className={isDark ? "mt-2 flex justify-between text-xs text-slate-400" : "mt-2 flex justify-between text-xs text-slate-400"}>
                      <span>
                        {money(budget.spent, currency)} spent
                      </span>

                      <span>
                        {money(budget.amount, currency)} limit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <PiggyBank
                size={36}
                className={isDark ? "mb-3 text-slate-500" : "mb-3 text-slate-300"}
              />

              <p className={isDark ? "font-semibold text-slate-200" : "font-semibold text-slate-700"}>
                No budgets created
              </p>

              <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-400"}>
                Create a budget to track spending limits.
              </p>

              <button
                onClick={() => handleNavigate("budgets")}
                className={
                  isDark
                    ? "mt-4 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20"
                    : "mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                }
              >
                Create Budget
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
