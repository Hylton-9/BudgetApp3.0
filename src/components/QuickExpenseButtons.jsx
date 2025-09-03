import React from "react";

export default function QuickExpenseButtons({ items, onAdd, categories, dark }) {
  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${
        dark
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <h3
        className={`mb-4 text-lg font-semibold ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        Quick Add Expense
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
        {items.map((e, i) => (
          <button
            key={`${e.description}-${i}`}
            onClick={() => onAdd(e)}
            className={`rounded-lg border-2 border-dashed p-3 transition-colors ${
              dark
                ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700"
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <div
              className={`text-sm font-medium ${
                dark ? "text-white" : "text-gray-900"
              }`}
            >
              {e.description}
            </div>
            <div className="text-lg font-bold text-blue-600">
              ${e.amount}
            </div>
            <div
              className={`text-xs ${
                dark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {categories.find((c) => c.id === e.category)?.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
