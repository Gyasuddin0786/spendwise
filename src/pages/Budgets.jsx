
import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  PiggyBank,
  Target,
} from "lucide-react";

import { useFinance } from "../context/FinanceContext";

import {
  money,
  getMonthKey,
  getBudgetAnalysis,
  getOverallBudgetSummary,
  formatAmountInput,
} from "../utils/finance";

import { expenseCategories } from "../data/initialData";

function Budgets() {
  const {
    transactions,
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    settings,
  } = useFinance();

  const currency = settings?.currency || "INR";
  const isDark = settings?.theme === "dark";

  const currentMonth = getMonthKey();

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card");

  const [form, setForm] = useState({
    category: "",
    amount: "",
  });

  const [error, setError] = useState("");

  const budgetAnalysis = useMemo(
    () =>
      getBudgetAnalysis(
        transactions,
        budgets,
        currentMonth
      ),
    [transactions, budgets, currentMonth]
  );

  const overall = useMemo(
    () =>
      getOverallBudgetSummary(
        transactions,
        budgets,
        currentMonth
      ),
    [transactions, budgets, currentMonth]
  );

  const openAddModal = () => {
    setEditingBudget(null);
    setForm({
      category: "",
      amount: "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      amount: String(budget.amount),
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(String(form.amount).replace(/,/g, ""));

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid budget amount.");
      return;
    }

    const duplicate = budgets.some(
      (budget) =>
        budget.category === form.category &&
        budget.id !== editingBudget?.id
    );

    if (duplicate) {
      setError(
        "A budget for this category already exists."
      );
      return;
    }

    const budgetData = {
      category: form.category,
      amount,
    };

    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData);
    } else {
      addBudget(budgetData);
    }

    closeModal();
  };

  const handleDelete = (budget) => {
    const confirmed = window.confirm(
      `Delete the ${budget.category} budget?`
    );

    if (confirmed) {
      deleteBudget(budget.id);
    }
  };

  const availableCategories = expenseCategories.filter(
    (category) =>
      !budgets.some(
        (budget) =>
          budget.category === category.name &&
          budget.id !== editingBudget?.id
      )
  );

  const filteredBudgets = useMemo(() => {
    const nextItems = [...budgetAnalysis];

    return nextItems.filter((budget) => {
      if (filter === "all") return true;
      if (filter === "warning") return budget.isWarning;
      if (filter === "exceeded") return budget.isExceeded;
      return !budget.isExceeded && !budget.isWarning;
    });
  }, [budgetAnalysis, filter]);

  const pageSize = 6;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBudgets.length / pageSize)
  );

  const paginatedBudgets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBudgets.slice(start, start + pageSize);
  }, [filteredBudgets, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, budgets.length]);

  const getProgressColor = (budget) => {
    if (budget.isExceeded) return "bg-red-500";
    if (budget.isWarning) return "bg-amber-500";
    return "bg-violet-500";
  };

  const getStatus = (budget) => {
    if (budget.isExceeded) {
      return {
        text: "Budget exceeded",
        className: isDark
          ? "bg-red-500/10 text-red-300"
          : "bg-red-50 text-red-600",
        icon: AlertTriangle,
      };
    }

    if (budget.isWarning) {
      return {
        text: "Almost reached",
        className: isDark
          ? "bg-amber-500/10 text-amber-300"
          : "bg-amber-50 text-amber-600",
        icon: AlertTriangle,
      };
    }

    return {
      text: "On track",
      className: isDark
        ? "bg-emerald-500/10 text-emerald-300"
        : "bg-green-50 text-green-600",
      icon: CheckCircle2,
    };
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
            Manage your spending limits
          </p>

          <h1 className={isDark ? "text-2xl font-bold text-white sm:text-3xl" : "text-2xl font-bold text-[#17152A] sm:text-3xl"}>
            Budgets
          </h1>

          <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-gray-500"}>
            Set monthly limits and stay in control of your money.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Create Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Budget"
          value={money(overall.totalBudget, currency)}
          icon={Wallet}
          color="violet"
          isDark={isDark}
        />

        <SummaryCard
          title="Total Spent"
          value={money(overall.totalSpent, currency)}
          icon={TrendingUp}
          color="red"
          isDark={isDark}
        />

        <SummaryCard
          title="Remaining Budget"
          value={money(overall.remaining, currency)}
          icon={PiggyBank}
          color="green"
          isDark={isDark}
        />

        <SummaryCard
          title="Budget Usage"
          value={`${overall.percentage.toFixed(1)}%`}
          icon={Target}
          color="orange"
          isDark={isDark}
        />
      </div>

      {/* Overall Progress */}
      <section
        className={
          isDark
            ? "mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/30 sm:p-6"
            : "mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        }
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
              Overall Budget Progress
            </h2>

            <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
              Your total tracked spending against your budget
            </p>
          </div>

          <span
            className={
              isDark
                ? "rounded-lg bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-300"
                : "rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
            }
          >
            {overall.percentage.toFixed(1)}% Used
          </span>
        </div>

        <div className={isDark ? "h-3 overflow-hidden rounded-full bg-slate-800" : "h-3 overflow-hidden rounded-full bg-slate-100"}>
          <div
            className={`h-full rounded-full transition-all ${
              overall.isExceeded
                ? "bg-red-500"
                : overall.percentage >= 80
                  ? "bg-amber-500"
                  : "bg-violet-500"
            }`}
            style={{
              width: `${Math.min(overall.percentage, 100)}%`,
            }}
          />
        </div>

        <div className={isDark ? "mt-3 flex flex-wrap justify-between gap-2 text-sm text-slate-400" : "mt-3 flex flex-wrap justify-between gap-2 text-sm text-slate-500"}>
          <span>
            Spent: {money(overall.totalSpent, currency)}
          </span>

          <span>
            Budget: {money(overall.totalBudget, currency)}
          </span>
        </div>

        {overall.isExceeded && (
          <div className={isDark ? "mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-300" : "mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600"}>
            <AlertTriangle size={18} />
            Your tracked spending has exceeded your total budget.
          </div>
        )}
      </section>

      {/* Budget List */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
            Category Budgets
          </h2>

          <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
            Monitor your spending category by category.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All" },
            { key: "on-track", label: "On Track" },
            { key: "warning", label: "Warning" },
            { key: "exceeded", label: "Exceeded" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={
                filter === option.key
                  ? "rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                  : isDark
                    ? "rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBudgets.length > 0 ? (
        <div className="space-y-5">
          <div className="mb-4 flex items-center justify-end">
            <div className={isDark ? "inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1" : "inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"}>
              {[
                { key: "card", label: "Card View" },
                { key: "list", label: "List View" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setViewMode(option.key)}
                  className={
                    viewMode === option.key
                      ? "rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm"
                      : isDark
                        ? "rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                        : "rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "card" ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {paginatedBudgets.map((budget) => {
                const status = getStatus(budget);
                const StatusIcon = status.icon;

                const categoryInfo = expenseCategories.find(
                  (category) =>
                    category.name === budget.category
                );

                const CategoryIcon = categoryInfo?.icon || Wallet;

                return (
                  <article
                    key={budget.id || budget.category}
                    className={
                      isDark
                        ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-slate-700"
                        : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    }
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-xl p-3"
                          style={{
                            backgroundColor:
                              categoryInfo?.color
                                ? `${categoryInfo.color}15`
                                : isDark
                                  ? "rgba(139, 92, 246, 0.12)"
                                  : "#F3F0FF",
                            color:
                              categoryInfo?.color || "#8B5CF6",
                          }}
                        >
                          <CategoryIcon size={21} />
                        </div>

                        <div>
                          <h3 className={isDark ? "font-bold text-white" : "font-bold text-slate-800"}>
                            {budget.category}
                          </h3>

                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${status.className}`}
                          >
                            <StatusIcon size={12} />
                            {status.text}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(budget)}
                          title="Edit budget"
                          className={
                            isDark
                              ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-violet-300"
                              : "rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(budget)}
                          title="Delete budget"
                          className={
                            isDark
                              ? "rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                              : "rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-2 flex items-end justify-between gap-2">
                      <div>
                        <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-400"}>
                          Amount Spent
                        </p>

                        <p className={isDark ? "mt-1 text-xl font-bold text-white" : "mt-1 text-xl font-bold text-slate-900"}>
                          {money(budget.spent, currency)}
                        </p>
                      </div>

                      <p className={isDark ? "text-sm font-semibold text-slate-300" : "text-sm font-semibold text-slate-500"}>
                        {budget.percentage.toFixed(1)}%
                      </p>
                    </div>

                    <div className={isDark ? "h-2.5 overflow-hidden rounded-full bg-slate-800" : "h-2.5 overflow-hidden rounded-full bg-slate-100"}>
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(budget)}`}
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                        }}
                      />
                    </div>

                    <div className={isDark ? "mt-3 flex justify-between gap-3 text-xs text-slate-400" : "mt-3 flex justify-between gap-3 text-xs text-slate-400"}>
                      <span>
                        Remaining: {money(budget.remaining, currency)}
                      </span>

                      <span>
                        Limit: {money(budget.amount, currency)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedBudgets.map((budget) => {
                const status = getStatus(budget);
                const StatusIcon = status.icon;

                const categoryInfo = expenseCategories.find(
                  (category) => category.name === budget.category
                );

                const CategoryIcon = categoryInfo?.icon || Wallet;

                return (
                  <article
                    key={budget.id || budget.category}
                    className={
                      isDark
                        ? "flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        : "flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    }
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor:
                            categoryInfo?.color
                              ? `${categoryInfo.color}15`
                              : isDark
                                ? "rgba(139, 92, 246, 0.12)"
                                : "#F3F0FF",
                          color: categoryInfo?.color || "#8B5CF6",
                        }}
                      >
                        <CategoryIcon size={22} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={isDark ? "truncate text-base font-bold text-white" : "truncate text-base font-bold text-slate-800"}>
                            {budget.category}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${status.className}`}
                          >
                            <StatusIcon size={12} />
                            {status.text}
                          </span>
                        </div>

                        <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
                          {money(budget.spent, currency)} spent · limit {money(budget.amount, currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-md">
                      <div className="flex-1">
                        <div className={isDark ? "mb-2 flex items-center justify-between text-xs text-slate-400" : "mb-2 flex items-center justify-between text-xs text-slate-500"}>
                          <span>{budget.percentage.toFixed(1)}% used</span>
                          <span>{money(budget.remaining, currency)} left</span>
                        </div>

                        <div className={isDark ? "h-2.5 overflow-hidden rounded-full bg-slate-800" : "h-2.5 overflow-hidden rounded-full bg-slate-100"}>
                          <div
                            className={`h-full rounded-full transition-all ${getProgressColor(budget)}`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openEditModal(budget)}
                          title="Edit budget"
                          className={
                            isDark
                              ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-violet-300"
                              : "rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(budget)}
                          title="Delete budget"
                          className={
                            isDark
                              ? "rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
                              : "rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? "rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                    : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
                }
              >
                Previous
              </button>

              <span className={isDark ? "text-sm font-medium text-slate-300" : "text-sm font-medium text-slate-600"}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                    : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={isDark ? "rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-5 py-16 text-center" : "rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center"}>
          <div className={isDark ? "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300" : "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500"}>
            <PiggyBank size={32} />
          </div>

          <h3 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-800"}>
            No budgets yet
          </h3>

          <p className={isDark ? "mx-auto mt-2 max-w-sm text-sm text-slate-400" : "mx-auto mt-2 max-w-sm text-sm text-slate-500"}>
            Create your first category budget to start monitoring
            your monthly expenses.
          </p>

          <button
            onClick={openAddModal}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Create Your First Budget
          </button>
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className={
              isDark
                ? "w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/50"
                : "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            }
          >

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-[#17152A]"}>
                  {editingBudget ? "Edit Budget" : "Create Budget"}
                </h2>

                <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-gray-500"}>
                  Set your monthly spending limit.
                </p>
              </div>

              <button
                onClick={closeModal}
                className={
                  isDark
                    ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800"
                    : "rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                }
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={isDark ? "mb-2 block text-sm font-semibold text-slate-200" : "mb-2 block text-sm font-semibold text-gray-700"}>
                  Expense Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className={
                    isDark
                      ? "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      : "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  }
                  required
                >
                  <option value="">Select category</option>

                  {editingBudget && (
                    <option value={editingBudget.category}>
                      {editingBudget.category}
                    </option>
                  )}

                  {availableCategories.map((category) => (
                    <option
                      key={category.id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={isDark ? "mb-2 block text-sm font-semibold text-slate-200" : "mb-2 block text-sm font-semibold text-gray-700"}>
                  Monthly Budget Amount
                </label>

                <input
                  type="text"
                  inputMode="decimal"
                  value={formatAmountInput(form.amount)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: formatAmountInput(e.target.value),
                    })
                  }
                  placeholder="Enter amount"
                  className={
                    isDark
                      ? "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      : "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  }
                  required
                />
              </div>

              {error && (
                <p className={isDark ? "rounded-lg bg-red-500/10 p-3 text-sm text-red-300" : "rounded-lg bg-red-50 p-3 text-sm text-red-600"}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={
                    isDark
                      ? "flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                      : "flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  {editingBudget ? "Update Budget" : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color, isDark = false }) {
  const colors = {
    violet: isDark ? "bg-violet-500/10 text-violet-300" : "bg-violet-50 text-violet-600",
    red: isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-500",
    green: isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-green-50 text-green-600",
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
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
            {title}
          </p>

          <h3 className={isDark ? "mt-1 truncate text-xl font-bold text-white" : "mt-1 truncate text-xl font-bold text-slate-900"}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default Budgets;
