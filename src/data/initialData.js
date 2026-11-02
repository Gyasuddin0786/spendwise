
import {
  ShoppingCart,
  Utensils,
  Car,
  House,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Plane,
  Receipt,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  CircleDollarSign,
} from "lucide-react";

// ==========================================
// EXPENSE CATEGORIES
// ==========================================

export const expenseCategories = [
  { id: "food", name: "Food & Dining", icon: Utensils, color: "orange" },
  { id: "transport", name: "Transport", icon: Car, color: "blue" },
  { id: "shopping", name: "Shopping", icon: ShoppingCart, color: "pink" },
  { id: "bills", name: "Bills & Utilities", icon: Receipt, color: "yellow" },
  { id: "health", name: "Health", icon: HeartPulse, color: "red" },
  { id: "education", name: "Education", icon: GraduationCap, color: "purple" },
  { id: "entertainment", name: "Entertainment", icon: Gamepad2, color: "indigo" },
  { id: "rent", name: "Rent & Housing", icon: House, color: "teal" },
  { id: "travel", name: "Travel", icon: Plane, color: "cyan" },
  { id: "other-expense", name: "Other", icon: CircleDollarSign, color: "gray" },
];

// ==========================================
// INCOME CATEGORIES
// ==========================================

export const incomeCategories = [
  { id: "salary", name: "Salary", icon: Briefcase, color: "green" },
  { id: "freelance", name: "Freelance", icon: Laptop, color: "blue" },
  { id: "business", name: "Business", icon: TrendingUp, color: "purple" },
  { id: "investment", name: "Investment", icon: CircleDollarSign, color: "teal" },
  { id: "gift", name: "Gift", icon: Gift, color: "pink" },
  { id: "other-income", name: "Other", icon: CircleDollarSign, color: "gray" },
];

// ==========================================
// PAYMENT METHODS
// ==========================================

export const paymentMethods = [
  { id: "upi", name: "UPI" },
  { id: "cash", name: "Cash" },
  { id: "credit-card", name: "Credit Card" },
  { id: "debit-card", name: "Debit Card" },
  { id: "bank-transfer", name: "Bank Transfer" },
  { id: "digital-wallet", name: "Digital Wallet" },
  { id: "other", name: "Other" },
];

// ==========================================
// DEFAULT BUDGET CATEGORIES
// ==========================================

export const defaultBudgets = [
  { category: "Food & Dining", limit: 6000 },
  { category: "Transport", limit: 3000 },
  { category: "Shopping", limit: 5000 },
  { category: "Bills & Utilities", limit: 4000 },
  { category: "Health", limit: 2500 },
];

// ==========================================
// WORLD CURRENCY SUPPORT
// ==========================================

const getWorldCurrencies = () => {
  try {
    const currencyCodes = Intl.supportedValuesOf("currency");

    const displayNames = new Intl.DisplayNames(
      ["en"],
      { type: "currency" }
    );

    return currencyCodes
      .map((code) => {
        const formatter = new Intl.NumberFormat("en", {
          style: "currency",
          currency: code,
        });

        const parts = formatter.formatToParts(100);

        const symbol =
          parts.find((part) => part.type === "currency")?.value || code;

        return {
          code,
          name: displayNames.of(code) || code,
          symbol,
          label: `${displayNames.of(code) || code} (${code})`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Currency list unavailable:", error);

    // Fallback for older browsers
    return [
      { code: "INR", name: "Indian Rupee", symbol: "₹", label: "Indian Rupee (INR)" },
      { code: "USD", name: "US Dollar", symbol: "$", label: "US Dollar (USD)" },
      { code: "EUR", name: "Euro", symbol: "€", label: "Euro (EUR)" },
      { code: "GBP", name: "British Pound", symbol: "£", label: "British Pound (GBP)" },
      { code: "AED", name: "UAE Dirham", symbol: "AED", label: "UAE Dirham (AED)" },
      { code: "SAR", name: "Saudi Riyal", symbol: "SAR", label: "Saudi Riyal (SAR)" },
      { code: "CAD", name: "Canadian Dollar", symbol: "CA$", label: "Canadian Dollar (CAD)" },
      { code: "AUD", name: "Australian Dollar", symbol: "A$", label: "Australian Dollar (AUD)" },
      { code: "JPY", name: "Japanese Yen", symbol: "¥", label: "Japanese Yen (JPY)" },
      { code: "CNY", name: "Chinese Yuan", symbol: "CN¥", label: "Chinese Yuan (CNY)" },
      { code: "PKR", name: "Pakistani Rupee", symbol: "PKR", label: "Pakistani Rupee (PKR)" },
      { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", label: "Bangladeshi Taka (BDT)" },
    ];
  }
};

export const currencies = getWorldCurrencies();

// ==========================================
// DEFAULT APPLICATION SETTINGS
// ==========================================

export const defaultSettings = {
  currency: "INR",
  theme: "light",
  dateFormat: "DD/MM/YYYY",
  budgetAlertPercentage: 80,
  notifications: true,
};
