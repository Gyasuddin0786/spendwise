
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ReceiptText,
  X,
} from "lucide-react";

import { useFinance } from "../context/FinanceContext";
import TransactionModal from "../components/TransactionModal";

import {
  money,
  formatDate,
} from "../utils/finance";

const ITEMS_PER_PAGE = 8;

function Transactions({ onAdd }) {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    settings,
  } = useFinance();

  const currency = settings?.currency || "INR";
  const isDark = settings?.theme === "dark";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter((transaction) =>
        [
          transaction.title,
          transaction.category,
          transaction.note,
          transaction.method,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (transaction) =>
          transaction.category === categoryFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }

      if (sortBy === "highest") {
        return Number(b.amount) - Number(a.amount);
      }

      if (sortBy === "lowest") {
        return Number(a.amount) - Number(b.amount);
      }

      return new Date(b.date) - new Date(a.date);
    });

    return result;
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = filteredTransactions.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const filteredIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const filteredExpenses = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const categories = [
    ...new Set(
      transactions
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleSave = (formData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
    } else {
      addTransaction(formData);
    }

    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (confirmed) {
      deleteTransaction(id);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    sortBy !== "newest";

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
            Manage your money
          </p>

          <h1 className={isDark ? "text-2xl font-bold text-white sm:text-3xl" : "text-2xl font-bold text-[#17152A] sm:text-3xl"}>
            Transactions
          </h1>

          <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-gray-500"}>
            Track and manage all your income and expenses.
          </p>
        </div>

        <button
          onClick={onAdd || handleAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <ReceiptText size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Transactions
              </p>

              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {filteredTransactions.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <ArrowDownLeft size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Income
              </p>

              <h3 className="mt-1 text-xl font-bold text-green-600">
                {money(filteredIncome, currency)}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-500">
              <ArrowUpRight size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Expenses
              </p>

              <h3 className="mt-1 text-xl font-bold text-red-500">
                {money(filteredExpenses, currency)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Search and Filters */}
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search transactions..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 outline-none focus:border-violet-400"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-[180px] rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 outline-none focus:border-violet-400"
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 outline-none focus:border-violet-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <X size={15} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {paginatedTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Transaction
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedTransactions.map((transaction) => {
                    const isIncome =
                      transaction.type === "income";

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-xl p-2.5 ${
                                isIncome
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft size={19} />
                              ) : (
                                <ArrowUpRight size={19} />
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {transaction.title}
                              </p>

                              <p className="mt-1 text-xs capitalize text-gray-400">
                                {transaction.type}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.category}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.method || "—"}
                        </td>

                        <td
                          className={`px-6 py-4 text-sm font-bold ${
                            isIncome
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {money(transaction.amount, currency)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              title="Edit transaction"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(transaction.id)
                              }
                              title="Delete transaction"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <p className="text-sm text-gray-500">
                Showing{" "}
                {(safePage - 1) * ITEMS_PER_PAGE + 1}
                {" - "}
                {Math.min(
                  safePage * ITEMS_PER_PAGE,
                  filteredTransactions.length
                )}
                {" of "}
                {filteredTransactions.length} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="px-3 text-sm font-semibold text-gray-700">
                  {safePage} / {totalPages}
                </span>

                <button
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-violet-50 p-4 text-violet-500">
              <ReceiptText size={35} />
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              No transactions found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Try changing your filters or add a new transaction
              to get started.
            </p>

            <button
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {showModal && (
        <TransactionModal
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleSave}
          initialData={editingTransaction}
        />
      )}
    </div>
  );
}

export default Transactions;
