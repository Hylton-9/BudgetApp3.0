import React from "react";

export default function Tabs({ tabs, active, setActive, dark }) {
  return (
    <div className="mb-6 flex gap-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
            active === t.id
              ? "bg-blue-600 text-white"
              : dark
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <t.icon className="h-4 w-4" />
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}
