import { useMemo, useState } from "react";

import { Helmet } from "react-helmet-async";
import { CheckCircle2, Info, Trash2, PencilLine } from "lucide-react";

import Sidebar from "./components/Sidebar";
import TransactionModal from "./components/TransactionModal";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import SavingsGoals from "./pages/Goals";
import Settings from "./pages/Settings";

import { useFinance } from "./context/FinanceContext";

function App() {
  const [page, setPage] = useState("dashboard");
  const [menu, setMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { addTransaction, settings, notifications } = useFinance();
  const theme = settings?.theme || "light";
  const isDark = theme === "dark";

  const seo = useMemo(() => {
    const configs = {
      dashboard: {
        title: "Apna SpentWise Dashboard | Personal Finance Overview",
        description:
          "Track income, expenses, budgets, and savings goals with Apna SpentWise, a modern personal finance dashboard built for smarter money decisions.",
        keywords:
          "Apna SpentWise dashboard, personal finance dashboard, expense tracker, income tracker, budget planner, savings goals",
      },
      transactions: {
        title: "Transactions | Apna SpentWise Money Tracker",
        description:
          "Manage daily transactions, review spending history, and keep your financial records organized with Apna SpentWise.",
        keywords:
          "transaction tracker, money log, spend tracker, finance records, expense entries, transaction history",
      },
      budgets: {
        title: "Budgets | Apna SpentWise Budget Planner",
        description:
          "Plan monthly budgets, monitor category spending, and stay in control of your financial goals with Apna SpentWise.",
        keywords:
          "budget planner, monthly budget tracker, category budgets, spending limits, personal budgeting app",
      },
      reports: {
        title: "Reports & Analytics | Apna SpentWise",
        description:
          "Analyze spending trends, compare income and expenses, and understand your financial performance with detailed reports from Apna SpentWise.",
        keywords:
          "financial reports, spending analytics, expense analysis, income reports, monthly report dashboard",
      },
      goals: {
        title: "Savings Goals | Apna SpentWise",
        description:
          "Create savings goals, track progress, and stay motivated with a clear plan for your future milestones with Apna SpentWise.",
        keywords:
          "savings goals, financial goals tracker, goal planner, emergency fund planner, investment savings goals",
      },
      settings: {
        title: "Settings | Apna SpentWise",
        description:
          "Customize your theme, set display currency, and manage personal finance preferences for a better Apna SpentWise experience.",
        keywords:
          "finance app settings, currency settings, dark mode finance app, personalized spending dashboard",
      },
    };

    return configs[page] || configs.dashboard;
  }, [page]);

  const notificationStyles = {
    create: {
      ring: "ring-emerald-500/30",
      bg: isDark ? "bg-slate-900" : "bg-white",
      icon: "bg-emerald-500/10 text-emerald-400",
      title: isDark ? "text-emerald-300" : "text-emerald-700",
      border: isDark ? "border-emerald-500/40" : "border-emerald-200",
      label: "Created",
    },
    update: {
      ring: "ring-violet-500/30",
      bg: isDark ? "bg-slate-900" : "bg-white",
      icon: "bg-violet-500/10 text-violet-400",
      title: isDark ? "text-violet-300" : "text-violet-700",
      border: isDark ? "border-violet-500/40" : "border-violet-200",
      label: "Updated",
    },
    delete: {
      ring: "ring-red-500/30",
      bg: isDark ? "bg-slate-900" : "bg-white",
      icon: "bg-red-500/10 text-red-400",
      title: isDark ? "text-red-300" : "text-red-700",
      border: isDark ? "border-red-500/40" : "border-red-200",
      label: "Deleted",
    },
    success: {
      ring: "ring-emerald-500/30",
      bg: isDark ? "bg-slate-900" : "bg-white",
      icon: "bg-emerald-500/10 text-emerald-400",
      title: isDark ? "text-emerald-300" : "text-emerald-700",
      border: isDark ? "border-emerald-500/40" : "border-emerald-200",
      label: "Saved",
    },
  };

  const handleSave = (transaction) => {
    addTransaction(transaction);
    setShowModal(false);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            onAdd={() => setShowModal(true)}
            setPage={setPage}
            theme={theme}
          />
        );

      case "transactions":
        return <Transactions />;

      case "budgets":
        return <Budgets />;

      case "reports":
        return <Reports />;

      case "goals":
        return <SavingsGoals />;

      case "settings":
        return <Settings />;

      default:
        return (
          <Dashboard
            onAdd={() => setShowModal(true)}
            setPage={setPage}
            theme={theme}
          />
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="SpendWise" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <link rel="canonical" href="https://www.spendwise.com/" />
      </Helmet>

      <div
        className={
          isDark
            ? "dark-mode min-h-screen bg-slate-950 text-slate-100"
            : "light-mode min-h-screen bg-slate-100 text-slate-900"
        }
      >
      <Sidebar
        page={page}
        setPage={setPage}
        open={menu}
        close={() => setMenu(false)}
        theme={theme}
      />

      <main
        className={
          isDark
            ? "min-h-screen bg-slate-950 text-slate-100 lg:ml-[260px]"
            : "min-h-screen bg-slate-100 text-slate-900 lg:ml-[260px]"
        }
      >
        <div
          className={
            isDark
              ? "sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur lg:hidden"
              : "sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden"
          }
        >
          <button
            onClick={() => setMenu(true)}
            className={
              isDark
                ? "rounded-lg p-2 text-slate-200 hover:bg-slate-800"
                : "rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            }
          >
            ☰
          </button>

          <h2
            className={
              isDark
                ? "font-bold text-indigo-300"
                : "font-bold text-indigo-700"
            }
          >
            SpendWise
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
          >
            + Add
          </button>
        </div>

        {renderPage()}
      </main>

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {notifications.length > 0 && (
        <div className="fixed right-4 top-4 z-[80] flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2">
          {notifications.map((notification) => {
            const variant = notificationStyles[notification.type] || notificationStyles.success;

            return (
              <div
                key={notification.id}
                className={[
                  "flex items-start gap-3 rounded-2xl border p-3 shadow-lg ring-1 backdrop-blur-sm",
                  variant.border,
                  variant.ring,
                  variant.bg,
                ].join(" ")}
              >
                <div className={[
                  "mt-0.5 rounded-full p-2",
                  variant.icon,
                ].join(" ")}>
                  {notification.type === "create" ? (
                    <CheckCircle2 size={16} />
                  ) : notification.type === "delete" ? (
                    <Trash2 size={16} />
                  ) : (
                    <Info size={16} />
                  )}
                </div>

                <div className="flex-1">
                  <p className={[
                    "text-sm font-semibold",
                    variant.title,
                  ].join(" ")}>
                    {variant.label}
                  </p>

                  <p className={isDark ? "text-sm text-slate-300" : "text-sm text-slate-600"}>
                    {notification.message}
                  </p>
                </div>

                <PencilLine
                  size={14}
                  className={isDark ? "mt-1 text-slate-500" : "mt-1 text-slate-400"}
                />
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}

export default App;
