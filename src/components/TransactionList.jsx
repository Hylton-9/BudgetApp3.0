import React from "react";
import { DollarSign } from "lucide-react";

export default function TransactionList({ items, categories, getIcon, dark }) {
  if (!items.length) {
    return (
      <div className="py-8 text-center">
        <div className={`mb-4 text-4xl ${dark ? "text-gray-600" : "text-gray-400"}`}>
          💸
        </div>
        <p className={dark ? "text-gray-400" : "text-gray-600"}>
          No items yet. Add one above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((x) => {
        const cat = categories.find((c) => c.id === x.category);
        const Icon = getIcon(x.category) || DollarSign;

        return (
          <div
            key={x.id}
            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
              dark
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${cat?.color || "bg-gray-500"}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className={`font-medium ${dark ? "text-white" : "text-gray-900"}`}>
                  {x.description || x.source}
                </div>
                <div className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {(cat?.name || "General")} • {x.date}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-bold ${
                  x.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${x.amount.toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
