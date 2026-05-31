import fs from "fs";
import path from "path";

const roots = [
  "src/components/provider",
  "src/app/usta",
  "src/components/offers/offer-form.tsx",
  "src/components/orders/order-actions.tsx",
  "src/components/orders/order-dispute-panel.tsx",
  "src/components/messages/message-center-shell.tsx",
  "src/components/listings/listing-form.tsx",
];

const replacements = [
  ["#2563eb", "#087a61"],
  ["#0c2654", "#083228"],
  ["#071a3d", "#083228"],
  ["#f0f5ff", "#eef8f5"],
  ["#e0ecff", "#eef8f5"],
  ["#f4f6fa", "#f8fcfa"],
  ["#1d4ed8", "#066b54"],
  ["#6b7280", "#5a7a72"],
  ["from-[#3b82f6] to-[#0ea5e9]", "from-[#064a3f] to-[#087a61]"],
  ["from-[#3b82f6] to-[#2563eb]", "from-[#064a3f] to-[#087a61]"],
  ["from-[#2563eb] to-[#60a5fa]", "from-[#064a3f] to-[#087a61]"],
  ["border-slate-200", "border-black/5"],
  ["text-slate-500", "text-[#5a7a72]"],
  ["text-slate-400", "text-[#8aa39c]"],
  ["bg-blue-50", "bg-[#eef8f5]"],
  ["text-blue-700", "text-[#087a61]"],
  ["hover:bg-blue-50", "hover:bg-[#eef8f5]"],
  ["border-blue-200", "border-[#087a61]/20"],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const stat = fs.statSync(dir);
  if (stat.isFile() && dir.endsWith(".tsx")) {
    files.push(dir);
    return files;
  }
  if (!stat.isDirectory()) return files;
  for (const entry of fs.readdirSync(dir)) {
    walk(path.join(dir, entry), files);
  }
  return files;
}

const base = path.join(process.cwd());
const fileSet = new Set();

for (const root of roots) {
  const full = path.join(base, root);
  if (fs.existsSync(full)) {
    const stat = fs.statSync(full);
    if (stat.isFile()) fileSet.add(full);
    else walk(full).forEach((f) => fileSet.add(f));
  }
}

let changed = 0;
for (const file of fileSet) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    fs.writeFileSync(file, next);
    changed++;
    console.log("updated:", path.relative(base, file));
  }
}
console.log(`Done. ${changed} files updated.`);
