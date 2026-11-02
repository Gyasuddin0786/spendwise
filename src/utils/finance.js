
import { currencies } from "../data/initialData";

// ==========================================
// CURRENCY UTILITIES
// ==========================================

export const formatIndianNumber = (value, maximumFractionDigits = 2) => {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(numericValue);
};

export const formatAmountInput = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).replace(/[^\d.]/g, "");

  if (!stringValue || stringValue === ".") {
    return "";
  }

  const parts = stringValue.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts.length > 1 ? `.${parts.slice(1).join("")}` : "";

  return `${integerPart}${decimalPart}`;
};

export const money = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${formatIndianNumber(amount, 2)}`;
  }
};

// Get currency details
export const getCurrency = (code = "INR") => {
  return currencies.find((item) => item.code === code) || currencies.find((item) => item.code === "INR");
};

// ==========================================
// DATE UTILITIES
// ==========================================

export const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

export const getMonthKey = (date = new Date()) => {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const getYearKey = (date = new Date()) => {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return String(d.getFullYear());
};

export const formatDate = (date) => {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

// ==========================================
// BASIC FINANCIAL CALCULATIONS
// ==========================================

export const summarize = (transactions = []) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((total, t) => total + Number(t.amount || 0), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((total, t) => total + Number(t.amount || 0), 0);

  const balance = income - expenses;

  const savingsRate =
    income > 0 ? (balance / income) * 100 : 0;

  return {
    income,
    expenses,
    balance,
    savingsRate,
    transactionCount: transactions.length,
  };
};

// ==========================================
// FILTER TRANSACTIONS
// ==========================================

export const getMonthlyTransactions = (
  transactions = [],
  month = getMonthKey()
) => {
  return transactions.filter((t) =>
    t.date?.startsWith(month)
  );
};

export const getYearlyTransactions = (
  transactions = [],
  year = getYearKey()
) => {
  return transactions.filter((t) =>
    t.date?.startsWith(String(year))
  );
};

// ==========================================
// MONTHLY SUMMARY
// ==========================================

export const getMonthlySummary = (
  transactions = [],
  month = getMonthKey()
) => {
  const filtered = getMonthlyTransactions(transactions, month);

  return summarize(filtered);
};

// ==========================================
// YEARLY SUMMARY
// ==========================================

export const getYearlySummary = (
  transactions = [],
  year = getYearKey()
) => {
  const filtered = getYearlyTransactions(transactions, year);

  return summarize(filtered);
};

// ==========================================
// CATEGORY-WISE EXPENSES
// ==========================================

export const categoryTotals = (
  transactions = [],
  type = "expense"
) => {
  const totals = {};

  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      const category = t.category || "Other";

      totals[category] =
        (totals[category] || 0) + Number(t.amount || 0);
    });

  return Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      total: value,
    }))
    .sort((a, b) => b.value - a.value);
};

// ==========================================
// MONTHLY BUDGET ANALYSIS
// ==========================================

export const getBudgetAnalysis = (
  transactions = [],
  budgets = [],
  month = getMonthKey()
) => {
  const monthlyExpenses = getMonthlyTransactions(
    transactions,
    month
  ).filter((t) => t.type === "expense");

  return budgets.map((budget) => {
    const limit = Number(
      budget?.limit ?? budget?.amount ?? 0
    );

    const spent = monthlyExpenses
      .filter((t) => t.category === budget.category)
      .reduce((total, t) => total + Number(t.amount || 0), 0);

    const percentage =
      limit > 0 ? (spent / limit) * 100 : 0;

    return {
      ...budget,
      amount: limit,
      limit,
      spent,
      remaining: Math.max(0, limit - spent),
      percentage,
      isExceeded: spent > limit,
      isWarning: percentage >= 80 && spent <= limit,
    };
  });
};

// ==========================================
// OVERALL BUDGET SUMMARY
// ==========================================

export const getOverallBudgetSummary = (
  transactions = [],
  budgets = [],
  month = getMonthKey()
) => {
  const analysis = getBudgetAnalysis(
    transactions,
    budgets,
    month
  );

  const totalBudget = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget?.limit ?? budget?.amount ?? 0),
    0
  );

  const totalSpent = analysis.reduce(
    (sum, b) => sum + b.spent,
    0
  );

  return {
    totalBudget,
    totalSpent,
    remaining: Math.max(0, totalBudget - totalSpent),
    percentage:
      totalBudget > 0
        ? (totalSpent / totalBudget) * 100
        : 0,
    isExceeded: totalSpent > totalBudget,
  };
};

// ==========================================
// MONTHLY CHART DATA
// ==========================================

export const getMonthlyChartData = (
  transactions = [],
  year = new Date().getFullYear()
) => {
  return Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(year, index, 1);

    const month = getMonthKey(monthDate);

    const summary = getMonthlySummary(
      transactions,
      month
    );

    return {
      month: monthDate.toLocaleString("en", {
        month: "short",
      }),
      income: summary.income,
      expenses: summary.expenses,
      balance: summary.balance,
    };
  });
};

// ==========================================
// MONTH TO MONTH COMPARISON
// ==========================================

export const getMonthlyComparison = (
  transactions = [],
  currentMonth = getMonthKey()
) => {
  const currentDate = new Date(`${currentMonth}-01T00:00:00`);

  const previousDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  const previousMonth = getMonthKey(previousDate);

  const current = getMonthlySummary(
    transactions,
    currentMonth
  );

  const previous = getMonthlySummary(
    transactions,
    previousMonth
  );

  const percentageChange = (currentValue, previousValue) => {
    if (previousValue === 0) {
      return currentValue === 0 ? 0 : null;
    }

    return (
      ((currentValue - previousValue) /
        Math.abs(previousValue)) *
      100
    );
  };

  return {
    current,
    previous,
    incomeChange: percentageChange(
      current.income,
      previous.income
    ),
    expenseChange: percentageChange(
      current.expenses,
      previous.expenses
    ),
  };
};

// ==========================================
// TOP SPENDING CATEGORY
// ==========================================

export const getTopCategory = (transactions = []) => {
  const categories = categoryTotals(transactions);

  return categories.length > 0
    ? categories[0]
    : null;
};

// ==========================================
// SAVINGS RATE
// ==========================================

export const getSavingsRate = (transactions = []) => {
  const { income, balance } = summarize(transactions);

  if (income <= 0) return 0;

  return Math.max(0, (balance / income) * 100);
};
