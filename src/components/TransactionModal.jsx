
import { useEffect, useState } from "react";
import {
  X,
  IndianRupee,
  CalendarDays,
  Tag,
  CreditCard,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { useFinance } from "../context/FinanceContext";
import { formatAmountInput } from "../utils/finance";

const expenseCategories = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Health",
  "Education",
  "Entertainment",
  "Rent",
  "Travel",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Other",
];

const paymentMethods = [
  "UPI",
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
];

const getToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const initialForm = {
  title: "",
  type: "expense",
  amount: "",
  category: "Food & Dining",
  method: "UPI",
  date: getToday(),
  note: "",
};

export default function TransactionModal({
  onClose,
  onSave,
  initialData = null,
}) {
  const { settings } = useFinance();
  const isDark = settings?.theme === "dark";

  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...initialData,
    amount: initialData ? String(initialData.amount ?? "") : "",
    date: initialData?.date || getToday(),
    type: initialData?.type || "expense",
    category:
      initialData?.category ||
      (initialData?.type === "income" ? "Salary" : "Food & Dining"),
  }));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) {
      setForm({ ...initialForm, date: getToday() });
      return;
    }

    setForm({
      ...initialForm,
      ...initialData,
      amount: String(initialData.amount ?? ""),
      date: initialData.date || getToday(),
      type: initialData.type || "expense",
      category:
        initialData.category ||
        (initialData.type === "income" ? "Salary" : "Food & Dining"),
    });
  }, [initialData]);

  const categories =
    form.type === "expense"
      ? expenseCategories
      : incomeCategories;

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type"
        ? {
            category:
              value === "income" ? "Salary" : "Food & Dining",
          }
        : {}),
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    const numericAmount = Number(String(form.amount).replace(/,/g, ""));

    if (!form.amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.date) {
      setError("Please select a transaction date.");
      return;
    }

    const transaction = {
      ...form,
      title: form.title.trim(),
      amount: Number(String(form.amount).replace(/,/g, "")),
      note: form.note.trim(),
    };

    onSave(transaction);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm ${
        isDark ? "bg-slate-950/75" : "bg-slate-950/50"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl ${
          isDark
            ? "border-slate-800 bg-slate-900 shadow-black/30"
            : "border-slate-100 bg-white shadow-slate-950/20"
        }`}
      >
        <div className="modal-scrollbar-hide max-h-[90vh] overflow-y-auto overscroll-contain">
          <div
            className={`flex items-center justify-between border-b px-6 py-5 sm:px-8 ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div>
              <span className="text-[10px] font-bold tracking-[2px] text-violet-500">
                FINANCIAL MANAGEMENT
              </span>

              <h2
                className={`mt-1 text-xl font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                {initialData ? "Edit Transaction" : "Add Transaction"}
              </h2>

              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                Record your income or expenses.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl p-2.5 transition ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-300"
                  : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500"
              }`}
              aria-label="Close modal"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
            <div>
              <label
                className={`mb-3 block text-xs font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateField({
                      target: { name: "type", value: "expense" },
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
                    form.type === "expense"
                      ? "border-rose-200 bg-rose-50 text-rose-600 ring-2 ring-rose-100"
                      : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <ArrowUpRight size={18} />
                  Expense
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateField({
                      target: { name: "type", value: "income" },
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
                    form.type === "income"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-100"
                      : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <ArrowDownLeft size={18} />
                  Income
                </button>
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-xs font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Transaction Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Grocery Shopping"
                maxLength={80}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-400 focus:bg-slate-900 focus:ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-800 focus:border-violet-400 focus:bg-white focus:ring-violet-50"
                }`}
              />
            </div>

            <div>
              <label
                className={`mb-2 block text-xs font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Amount
              </label>

              <div
                className={`flex items-center rounded-xl border px-4 transition focus-within:ring-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 focus-within:border-indigo-400 focus-within:bg-slate-900 focus-within:ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-800 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-violet-50"
                }`}
              >
                <IndianRupee
                  size={18}
                  className={isDark ? "text-slate-400" : "text-slate-400"}
                />

                <input
                  type="text"
                  inputMode="decimal"
                  name="amount"
                  value={formatAmountInput(form.amount)}
                  onChange={(e) => {
                    const formatted = formatAmountInput(e.target.value);
                    updateField({
                      target: {
                        name: "amount",
                        value: formatted,
                      },
                    });
                  }}
                  placeholder="0.00"
                  className="w-full bg-transparent px-3 py-3.5 text-lg font-bold text-inherit outline-none placeholder:text-slate-300"
                />

                <span className="text-xs font-medium text-slate-400">INR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <Tag size={14} />
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-700 focus:border-violet-400 focus:ring-violet-50"
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <CalendarDays size={14} />
                  Transaction Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateField}
                  max={getToday()}
                  className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-700 focus:border-violet-400 focus:ring-violet-50"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                <CreditCard size={14} />
                Payment Method
              </label>

              <select
                name="method"
                value={form.method}
                onChange={updateField}
                className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-400 focus:ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-700 focus:border-violet-400 focus:ring-violet-50"
                }`}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`mb-2 flex items-center gap-2 text-xs font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                <FileText size={14} />
                Notes
                <span className={isDark ? "text-slate-400" : "text-slate-400"}>
                  (Optional)
                </span>
              </label>

              <textarea
                name="note"
                value={form.note}
                onChange={updateField}
                rows={3}
                maxLength={300}
                placeholder="Add some details about this transaction..."
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-400 focus:bg-slate-900 focus:ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-700 focus:border-violet-400 focus:bg-white focus:ring-violet-50"
                }`}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}

            <div
              className={`flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 ${
                  form.type === "expense"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-200 hover:shadow-violet-300"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-100 hover:shadow-emerald-200"
                }`}
              >
                <CheckCircle2 size={17} />
                Save {form.type === "expense" ? "Expense" : "Income"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
