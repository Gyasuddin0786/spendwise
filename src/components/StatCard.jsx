
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const cardConfig = {
  income: {
    title: "Total Income",
    icon: ArrowDownLeft,
    color: "green",
    description: "Money received this month",
  },

  expense: {
    title: "Total Expenses",
    icon: ArrowUpRight,
    color: "red",
    description: "Money spent this month",
  },

  balance: {
    title: "Available Balance",
    icon: Wallet,
    color: "purple",
    description: "Your remaining balance",
  },

  savings: {
    title: "Savings Rate",
    icon: PiggyBank,
    color: "orange",
    description: "Percentage of income saved",
  },
};

const colorStyles = {
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-600",
  },

  red: {
    icon: "bg-rose-50 text-rose-600",
    accent: "bg-rose-500",
    badge: "bg-rose-50 text-rose-600",
  },

  purple: {
    icon: "bg-violet-50 text-violet-600",
    accent: "bg-violet-500",
    badge: "bg-violet-50 text-violet-600",
  },

  orange: {
    icon: "bg-orange-50 text-orange-600",
    accent: "bg-orange-500",
    badge: "bg-orange-50 text-orange-600",
  },
};

const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toLocaleString("en-IN")}`;
  }
};

export default function StatCard({
  type = "income",
  value = 0,
  change,
  positive = true,
  period = "vs last month",
  currency = "INR",
  theme = "light",
}) {
  const config = cardConfig[type];

  // Invalid card type protection
  if (!config) {
    console.warn(`Invalid StatCard type: ${type}`);
    return null;
  }

  const styles = colorStyles[config.color];

  if (!styles) {
    console.warn(`Missing color configuration: ${config.color}`);
    return null;
  }

  const Icon = config.icon;
  const TrendIcon = positive ? TrendingUp : TrendingDown;
  const isDark = theme === "dark";

  const displayValue =
    type === "savings"
      ? `${Number(value || 0).toFixed(1)}%`
      : formatCurrency(value, currency);

  return (
    <div
      className={
        isDark
          ? "group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/40 sm:p-6"
          : "group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/40 sm:p-6"
      }
    >
      <div
        className={
          isDark
            ? "absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-800 transition-transform duration-500 group-hover:scale-150"
            : "absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-150"
        }
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className={isDark ? "text-sm font-medium text-slate-400" : "text-sm font-medium text-slate-500"}>
            {config.title}
          </p>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}
          >
            <Icon size={21} strokeWidth={2} />
          </div>
        </div>

        <div className="mt-5">
          <h2
            className={
              isDark
                ? "text-2xl font-bold tracking-tight text-white sm:text-3xl"
                : "text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl"
            }
          >
            {displayValue}
          </h2>

          <p className={isDark ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-400"}>
            {config.description}
          </p>
        </div>

        <div
          className={
            isDark
              ? "mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4"
              : "mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4"
          }
        >
          {change !== undefined ? (
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${styles.badge}`}
            >
              <TrendIcon size={13} />
              {Math.abs(change)}%
            </span>
          ) : (
            <span className={isDark ? "text-xs font-medium text-slate-400" : "text-xs font-medium text-slate-400"}>
              <Icon size={13} className="mr-1 inline" />
              Financial overview
            </span>
          )}

          <span className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-400"}>
            {change !== undefined ? period : "This month"}
          </span>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-0 ${styles.accent} transition-all duration-300 group-hover:w-full`}
      />
    </div>
  );
}
