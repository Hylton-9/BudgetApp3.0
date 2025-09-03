import React from "react";
import { Wallet, Moon, Sun, Download, Printer } from "lucide-react";

export default function Header({ dark, setDark, onExport, onPrint }) {
  return (
    <header
      className={`border-b px-6 py-4 ${
        dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1
            className={`text-2xl font-bold ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            Budget Tracker Pro
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDark(!dark)}
            className={`rounded-lg p-2 transition-colors ${
              dark
                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={() => onExport("json")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </header>
  );
}
