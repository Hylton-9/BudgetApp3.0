import React, { useEffect } from "react";

export default function Toast({ notices, setNotices }) {
  useEffect(() => {
    const timers = notices.map((n) =>
      setTimeout(() => {
        setNotices((prev) => prev.filter((x) => x.id !== n.id));
      }, 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notices, setNotices]);

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {notices.map((n) => (
        <div
          key={n.id}
          className={`rounded-lg px-4 py-2 text-white shadow-lg ${
            n.type === "success"
              ? "bg-green-600"
              : n.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
