import React, { useEffect, useRef, useState } from "react";

export default function BudgetChat({ messages, onSend, dark, suggestions = [] }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className={`rounded-xl border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className={`${dark ? "text-gray-300" : "text-gray-700"}`}>
            <p className="font-medium">Hi! I can help with your budget 👋</p>
            <ul className="mt-2 text-sm list-disc ml-5">
              <li>Add expenses with text, e.g. <em>“add $12 lunch in food today”</em></li>
              <li>Ask totals, e.g. <em>“how much did I spend on food this month?”</em></li>
              <li>Change budgets, e.g. <em>“set budget for food to $700”</em></li>
              <li>Edit or delete last expense in a category</li>
            </ul>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : dark
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {suggestions?.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s)}
              className={`text-xs rounded-full px-3 py-1 border ${
                dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 border-t px-3 py-3 dark:border-gray-700">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message… (e.g., add $5 coffee in food today)"
          className={`flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
            dark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"
          }`}
        />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Send</button>
      </form>
    </div>
  );
}
