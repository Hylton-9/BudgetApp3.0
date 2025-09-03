import React from "react";

export default function CategoryBar({ percent }) {
  const pct = Math.min(100, Math.max(0, percent || 0));
  const bar =
    pct > 100 ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className={`h-2 rounded-full ${bar}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
