// Lightweight NLP helpers for budget chat

const numberFrom = (s) => {
  if (!s) return null;
  const m = String(s).replace(/[,$]/g, "");
  const n = parseFloat(m);
  return Number.isFinite(n) ? n : null;
};

const normalize = (s) => s.toLowerCase().trim();

const parseDate = (raw) => {
  if (!raw) return null;
  const s = normalize(raw);
  if (s === "today") return new Date().toISOString().split("T")[0];
  if (s === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
};

// very light period parser; default to "this month"
const resolvePeriod = (text) => {
  const s = normalize(text || "");
  if (/(today)/.test(s)) return "today";
  if (/(yesterday)/.test(s)) return "yesterday";
  if (/(this month|current month)/.test(s)) return "month";
  if (/(this week|current week)/.test(s)) return "week";
  if (/(all time|overall|ever)/.test(s)) return "all";
  return "month";
};

// Try to find "$12.34" or "12.34" tokens
const extractAmount = (text) => {
  const m = text.match(/\$?\s*([0-9]+(?:[.,][0-9]{1,2})?)/);
  return m ? numberFrom(m[1]) : null;
};

export function parseCommand(text, categories) {
  const s = normalize(text);

  // map of recognized category aliases
  const catMap = {};
  (categories || []).forEach((c) => {
    catMap[normalize(c.id)] = c.id;
    catMap[normalize(c.name)] = c.id;
    // tiny aliasing for common ones
    if (c.id === "food") catMap["dining"] = c.id;
    if (c.id === "transportation") {
      catMap["transport"] = c.id;
      catMap["uber"] = c.id;
      catMap["gas"] = c.id;
    }
    if (c.id === "shopping") catMap["clothes"] = c.id;
  });

  // --- ADD EXPENSE ---
  // e.g. "add $5 coffee in food today", "log coffee $4.50", "record 12 lunch"
  if (/^(add|log|record)\b/.test(s) || /\badd\b.+\bexpense\b/.test(s)) {
    const amount = extractAmount(s);
    // description: words after amount OR after verb
    let description = "expense";
    const afterAmount = s.split(/(?:\$?\s*[0-9]+(?:[.,][0-9]{1,2})?)/i)[1];
    if (afterAmount) {
      description = afterAmount.replace(/\bin\b.*$/, "").replace(/\btoday|yesterday\b/g, "").trim();
    } else {
      const afterVerb = s.replace(/^(add|log|record)\b/, "").trim();
      description = afterVerb.replace(/\$?\s*[0-9]+[.,]?[0-9]*/,"").trim();
    }
    // category
    let category = null;
    const catMatch = s.match(/\b(in|to|under)\s+([a-z &]+)\b/);
    if (catMatch) {
      const alias = normalize(catMatch[2]);
      category = catMap[alias] || null;
    }
    if (!category) {
      // try a direct category token
      for (const alias in catMap) {
        if (new RegExp(`\\b${alias}\\b`).test(s)) { category = catMap[alias]; break; }
      }
    }
    // date
    const date = parseDate((s.match(/\b(today|yesterday|\d{4}-\d{2}-\d{2})\b/) || [])[0]) || null;

    return { intent: "add_expense", amount, description: description || "expense", category, date };
  }

  // --- SET BUDGET ---
  // "set budget for food to $600"
  {
    const m = s.match(/\bset\s+(the\s+)?budget\s+for\s+([a-z &]+)\s+to\s+\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
    if (m) {
      const alias = normalize(m[2]);
      return { intent: "set_budget", category: catMap[alias] || null, amount: numberFrom(m[3]) };
    }
  }

  // --- TOTAL SPENT / CATEGORY SPENT ---
  // "how much did I spend (this month) (on food)?"
  if (/\b(how much|what).*(spent|expenses)/.test(s) || /\btotal (spend|spent|expenses)\b/.test(s)) {
    const period = resolvePeriod(s);
    let category = null;
    const onMatch = s.match(/\bon\s+([a-z &]+)\b/);
    if (onMatch) {
      category = catMap[normalize(onMatch[1])] || null;
    }
    return { intent: "spent", period, category };
  }

  // --- REMAINING BUDGET ---
  if (/\b(remaining|left|how much.*left).*(budget)?\b/.test(s)) {
    return { intent: "remaining" };
  }

  // --- EDIT LAST EXPENSE IN CATEGORY ---
  // "update last expense in food to $12", "delete last expense in transport"
  if (/\b(update|change)\s+last\s+expense\s+in\s+[a-z &]+\s+to\b/.test(s)) {
    const cat = (s.match(/\bin\s+([a-z &]+)\s+to\b/) || [])[1];
    const category = catMap[normalize(cat || "")] || null;
    const amount = extractAmount(s);
    return { intent: "edit_last_expense", category, amount };
  }
  if (/\b(delete|remove)\s+last\s+expense\s+in\s+[a-z &]+\b/.test(s)) {
    const cat = (s.match(/\bin\s+([a-z &]+)\b/) || [])[1];
    const category = catMap[normalize(cat || "")] || null;
    return { intent: "delete_last_expense", category };
  }

  // --- HELP ---
  if (/\bhelp\b/.test(s)) return { intent: "help" };

  return { intent: "unknown" };
}
