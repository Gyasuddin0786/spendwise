
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FinanceContext = createContext(null);

const STORAGE_KEYS = {
  transactions: "spendwise_transactions",
  budgets: "spendwise_budgets",
  goals: "spendwise_goals",
  settings: "spendwise_settings",
};

const readStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);

    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
};

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(
    () => readStorage(STORAGE_KEYS.transactions, [])
  );

  const [budgets, setBudgets] = useState(
    () => readStorage(STORAGE_KEYS.budgets, [])
  );

  const [goals, setGoals] = useState(
    () => readStorage(STORAGE_KEYS.goals, [])
  );

  const [settings, setSettings] = useState(
    () => readStorage(STORAGE_KEYS.settings, {
      currency: "INR",
      theme: "light",
    })
  );

  const [notifications, setNotifications] = useState([]);

  const notify = (type, message) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    setNotifications((prev) => [...prev, { id, type, message }]);

    window.setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, 2600);
  };

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.transactions,
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.budgets,
      JSON.stringify(budgets)
    );
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.goals,
      JSON.stringify(goals)
    );
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify(settings)
    );
  }, [settings]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    notify("create", "Transaction created successfully.");

    return newTransaction;
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updatedData }
          : transaction
      )
    );
    notify("update", "Transaction updated successfully.");
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
    notify("delete", "Transaction deleted successfully.");
  };

  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setBudgets((prev) => [...prev, newBudget]);
    notify("create", "Budget created successfully.");

    return newBudget;
  };

  const updateBudget = (id, updatedData) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id
          ? { ...budget, ...updatedData }
          : budget
      )
    );
    notify("update", "Budget updated successfully.");
  };

  const deleteBudget = (id) => {
    setBudgets((prev) =>
      prev.filter((budget) => budget.id !== id)
    );
    notify("delete", "Budget deleted successfully.");
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    notify("create", "Savings goal created successfully.");

    return newGoal;
  };

  const updateGoal = (id, updatedData) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, ...updatedData } : goal
      )
    );
    notify("update", "Savings goal updated successfully.");
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
    notify("delete", "Savings goal deleted successfully.");
  };

  const addGoalContribution = (id, amount) => {
    const contribution = Number(amount);

    if (!Number.isFinite(contribution) || contribution <= 0) {
      return;
    }

    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              savedAmount: Number(goal.savedAmount || 0) + contribution,
            }
          : goal
      )
    );
    notify("update", "Goal contribution added successfully.");
  };

  const updateSettings = (updatedSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...updatedSettings,
    }));
  };

  const exportData = () => {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      goals,
      settings,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "spendwise-backup.json";
    link.click();

    URL.revokeObjectURL(url);
    notify("success", "Data exported successfully.");
  };

  const importData = (data) => {
    if (
      !data ||
      !Array.isArray(data.transactions) ||
      !Array.isArray(data.budgets) ||
      !Array.isArray(data.goals)
    ) {
      throw new Error("Invalid SpendWise backup file.");
    }

    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setGoals(data.goals);

    if (data.settings && typeof data.settings === "object") {
      setSettings(data.settings);
    }

    notify("success", "Data imported successfully.");
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    notify("success", "All data cleared successfully.");
  };

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      goals,
      settings,
      notifications,

      addTransaction,
      updateTransaction,
      deleteTransaction,

      addBudget,
      updateBudget,
      deleteBudget,

      addGoal,
      updateGoal,
      deleteGoal,
      addGoalContribution,

      updateSettings,
      notify,

      exportData,
      importData,
      clearAllData,
    }),
    [transactions, budgets, goals, settings, notifications]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance must be used inside FinanceProvider");
  }

  return context;
}
