import Link from "next/link";
import { Button } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[var(--app-height)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 text-center shadow-float sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Offline</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">No connection</h1>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          The admin app needs a network connection to load teams, competitions, and agents. Reconnect and try again.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button className="w-full sm:w-auto">Try again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
