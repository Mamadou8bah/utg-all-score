"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function OfflinePage() {
  const { t: translate } = useLanguage();
  return (
    <div className="page-shell section-space">
      <div className="mx-auto max-w-2xl rounded-[36px] border border-slate-200 bg-white p-8 text-center shadow-float">
        <p className="text-sm uppercase tracking-[0.32em] text-primary">{translate("Offline")}</p>
        <h1 className="mt-5 text-4xl font-semibold text-slate-950">{translate("You are offline")}</h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">{translate("Previously cached scores, fixtures, results, announcements, and news may be available. Reconnect to refresh match events and newly published items.")}</p>
        <div className="mt-8 flex justify-center">
          <Link href="/"><Button>{translate("Return home")}</Button></Link>
        </div>
      </div>
    </div>
  );
}
