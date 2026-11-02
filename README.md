# Apna SpentWise

Apna SpentWise is a modern personal finance dashboard designed to help users track income, expenses, budgets, savings goals, and financial reports in one clean interface.

## Purpose

This application helps users:
- monitor daily transactions and category-wise spending
- create and manage monthly budgets
- track savings goals and progress
- view financial reports and analytics
- customize theme and display currency preferences
- manage personal finance data with simple local persistence

## Key Features

- Dashboard overview with summary cards and chart insights
- Transaction management with add, edit, and delete flows
- Budget planning with category limits and progress indicators
- Savings goals tracking with contribution support
- Reports and analytics for income vs expenses analysis
- Dark/light theme support
- Currency display customization
- CSV export and backup import features

## Tech Stack

- React + Vite
- JavaScript
- Tailwind CSS
- Recharts
- Lucide React
- Local storage persistence

## Project Structure

```bash
src/
  components/     UI components and shared widgets
  context/        global finance state and settings
  data/           initial data and category definitions
  pages/          dashboard, transactions, budgets, reports, goals, settings
  utils/          finance helpers and formatters
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Notes

- The app stores data locally in the browser using `localStorage`.
- It is designed as a client-side finance dashboard and does not require a backend service.
- The design focuses on a clean, professional, finance-first experience with responsive layouts.

## License

This project is for demo and educational use.

