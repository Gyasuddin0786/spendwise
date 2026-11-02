
import { useRef, useState } from "react";

import {
  Settings as SettingsIcon,
  Globe,
  CalendarDays,
  Bell,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  ShieldCheck,
  Database,
  Save,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { useFinance } from "../context/FinanceContext";

import { currencies } from "../data/initialData";

function Settings() {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
  } = useFinance();

  const isDark = settings?.theme === "dark";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    currency: settings?.currency || "INR",
    dateFormat: settings?.dateFormat || "DD/MM/YYYY",
    budgetAlertPercentage:
      settings?.budgetAlertPercentage ?? 80,
    notifications: settings?.notifications ?? true,
    theme: settings?.theme || "light",
  });

  const [message, setMessage] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });

    // Message is dismissed when the user navigates or performs another action.
  };

  const handleChange = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setMessage(null);
  };

  const handleSave = (e) => {
    e.preventDefault();

    updateSettings({
      ...form,
      budgetAlertPercentage: Number(
        form.budgetAlertPercentage
      ),
    });

    showMessage("success", "Settings saved successfully.");
  };

  const handleExport = () => {
    try {
      exportData();

      showMessage(
        "success",
        "Your JSON backup export has been started."
      );
    } catch (error) {
      showMessage(
        "error",
        "Unable to export your data. Please try again."
      );
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      showMessage(
        "error",
        "Please select a valid JSON backup file."
      );

      e.target.value = "";
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (
        !data ||
        !Array.isArray(data.transactions) ||
        !Array.isArray(data.budgets) ||
        !Array.isArray(data.goals)
      ) {
        throw new Error("Invalid backup structure.");
      }

      const confirmed = window.confirm(
        "Importing this backup will replace your current financial data, including transactions, budgets, goals and settings. Continue?"
      );

      if (!confirmed) return;

      const result = importData(data);

      if (result === false) {
        throw new Error("Backup import was rejected.");
      }

      if (data.settings) {
        setForm({
          currency: data.settings.currency || "INR",
          dateFormat:
            data.settings.dateFormat || "DD/MM/YYYY",
          budgetAlertPercentage:
            data.settings.budgetAlertPercentage ?? 80,
          notifications:
            data.settings.notifications ?? true,
          theme: data.settings.theme || "light",
        });
      }

      showMessage(
        "success",
        "Backup imported successfully. Your data has been restored."
      );
    } catch (error) {
      showMessage(
        "error",
        "Invalid or unsupported backup file."
      );
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all transactions, budgets and savings goals? This action cannot be undone. Export a backup first if you need your data."
    );

    if (!confirmed) return;

    const secondConfirmation = window.confirm(
      "Final confirmation: Delete all your financial data?"
    );

    if (!secondConfirmation) return;

    clearAllData();

    showMessage(
      "success",
      "All financial data has been cleared."
    );
  };

  const selectedCurrency = currencies.find(
    (item) => item.code === form.currency
  );

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8"
          : "min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6 lg:p-8"
      }
    >

      {/* Header */}
      <div className="mb-8">
        <p className={isDark ? "mb-2 text-sm text-slate-400" : "mb-2 text-sm text-gray-500"}>
          Customize your experience
        </p>

        <h1 className={isDark ? "text-2xl font-bold text-white sm:text-3xl" : "text-2xl font-bold text-[#17152A] sm:text-3xl"}>
          Settings
        </h1>

        <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-gray-500"}>
          Manage preferences, backups and application data.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}

          <p className="text-sm font-medium">
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* General Preferences */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={SettingsIcon}
            title="General Preferences"
            description="Customize how SpendWise displays your financial information."
          />

          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Currency */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <Globe size={16} />
                  Display Currency
                </span>
              </label>

              <select
                value={form.currency}
                onChange={(e) =>
                  handleChange("currency", e.target.value)
                }
                className="settings-input"
              >
                {currencies.map((currency) => (
                  <option
                    key={currency.code}
                    value={currency.code}
                  >
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Changes the currency display. It does not convert stored transaction amounts.
              </p>

              {selectedCurrency && (
                <p className="mt-2 text-sm font-medium text-violet-600">
                  Selected: {selectedCurrency.symbol} {selectedCurrency.name} ({selectedCurrency.code})
                </p>
              )}
            </div>

            {/* Date Format */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Date Format
                </span>
              </label>

              <select
                value={form.dateFormat}
                onChange={(e) =>
                  handleChange("dateFormat", e.target.value)
                }
                className="settings-input"
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY
                </option>

                <option value="MM/DD/YYYY">
                  MM/DD/YYYY
                </option>

                <option value="YYYY-MM-DD">
                  YYYY-MM-DD
                </option>
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Choose your preferred date display format.
              </p>
            </div>

            {/* Budget Alerts */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Budget Alert Threshold
              </label>

              <select
                value={form.budgetAlertPercentage}
                onChange={(e) =>
                  handleChange(
                    "budgetAlertPercentage",
                    Number(e.target.value)
                  )
                }
                className="settings-input"
              >
                <option value={50}>50% of budget</option>
                <option value={70}>70% of budget</option>
                <option value={80}>80% of budget</option>
                <option value={90}>90% of budget</option>
                <option value={100}>100% of budget</option>
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Preferred threshold for budget warnings.
              </p>
            </div>

            {/* Theme */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Appearance
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange("theme", "light")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                    form.theme === "light"
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Sun size={17} />
                  Light
                </button>

                <button
                  type="button"
                  onClick={() => handleChange("theme", "dark")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                    form.theme === "dark"
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Moon size={17} />
                  Dark
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Theme selection is saved here; global dark styling requires an application-wide theme implementation.
              </p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={Bell}
            title="Notifications"
            description="Control your in-app notification preferences."
          />

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Budget Notifications
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Enable budget warning preferences when spending reaches your selected threshold.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.notifications}
              onClick={() =>
                handleChange(
                  "notifications",
                  !form.notifications
                )
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                form.notifications
                  ? "bg-violet-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  form.notifications
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Save Settings */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </form>

      {/* Data Management */}
      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={Database}
          title="Data Management"
          description="Backup, restore or delete your financial information."
        />

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Export */}
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <Download size={21} />
              </div>

              <div>
                <h3 className="font-bold text-gray-800">
                  Export Backup
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Download your complete JSON backup.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              <Download size={17} />
              Download Backup
            </button>
          </div>

          {/* Import */}
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Upload size={21} />
              </div>

              <div>
                <h3 className="font-bold text-gray-800">
                  Import Backup
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Restore your data from a JSON file.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
            >
              {isImporting ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Upload size={17} />
              )}

              {isImporting ? "Importing..." : "Choose Backup File"}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
          <ShieldCheck size={19} className="mt-0.5 shrink-0" />

          <p className="text-xs leading-5">
            Your data is stored in this browser's LocalStorage.
            Export regular backups to avoid losing data if browser
            storage is cleared or the device is changed.
          </p>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={Trash2}
          title="Danger Zone"
          description="Permanent actions related to your financial data."
        />

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-red-100 bg-red-50/50 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-red-700">
              Clear All Financial Data
            </h3>

            <p className="mt-1 text-xs leading-5 text-red-500">
              Permanently delete all transactions, budgets and
              savings goals from this browser.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearData}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Trash2 size={17} />
            Clear All Data
          </button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-gray-400">
        SpendWise · Personal Finance Management
      </p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="font-bold text-[#17152A]">
          {title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Settings;
