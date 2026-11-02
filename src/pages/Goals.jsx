
import { useMemo, useState } from "react";

import {
  Plus,
  Target,
  PiggyBank,
  TrendingUp,
  Wallet,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { useFinance } from "../context/FinanceContext";

import { money, formatDate, formatAmountInput } from "../utils/finance";

const goalCategories = [
  "Emergency Fund",
  "Technology",
  "Travel",
  "Vehicle",
  "Education",
  "Home",
  "Shopping",
  "Other",
];

function SavingsGoals() {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalContribution,
    settings,
  } = useFinance();

  const currency = settings?.currency || "INR";
  const isDark = settings?.theme === "dark";

  const [showModal, setShowModal] = useState(false);
  const [showContribution, setShowContribution] = useState(false);
  const [viewMode, setViewMode] = useState("card");

  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "Emergency Fund",
    targetAmount: "",
    savedAmount: "0",
    deadline: "",
    description: "",
  });

  const [contribution, setContribution] = useState("");
  const [error, setError] = useState("");

  const totalTarget = goals.reduce(
    (total, goal) =>
      total + Number(goal.targetAmount || 0),
    0
  );

  const totalSaved = goals.reduce(
    (total, goal) =>
      total + Number(goal.savedAmount || 0),
    0
  );

  const totalRemaining = Math.max(
    totalTarget - totalSaved,
    0
  );

  const completedGoals = goals.filter(
    (goal) =>
      Number(goal.savedAmount) >= Number(goal.targetAmount)
  ).length;

  const overallProgress =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0;

  const overallStatus =
    totalTarget === 0
      ? {
          label: "No goals yet",
          className: isDark
            ? "bg-slate-700 text-slate-200"
            : "bg-white/80 text-slate-700",
        }
      : overallProgress >= 75
        ? {
            label: "Nearly there",
            className: isDark
              ? "bg-amber-500/15 text-amber-300"
              : "bg-amber-100 text-amber-700",
          }
        : overallProgress >= 40
          ? {
              label: "On track",
              className: isDark
                ? "bg-sky-500/15 text-sky-300"
                : "bg-sky-100 text-sky-700",
            }
          : {
              label: "Just started",
              className: isDark
                ? "bg-violet-500/15 text-violet-300"
                : "bg-violet-100 text-violet-700",
            };

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const aCompleted =
        Number(a.savedAmount) >= Number(a.targetAmount);

      const bCompleted =
        Number(b.savedAmount) >= Number(b.targetAmount);

      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }

      if (!a.deadline) return 1;
      if (!b.deadline) return -1;

      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [goals]);

  const resetForm = () => {
    setForm({
      title: "",
      category: "Emergency Fund",
      targetAmount: "",
      savedAmount: "0",
      deadline: "",
      description: "",
    });

    setEditingGoal(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);

    setForm({
      title: goal.title,
      category: goal.category,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount || 0),
      deadline: goal.deadline || "",
      description: goal.description || "",
    });

    setError("");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const targetAmount = Number(String(form.targetAmount).replace(/,/g, ""));
    const savedAmount = Number(String(form.savedAmount).replace(/,/g, ""));

    if (!form.title.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      setError("Enter a valid target amount.");
      return;
    }

    if (
      !Number.isFinite(savedAmount) ||
      savedAmount < 0 ||
      savedAmount > targetAmount
    ) {
      setError(
        "Initial savings must be between zero and your target."
      );
      return;
    }

    const goalData = {
      title: form.title.trim(),
      category: form.category,
      targetAmount,
      savedAmount,
      deadline: form.deadline,
      description: form.description.trim(),
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (goal) => {
    const confirmed = window.confirm(
      `Delete "${goal.title}" savings goal?`
    );

    if (confirmed) {
      deleteGoal(goal.id);
    }
  };

  const openContributionModal = (goal) => {
    setSelectedGoal(goal);
    setContribution("");
    setError("");
    setShowContribution(true);
  };

  const handleContribution = (e) => {
    e.preventDefault();

    const amount = Number(String(contribution).replace(/,/g, ""));

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid contribution amount.");
      return;
    }

    if (
      amount >
      Number(selectedGoal.targetAmount) -
        Number(selectedGoal.savedAmount)
    ) {
      setError(
        "Contribution cannot exceed the remaining target."
      );
      return;
    }

    addGoalContribution(selectedGoal.id, amount);

    setShowContribution(false);
    setSelectedGoal(null);
    setContribution("");
    setError("");
  };

  const getProgress = (goal) => {
    const target = Number(goal.targetAmount || 0);
    const saved = Number(goal.savedAmount || 0);

    if (target <= 0) return 0;

    return Math.min((saved / target) * 100, 100);
  };

  const getGoalStatus = (goal) => {
    const progress = getProgress(goal);
    const completed = isCompleted(goal);

    if (completed) {
      return {
        label: "Goal Achieved",
        className: isDark
          ? "bg-emerald-500/10 text-emerald-300"
          : "bg-green-50 text-green-600",
      };
    }

    if (progress >= 75) {
      return {
        label: "Nearly there",
        className: isDark
          ? "bg-amber-500/10 text-amber-300"
          : "bg-amber-50 text-amber-600",
      };
    }

    if (progress >= 40) {
      return {
        label: "On track",
        className: isDark
          ? "bg-sky-500/10 text-sky-300"
          : "bg-sky-50 text-sky-600",
      };
    }

    return {
      label: "Just started",
      className: isDark
        ? "bg-violet-500/10 text-violet-300"
        : "bg-violet-50 text-violet-600",
    };
  };

  const isCompleted = (goal) =>
    Number(goal.savedAmount) >= Number(goal.targetAmount);

  const getDeadlineStatus = (goal) => {
    if (!goal.deadline) return "No deadline";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(
      `${goal.deadline}T00:00:00`
    );

    const difference = Math.ceil(
      (deadline - today) / (1000 * 60 * 60 * 24)
    );

    if (isCompleted(goal)) return "Completed";

    if (difference < 0) return "Deadline passed";

    if (difference === 0) return "Due today";

    return `${difference} days left`;
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
            Plan today, achieve tomorrow
          </p>

          <h1 className={isDark ? "text-2xl font-bold text-white sm:text-3xl" : "text-2xl font-bold text-[#17152A] sm:text-3xl"}>
            Savings Goals
          </h1>

          <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-gray-500"}>
            Set targets and make progress towards your dreams.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Create New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Target"
          value={money(totalTarget, currency)}
          icon={Target}
          color="violet"
          isDark={isDark}
        />

        <SummaryCard
          title="Total Saved"
          value={money(totalSaved, currency)}
          icon={PiggyBank}
          color="green"
          isDark={isDark}
        />

        <SummaryCard
          title="Remaining Amount"
          value={money(totalRemaining, currency)}
          icon={Wallet}
          color="orange"
          isDark={isDark}
        />

        <SummaryCard
          title="Completed Goals"
          value={`${completedGoals} / ${goals.length}`}
          icon={CheckCircle2}
          color="blue"
          isDark={isDark}
        />
      </div>

      {/* Overall Progress */}
      <section
        className={
          isDark
            ? "mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-violet-900 p-6 text-white shadow-lg shadow-slate-950/40 sm:p-8"
            : "mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#30205F] to-violet-600 p-6 text-white shadow-lg sm:p-8"
        }
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className={isDark ? "mb-3 flex items-center gap-2 text-violet-200" : "mb-3 flex items-center gap-2 text-violet-200"}>
              <Sparkles size={18} />
              <span className="text-sm font-medium">
                Your Savings Journey
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${overallStatus.className}`}>
                {overallStatus.label}
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              Keep moving towards your goals!
            </h2>

            <p className="mt-2 text-sm text-violet-200">
              You have saved {money(totalSaved, currency)} so far.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-4xl font-bold">
              {overallProgress.toFixed(1)}%
            </p>

            <p className="mt-1 text-sm text-violet-200">
              Overall progress
            </p>
          </div>
        </div>

        <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{
              width: `${overallProgress}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-violet-200">
          <span>Saved: {money(totalSaved, currency)}</span>

          <span>Target: {money(totalTarget, currency)}</span>
        </div>
      </section>

      {/* Goals Grid */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={isDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-900"}>
            Your Goals
          </h2>

          <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
            Track each savings target individually.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <span className={isDark ? "rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 shadow-sm" : "rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm"}>
            {goals.length} Goals
          </span>
        </div>
      </div>

      {sortedGoals.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {sortedGoals.map((goal) => {
              const progress = getProgress(goal);
              const completed = isCompleted(goal);
              const remaining = Math.max(
                Number(goal.targetAmount) -
                  Number(goal.savedAmount),
                0
              );
              const status = getGoalStatus(goal);

              return (
                <article
                  key={goal.id}
                  className={
                    isDark
                      ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-1 hover:border-slate-700"
                      : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  }
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-3 ${
                          completed
                            ? isDark
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-green-50 text-green-600"
                            : isDark
                              ? "bg-violet-500/10 text-violet-300"
                              : "bg-violet-50 text-violet-600"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 size={23} />
                        ) : (
                          <Target size={23} />
                        )}
                      </div>

                      <div>
                        <h3 className={isDark ? "font-bold text-white" : "font-bold text-slate-800"}>
                          {goal.title}
                        </h3>

                        <p className={isDark ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>
                          {goal.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(goal)}
                          title="Edit goal"
                          className={
                            isDark
                              ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-violet-300"
                              : "rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(goal)}
                          title="Delete goal"
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
                  </div>

                  {goal.description && (
                    <p className={isDark ? "mb-4 line-clamp-2 text-sm text-slate-300" : "mb-4 line-clamp-2 text-sm text-slate-500"}>
                      {goal.description}
                    </p>
                  )}

                  <div className="mb-2 flex items-end justify-between">
                    <div>
                      <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-400"}>
                        Saved Amount
                      </p>

                      <h4 className={isDark ? "mt-1 text-xl font-bold text-white" : "mt-1 text-xl font-bold text-slate-900"}>
                        {money(goal.savedAmount, currency)}
                      </h4>
                    </div>

                    <span className={isDark ? "text-sm font-bold text-violet-300" : "text-sm font-bold text-violet-600"}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>

                  <div className={isDark ? "h-2.5 overflow-hidden rounded-full bg-slate-800" : "h-2.5 overflow-hidden rounded-full bg-slate-100"}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        completed ? "bg-green-500" : "bg-violet-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className={isDark ? "mt-3 flex justify-between text-xs text-slate-400" : "mt-3 flex justify-between text-xs text-slate-400"}>
                    <span>
                      Remaining: {money(remaining, currency)}
                    </span>

                    <span>
                      Target: {money(goal.targetAmount, currency)}
                    </span>
                  </div>

                  <div className={isDark ? "mt-5 flex items-center justify-between border-t border-slate-800 pt-4" : "mt-5 flex items-center justify-between border-t border-slate-100 pt-4"}>
                    <div className={isDark ? "flex items-center gap-1.5 text-xs text-slate-400" : "flex items-center gap-1.5 text-xs text-slate-500"}>
                      <CalendarDays size={14} />
                      {getDeadlineStatus(goal)}
                    </div>

                    {completed ? (
                      <span className={isDark ? "rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300" : "rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600"}>
                        Goal Achieved
                      </span>
                    ) : (
                      <button
                        onClick={() => openContributionModal(goal)}
                        className={
                          isDark
                            ? "flex items-center gap-1 rounded-lg bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
                            : "flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        }
                      >
                        <Plus size={14} />
                        Add Savings
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedGoals.map((goal) => {
              const progress = getProgress(goal);
              const completed = isCompleted(goal);
              const remaining = Math.max(
                Number(goal.targetAmount) -
                  Number(goal.savedAmount),
                0
              );
              const status = getGoalStatus(goal);

              return (
                <article
                  key={goal.id}
                  className={
                    isDark
                      ? "flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      : "flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  }
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        completed
                          ? isDark
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-green-50 text-green-600"
                          : isDark
                            ? "bg-violet-500/10 text-violet-300"
                            : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      {completed ? <CheckCircle2 size={22} /> : <Target size={22} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={isDark ? "truncate text-base font-bold text-white" : "truncate text-base font-bold text-slate-800"}>
                          {goal.title}
                        </h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-500"}>
                        {money(goal.savedAmount, currency)} saved · {money(goal.targetAmount, currency)} target
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-lg">
                    <div className="flex-1">
                      <div className={isDark ? "mb-2 flex items-center justify-between text-xs text-slate-400" : "mb-2 flex items-center justify-between text-xs text-slate-500"}>
                        <span>{progress.toFixed(1)}% used</span>
                        <span>{money(remaining, currency)} left</span>
                      </div>

                      <div className={isDark ? "h-2.5 overflow-hidden rounded-full bg-slate-800" : "h-2.5 overflow-hidden rounded-full bg-slate-100"}>
                        <div
                          className={`h-full rounded-full transition-all ${completed ? "bg-green-500" : "bg-violet-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        title="Edit goal"
                        className={
                          isDark
                            ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-violet-300"
                            : "rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(goal)}
                        title="Delete goal"
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
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
            <Target size={32} />
          </div>

          <h3 className="text-lg font-bold text-gray-800">
            No savings goals yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Create your first goal and start tracking your savings journey.
          </p>

          <button
            onClick={openAddModal}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {showModal && (
        <Modal title={editingGoal ? "Edit Savings Goal" : "Create Savings Goal"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <Field label="Goal Name">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Buy a new laptop"
                className="form-input"
                required
              />
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="form-input"
              >
                {goalCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Target Amount">
              <input
                type="text"
                inputMode="decimal"
                value={formatAmountInput(form.targetAmount)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetAmount: formatAmountInput(e.target.value),
                  })
                }
                placeholder="Enter target amount"
                className="form-input"
                required
              />
            </Field>

            <Field label="Already Saved (Optional)">
              <input
                type="text"
                inputMode="decimal"
                value={formatAmountInput(form.savedAmount)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    savedAmount: formatAmountInput(e.target.value),
                  })
                }
                className="form-input"
              />
            </Field>

            <Field label="Target Date">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deadline: e.target.value,
                  })
                }
                className="form-input"
              />
            </Field>

            <Field label="Description">
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="What are you saving for?"
                className="form-input resize-none"
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <ModalActions
              onCancel={() => setShowModal(false)}
              submitLabel={editingGoal ? "Update Goal" : "Create Goal"}
            />
          </form>
        </Modal>
      )}

      {/* Contribution Modal */}
      {showContribution && selectedGoal && (
        <Modal
          title="Add Savings"
          onClose={() => setShowContribution(false)}
        >
          <form onSubmit={handleContribution} className="space-y-5">
            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-sm text-violet-700">
                Goal: {selectedGoal.title}
              </p>

              <p className="mt-2 text-lg font-bold text-violet-900">
                {money(
                  Math.max(
                    Number(selectedGoal.targetAmount) -
                      Number(selectedGoal.savedAmount),
                    0
                  ),
                  currency
                )}{" "}
                remaining
              </p>
            </div>

            <Field label="Contribution Amount">
              <input
                type="text"
                inputMode="decimal"
                value={formatAmountInput(contribution)}
                onChange={(e) => setContribution(formatAmountInput(e.target.value))}
                placeholder="Enter amount"
                className="form-input"
                required
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <ModalActions
              onCancel={() => setShowContribution(false)}
              submitLabel="Add Contribution"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color, isDark = false }) {
  const styles = {
    violet: isDark ? "bg-violet-500/10 text-violet-300" : "bg-violet-50 text-violet-600",
    green: isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-green-50 text-green-600",
    orange: isDark ? "bg-amber-500/10 text-amber-300" : "bg-orange-50 text-orange-500",
    blue: isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-600",
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

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#17152A]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}

function ModalActions({ onCancel, submitLabel }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
      >
        {submitLabel}
      </button>
    </div>
  );
}

export default SavingsGoals;
