import fs from "fs";
import path from "path";

const roots = ["frontend", "admin-app", "agent-app"];
const replacements = [
  ["bg-background/95 backdrop-blur-xl", "bg-background"],
  ["bg-background/95 backdrop-blur py-2", "bg-background py-2"],
  ["border-slate-100/80 bg-white/90 backdrop-blur-xl", "border-slate-100 bg-white"],
  ["border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl", "border-slate-100 bg-white pb-[env(safe-area-inset-bottom)]"],
  ["sm:items-center sm:bg-slate-950/40 sm:p-4 sm:backdrop-blur-sm", "sm:items-center sm:bg-slate-900 sm:p-4"],
  ["sm:bg-slate-950/40 sm:p-4 sm:backdrop-blur-sm", "sm:bg-slate-900 sm:p-4"],
  ["bg-slate-950/25 backdrop-blur-[1px]", "bg-slate-300"],
  ["bg-slate-950/60 backdrop-blur-sm", "bg-slate-900"],
  ["md:bg-slate-900/60", "md:bg-slate-900"],
  ["bg-slate-950/60", "bg-slate-900"],
  ["bg-slate-950/45", "bg-slate-900"],
  ["bg-slate-950/40", "bg-slate-900"],
  ["bg-slate-900/60", "bg-slate-900"],
  ["backdrop-blur-xl", ""],
  ["backdrop-blur-sm", ""],
  ["backdrop-blur-md", ""],
  [" backdrop-blur", ""],
  ["bg-white/95", "bg-white"],
  ["bg-white/90", "bg-white"],
  ["bg-white/70", "bg-white"],
  ["bg-white/50", "bg-slate-50"],
  ["bg-white/40", "bg-slate-100"],
  ["bg-white/30", "bg-slate-600"],
  ["bg-white/20", "bg-slate-700"],
  ["bg-white/15", "bg-slate-700"],
  ["bg-white/10", "bg-slate-800"],
  ["bg-white/5", "bg-slate-900"],
  ["hover:bg-white/30", "hover:bg-slate-600"],
  ["hover:bg-white/20", "hover:bg-slate-700"],
  ["hover:bg-white/15", "hover:bg-slate-700"],
  ["hover:bg-white/10", "hover:bg-slate-800"],
  ["border-white/10", "border-slate-700"],
  ["border-white/15", "border-slate-600"],
  ["ring-white/15", "ring-slate-600"],
  ["text-white/90", "text-white"],
  ["text-white/75", "text-slate-200"],
  ["text-white/70", "text-slate-300"],
  ["text-white/58", "text-slate-400"],
  ["text-white/55", "text-slate-400"],
  ["text-white/50", "text-slate-400"],
  ["text-white/40", "text-slate-500"],
  ["text-text-secondary/60", "text-slate-500"],
  ["bg-primary/30", "bg-blue-200"],
  ["bg-primary/20", "bg-blue-100"],
  ["bg-primary/10", "bg-blue-50"],
  ["bg-primary/5", "bg-blue-50"],
  ["border-primary/20", "border-blue-200"],
  ["border-primary/30", "border-blue-300"],
  ["hover:border-primary/50", "hover:border-primary"],
  ["hover:border-primary/30", "hover:border-blue-300"],
  ["hover:bg-primary/90", "hover:bg-[#004688]"],
  ["hover:bg-secondary/90", "hover:bg-[#E6B000]"],
  ["group-hover:bg-primary/10", "group-hover:bg-blue-50"],
  ["focus:ring-primary/10", "focus:ring-blue-100"],
  ["focus-visible:ring-primary/40", "focus-visible:ring-blue-200"],
  ["shadow-md shadow-primary/20", "shadow-md"],
  ["shadow-lg shadow-primary/20", "shadow-lg"],
  ["bg-live/10", "bg-red-50"],
  ["bg-success/10", "bg-green-50"],
  ["bg-warning/10", "bg-amber-50"],
  ["hover:bg-error/5", "hover:bg-red-50"],
  ["bg-slate-200/70", "bg-slate-200"],
  ["bg-slate-50/50", "bg-slate-50"],
  ["hover:bg-slate-50/50", "hover:bg-slate-50"],
  ["border-transparent", "border-slate-200"],
  [" isActive ? \"bg-primary/10\"", " isActive ? \"bg-blue-50\""],
  ["? \"bg-primary/10\"", "? \"bg-blue-50\""],
  [" isActive ? 'text-primary' : 'text-slate-400'", " isActive ? 'text-primary' : 'text-slate-400'"],
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

for (const root of roots) {
  for (const file of walk(root)) {
    let content = fs.readFileSync(file, "utf8");
    const original = content;
    for (const [from, to] of replacements) {
      content = content.split(from).join(to);
    }
    if (content !== original) fs.writeFileSync(file, content);
  }
}

console.log("solid color replacements applied");
