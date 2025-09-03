import React, { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  MessageSquareMore,
  AlertCircle,
  BarChart3,
  Wallet as WalletIcon,
  Home,
  Car,
  ShoppingBag,
  Coffee,
  Gamepad2,
  Heart,
  BookOpen,
  Zap,
} from "lucide-react";
import { fmtMoney, todayISO } from "./lib/format.js";
import { parseCommand } from "./lib/nlp.js";
import Header from "./components/Header.jsx";
import Tabs from "./components/Tabs.jsx";
import Modal from "./components/Modal.jsx";
import Toast from "./components/Toast.jsx";
import StatCard from "./components/StatCard.jsx";
import CategoryBar from "./components/CategoryBar.jsx";
import TransactionList from "./components/TransactionList.jsx";
import QuickExpenseButtons from "./components/QuickExpenseButtons.jsx";
import BudgetChat from "./components/BudgetChat.jsx";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [expenseForm, setExpenseForm] = useState({ amount: "", description: "", category: "", date: todayISO() });
  const [incomeForm, setIncomeForm] = useState({ amount: "", source: "", date: todayISO() });
  const [goalForm, setGoalForm] = useState({ name: "", target: "", current: 0, deadline: "" });

  const [chatMessages, setChatMessages] = useState([]);

  const categories = useMemo(() => ([
    { id: "housing", name: "Housing", color: "bg-blue-500" },
    { id: "transportation", name: "Transportation", color: "bg-green-500" },
    { id: "food", name: "Food & Dining", color: "bg-orange-500" },
    { id: "shopping", name: "Shopping", color: "bg-purple-500" },
    { id: "entertainment", name: "Entertainment", color: "bg-pink-500" },
    { id: "healthcare", name: "Healthcare", color: "bg-red-500" },
    { id: "education", name: "Education", color: "bg-indigo-500" },
    { id: "utilities", name: "Utilities", color: "bg-yellow-500" },
    { id: "other", name: "Other", color: "bg-gray-500" },
  ]), []);

  const commonExpenses = [
    { description: "Coffee", amount: 5, category: "food" },
    { description: "Lunch", amount: 12, category: "food" },
    { description: "Gas", amount: 45, category: "transportation" },
    { description: "Groceries", amount: 80, category: "food" },
    { description: "Uber ride", amount: 15, category: "transportation" },
  ];

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    if (Object.keys(budgets).length === 0) {
      const next = {};
      categories.forEach((c) => {
        if (c.id === "housing") next[c.id] = 1500;
        else if (c.id === "food") next[c.id] = 600;
        else if (c.id === "transportation") next[c.id] = 400;
        else next[c.id] = 300;
      });
      setBudgets(next);
    }
  }, [budgets, categories]);

  const notify = (message, type = "info") =>
    setNotifications((p) => [...p, { id: Date.now() + Math.random(), message, type }]);

  const addQuickExpense = (e) => {
    const x = { id: Date.now(), amount: e.amount, description: e.description, category: e.category, date: todayISO() };
    setExpenses((p) => [x, ...p]);
    notify("Expense added successfully!", "success");
  };

  const addExpense = (ev) => {
    ev.preventDefault();
    if (!expenseForm.amount || !expenseForm.description || !expenseForm.category) return;
    const x = {
      id: Date.now(),
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      category: expenseForm.category,
      date: expenseForm.date,
    };
    setExpenses((p) => [x, ...p]);
    setExpenseForm({ amount: "", description: "", category: "", date: todayISO() });
    setShowExpenseForm(false);
    notify("Expense added successfully!", "success");
  };

  const addIncome = (ev) => {
    ev.preventDefault();
    if (!incomeForm.amount || !incomeForm.source) return;
    const x = { id: Date.now(), amount: parseFloat(incomeForm.amount), source: incomeForm.source, date: incomeForm.date };
    setIncome((p) => [x, ...p]);
    setIncomeForm({ amount: "", source: "", date: todayISO() });
    setShowIncomeForm(false);
    notify("Income added successfully!", "success");
  };

  const addGoal = (ev) => {
    ev.preventDefault();
    if (!goalForm.name || !goalForm.target) return;
    const x = { id: Date.now(), name: goalForm.name, target: parseFloat(goalForm.target), current: parseFloat(goalForm.current) || 0, deadline: goalForm.deadline };
    setGoals((p) => [x, ...p]);
    setGoalForm({ name: "", target: "", current: 0, deadline: "" });
    setShowGoalForm(false);
    notify("Goal added successfully!", "success");
  };

  const totalIncome = useMemo(() => income.reduce((s, i) => s + i.amount, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remainingBudget = totalIncome - totalExpenses;

  const categorySpending = useMemo(
    () =>
      categories.map((c) => {
        const spent = expenses.filter((e) => e.category === c.id).reduce((s, e) => s + e.amount, 0);
        const budget = budgets[c.id] || 0;
        return { id: c.id, name: c.name, color: c.color, spent, budget, remaining: budget - spent, percentage: budget > 0 ? (spent / budget) * 100 : 0 };
      }),
    [expenses, budgets, categories]
  );

  const suggestions = useMemo(() => {
    const s = [];
    categorySpending.forEach((c) => {
      if (c.percentage > 80) s.push(`Consider reducing ${c.name} spending - you've used ${Math.round(c.percentage)}% of your budget`);
    });
    if (remainingBudget < 0) s.push("You're over budget this month. Consider reviewing your expenses.");
    return s;
  }, [categorySpending, remainingBudget]);

  const withinPeriod = (dateStr, period) => {
    const d = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const dayMs = 86400000;
    if (period === "today") {
      const t = new Date(); t.setHours(0,0,0,0);
      return d.getTime() === t.getTime();
    }
    if (period === "yesterday") {
      const y = new Date(); y.setHours(0,0,0,0); y.setDate(y.getDate() - 1);
      return d.getTime() === y.getTime();
    }
    if (period === "week") {
      const start = new Date(now); const day = start.getDay() || 7;
      start.setHours(0,0,0,0); start.setDate(start.getDate() - (day - 1));
      const end = new Date(start.getTime() + 7 * dayMs);
      return d >= start && d < end;
    }
    if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return d >= start && d < end;
    }
    return true; // "all"
  };

  // ---- Chatbot ----
  const sendAssistant = (content) =>
    setChatMessages((m) => [...m, { id: Date.now() + Math.random(), role: "assistant", content }]);

  const onChatSend = (text) => {
    setChatMessages((m) => [...m, { id: Date.now() + Math.random(), role: "user", content: text }]);

    const cmd = parseCommand(text, categories);

    // Handle intents
    if (cmd.intent === "add_expense") {
      if (!cmd.amount) return sendAssistant("I didn’t catch the amount. Try “add $12 lunch in food today”.");
      const category = cmd.category || "other";
      const date = cmd.date || todayISO();
      const desc = cmd.description?.replace(/\b(in|to|under)\b.*$/, "").trim() || "expense";
      const x = { id: Date.now(), amount: cmd.amount, description: desc, category, date };
      setExpenses((p) => [x, ...p]);
      sendAssistant(`Added ${fmtMoney(cmd.amount)} for “${desc}” in ${categories.find(c=>c.id===category)?.name || category} on ${date}.`);
      return;
    }

    if (cmd.intent === "set_budget") {
      if (!cmd.category) return sendAssistant("Which category? e.g. “set budget for food to $700”.");
      if (!cmd.amount) return sendAssistant("What amount? e.g. “set budget for food to $700”.");
      setBudgets((b) => ({ ...b, [cmd.category]: cmd.amount }));
      sendAssistant(`Budget for ${categories.find(c=>c.id===cmd.category)?.name} set to ${fmtMoney(cmd.amount)}.`);
      return;
    }

    if (cmd.intent === "spent") {
      const period = cmd.period || "month";
      let list = expenses.filter((e) => withinPeriod(e.date, period));
      if (cmd.category) list = list.filter((e) => e.category === cmd.category);
      const total = list.reduce((s, e) => s + e.amount, 0);
      const label = cmd.category ? `${categories.find(c=>c.id===cmd.category)?.name} ` : "";
      sendAssistant(`You spent ${fmtMoney(total)} ${label ? `on ${label}` : ""}${period === "month" ? "this month" : period === "week" ? "this week" : period === "today" ? "today" : period === "yesterday" ? "yesterday" : "in total"}.`);
      return;
    }

    if (cmd.intent === "remaining") {
      sendAssistant(`Your remaining budget is ${fmtMoney(remainingBudget)} (Income ${fmtMoney(totalIncome)} − Expenses ${fmtMoney(totalExpenses)}).`);
      return;
    }

    if (cmd.intent === "edit_last_expense") {
      if (!cmd.category) return sendAssistant("Tell me which category to edit, e.g. “update last expense in food to $12”.");
      const idx = expenses.findIndex((e) => e.category === cmd.category);
      if (idx === -1) return sendAssistant("I couldn't find any expense in that category.");
      if (!cmd.amount) return sendAssistant("What new amount? e.g. “update last expense in food to $12”.");
      setExpenses((p) => {
        const copy = [...p];
        copy[idx] = { ...copy[idx], amount: cmd.amount };
        return copy;
      });
      sendAssistant(`Updated the last ${categories.find(c=>c.id===cmd.category)?.name} expense to ${fmtMoney(cmd.amount)}.`);
      return;
    }

    if (cmd.intent === "delete_last_expense") {
      if (!cmd.category) return sendAssistant("Which category should I delete from? e.g. “delete last expense in food”.");
      const idx = expenses.findIndex((e) => e.category === cmd.category);
      if (idx === -1) return sendAssistant("I couldn't find any expense in that category.");
      const removed = expenses[idx];
      setExpenses((p) => p.filter((_, i) => i !== idx));
      sendAssistant(`Deleted ${fmtMoney(removed.amount)} “${removed.description}” from ${categories.find(c=>c.id===cmd.category)?.name}.`);
      return;
    }

    if (cmd.intent === "help") {
      sendAssistant(
        "Try:\n• add $12 lunch in food today\n• how much did I spend on food this month?\n• set budget for food to $700\n• update last expense in food to $9\n• delete last expense in transport\n• remaining budget"
      );
      return;
    }

    // Fallback summary
    const topOvers = categorySpending
      .filter((c) => c.percentage > 80)
      .map((c) => `${c.name} (${Math.round(c.percentage)}%)`)
      .join(", ");
    sendAssistant(
      `I can add expenses and answer questions. Right now, remaining budget is ${fmtMoney(remainingBudget)}. ${
        topOvers ? `Watch your ${topOvers}. ` : ""
      }Try: “add $5 coffee in food today”.`
    );
  };

  const getCategoryIcon = (id) => {
    switch (id) {
      case "housing": return Home;
      case "transportation": return Car;
      case "food": return Coffee;
      case "shopping": return ShoppingBag;
      case "entertainment": return Gamepad2;
      case "healthcare": return Heart;
      case "education": return BookOpen;
      case "utilities": return Zap;
      default: return DollarSign;
    }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "expenses", name: "Expenses", icon: TrendingDown },
    { id: "income", name: "Income", icon: TrendingUp },
    { id: "goals", name: "Goals", icon: Target },
    { id: "analytics", name: "Analytics", icon: PieChart },
    { id: "chat", name: "Chat", icon: MessageSquareMore }, // 👈 NEW
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Toast notices={notifications} setNotices={setNotifications} />
      <Header dark={darkMode} setDark={setDarkMode} onExport={() => {}} onPrint={() => {}} />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Tabs tabs={tabs} active={activeTab} setActive={setActiveTab} dark={darkMode} />

        {/* --- Dashboard (unchanged summary) --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard title="Total Income" value={fmtMoney(totalIncome)} Icon={<TrendingUp className="h-6 w-6 text-green-600" />} badge="bg-green-100" />
              <StatCard title="Total Expenses" value={fmtMoney(totalExpenses)} Icon={<TrendingDown className="h-6 w-6 text-red-600" />} badge="bg-red-100" />
              <StatCard
                title="Remaining Budget"
                value={<span className={`${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>{fmtMoney(remainingBudget)}</span>}
                Icon={<WalletIcon className={`h-6 w-6 ${remainingBudget >= 0 ? "text-blue-600" : "text-red-600"}`} />}
                badge={`${remainingBudget >= 0 ? "bg-blue-100" : "bg-red-100"}`}
              />
            </div>

            <QuickExpenseButtons items={commonExpenses} onAdd={addQuickExpense} categories={categories} dark={darkMode} />

            {suggestions.length > 0 && (
              <div className={`rounded-xl border p-6 ${darkMode ? "border-yellow-700 bg-yellow-900" : "border-yellow-200 bg-yellow-50"}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                  <div>
                    <h3 className={`mb-2 font-medium ${darkMode ? "text-yellow-200" : "text-yellow-800"}`}>Smart Suggestions</h3>
                    <ul className="space-y-1">
                      {suggestions.map((s, i) => (
                        <li key={i} className={`text-sm ${darkMode ? "text-yellow-300" : "text-yellow-700"}`}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Budget Overview</h3>
              <div className="space-y-4">
                {categorySpending.map((c) => {
                  const Icon = getCategoryIcon(c.id);
                  return (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                          <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{c.name}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{fmtMoney(c.spent)} / {fmtMoney(c.budget)}</div>
                          <div className={`text-sm ${c.remaining >= 0 ? "text-green-600" : "text-red-600"}`}>{fmtMoney(Math.abs(c.remaining))} {c.remaining >= 0 ? "remaining" : "over"}</div>
                        </div>
                      </div>
                      <CategoryBar percent={c.percentage} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- Expenses --- */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Expenses</h2>
              <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <Plus className="h-4 w-4" /><span>Add Expense</span>
              </button>
            </div>

            <div className={`rounded-xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="p-6">
                <TransactionList items={expenses} categories={categories} getIcon={getCategoryIcon} dark={darkMode} />
              </div>
            </div>

            <Modal open={showExpenseForm} title="Add New Expense" onClose={() => setShowExpenseForm(false)}>
              <form onSubmit={addExpense} className="space-y-4">
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Amount</label>
                  <input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                  <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Category</label>
                  <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required>
                    <option value="">Select category</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date</label>
                  <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">Add Expense</button>
                  <button type="button" onClick={() => setShowExpenseForm(false)} className={`flex-1 rounded-lg border px-4 py-2 transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* --- Income --- */}
        {activeTab === "income" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Income</h2>
              <button onClick={() => setShowIncomeForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <Plus className="h-4 w-4" /><span>Add Income</span>
              </button>
            </div>

            <div className={`rounded-xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="p-6">
                <TransactionList items={income} categories={[{ id: "income", name: "Income", color: "bg-emerald-500" }]} getIcon={() => TrendingUp} dark={darkMode} />
              </div>
            </div>

            <Modal open={showIncomeForm} title="Add New Income" onClose={() => setShowIncomeForm(false)}>
              <form onSubmit={addIncome} className="space-y-4">
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Amount</label>
                  <input type="number" step="0.01" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Source</label>
                  <input type="text" value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date</label>
                  <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">Add Income</button>
                  <button type="button" onClick={() => setShowIncomeForm(false)} className={`flex-1 rounded-lg border px-4 py-2 transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* --- Goals --- */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Goals</h2>
              <button onClick={() => setShowGoalForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <Plus className="h-4 w-4" /><span>Add Goal</span>
              </button>
            </div>

            <div className={`rounded-xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="space-y-3 p-6">
                {goals.length === 0 && <p className={darkMode ? "text-gray-400" : "text-gray-600"}>No goals yet. Add your first goal!</p>}
                {goals.map((g) => (
                  <div key={g.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{g.name}</div>
                      <div className="text-sm text-gray-500">Target: {fmtMoney(g.target)}</div>
                    </div>
                    <CategoryBar percent={g.target > 0 ? (g.current / g.target) * 100 : 0} />
                    <div className="text-sm text-gray-500">Current: {fmtMoney(g.current)}{g.deadline ? ` • By ${g.deadline}` : ""}</div>
                  </div>
                ))}
              </div>
            </div>

            <Modal open={showGoalForm} title="Add New Goal" onClose={() => setShowGoalForm(false)}>
              <form onSubmit={addGoal} className="space-y-4">
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Name</label>
                  <input type="text" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Target</label>
                    <input type="number" step="0.01" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} required />
                  </div>
                  <div>
                    <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Current</label>
                    <input type="number" step="0.01" value={goalForm.current} onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                      className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} />
                  </div>
                </div>
                <div>
                  <label className={`mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Deadline</label>
                  <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">Add Goal</button>
                  <button type="button" onClick={() => setShowGoalForm(false)} className={`flex-1 rounded-lg border px-4 py-2 transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* --- Analytics placeholder (unchanged) --- */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Analytics</h2>
            <div className={`rounded-xl border p-6 shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>Charts can go here. (Kept minimal to avoid extra charting libraries.)</p>
            </div>
          </div>
        )}

        {/* --- Chat (NEW) --- */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Budget Chat</h2>
            <BudgetChat
              dark={darkMode}
              messages={chatMessages}
              onSend={onChatSend}
              suggestions={[
                "add $5 coffee in food today",
                "how much did I spend on food this month?",
                "set budget for food to $700",
                "remaining budget",
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
