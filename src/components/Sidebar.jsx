
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Target,
  Settings,
  WalletCards,
  X,
  TrendingUp,
} from "lucide-react";

const navigation = [
  {
    title: "Overview",
    id: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    id: "transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Budgets",
    id: "budgets",
    icon: Wallet,
  },
  {
    title: "Reports",
    id: "reports",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Savings Goals",
    id: "goals",
    icon: Target,
  },
];

export default function Sidebar({
  page,
  setPage,
  open,
  close,
  theme = "light",
}) {
  const isDark = theme === "dark";

  return (
    <>
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[260px] flex-col
          border-r transition-transform duration-300
          ${
            isDark
              ? "border-slate-800 bg-slate-900 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div
          className={
            isDark
              ? "flex h-[82px] items-center justify-between border-b border-slate-800 px-6"
              : "flex h-[82px] items-center justify-between border-b border-slate-200 px-6"
          }
        >
          <div className="flex items-center gap-3">
            <div
              className={
                isDark
                  ? "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-lg shadow-indigo-500/20"
                  : "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-lg shadow-indigo-500/20"
              }
            >
              <WalletCards
                size={22}
                className={isDark ? "text-white" : "text-white"}
              />
            </div>

            <div>
              <h1
                className={
                  isDark
                    ? "text-xl font-bold tracking-tight text-slate-100"
                    : "text-xl font-bold tracking-tight text-slate-900"
                }
              >
                Spend<span className="text-indigo-400">Wise</span>
              </h1>
              <p
                className={
                  isDark
                    ? "text-[10px] tracking-widest text-slate-400"
                    : "text-[10px] tracking-widest text-slate-500"
                }
              >
                PERSONAL FINANCE
              </p>
            </div>
          </div>

          <button
            onClick={close}
            className={
              isDark
                ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
                : "rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-8">
          <p
            className={
              isDark
                ? "mb-4 px-3 text-[10px] font-bold tracking-[2px] text-slate-500"
                : "mb-4 px-3 text-[10px] font-bold tracking-[2px] text-slate-400"
            }
          >
            WORKSPACE
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    close();
                  }}
                  className={`
                    group flex w-full items-center gap-3
                    rounded-xl px-4 py-3 text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-700/20"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    className={
                      active
                        ? "text-white"
                        : isDark
                          ? "text-slate-400 group-hover:text-indigo-300"
                          : "text-slate-500 group-hover:text-indigo-500"
                    }
                    strokeWidth={2.2}
                  />

                  <span>{item.title}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-5 p-4">
          <div
            className={
              isDark
                ? "rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-800 to-slate-900 p-4"
                : "rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-sky-50 p-4"
            }
          >
            <div
              className={
                isDark
                  ? "mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300"
                  : "mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"
              }
            >
              <TrendingUp size={19} />
            </div>

            <h3 className="text-sm font-semibold">Smart Money Habits</h3>

            <p
              className={
                isDark
                  ? "mt-2 text-xs leading-5 text-slate-400"
                  : "mt-2 text-xs leading-5 text-slate-600"
              }
            >
              Track your spending, stay within budget and grow your savings.
            </p>
          </div>

          <button
            onClick={() => {
              setPage("settings");
              close();
            }}
            className={`
              flex w-full items-center gap-3 rounded-xl px-4 py-3
              text-sm font-medium transition
              ${
                page === "settings"
                  ? "bg-indigo-600 text-white"
                  : isDark
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <Settings
              size={19}
              className={
                page === "settings"
                  ? "text-white"
                  : isDark
                    ? "text-slate-400 group-hover:text-indigo-300"
                    : "text-slate-500 group-hover:text-indigo-500"
              }
            />
            Settings
          </button>

          <div
            className={
              isDark
                ? "flex items-center gap-3 border-t border-slate-800 pt-5"
                : "flex items-center gap-3 border-t border-slate-200 pt-5"
            }
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-600 font-bold text-white">
              G
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Guest User</p>
              <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                Personal Account
              </p>
            </div>

            <span className={isDark ? "text-slate-500" : "text-slate-400"}>•••</span>
          </div>
        </div>
      </aside>
    </>
  );
}
