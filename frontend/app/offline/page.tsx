import Link from "next/link";
import { Button } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="page-shell section-space">
      <div className="mx-auto max-w-2xl rounded-[36px] border border-slate-200 bg-white p-8 text-center shadow-float">
        <p className="text-sm uppercase tracking-[0.32em] text-primary">Offline</p>
        <h1 className="mt-5 text-4xl font-semibold text-slate-950">You are offline</h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">Cached live scores, fixtures, results, announcements, and news remain available. Reconnect to refresh match events and newly published items.</p>
        <div className="mt-8 flex justify-center">
          <Link href="/"><Button>Return home</Button></Link>
        </div>
      </div>
    </div>
  );
}
