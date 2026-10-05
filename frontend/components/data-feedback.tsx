"use client";
import { useLanguage } from "@/components/language-provider";

import { SkeletonBlock } from "@/components/cards";

function DataSkeleton() {
  const { t: translate } = useLanguage();
  return (
    <div className="space-y-3" role="status" aria-label={translate("Loading content")}>
      <span className="sr-only">{translate("Loading content")}</span>
      <SkeletonBlock className="h-28 w-full rounded-2xl" />
      <SkeletonBlock className="h-20 w-full rounded-2xl" />
      <SkeletonBlock className="h-20 w-full rounded-2xl" />
    </div>
  );
}

export function DataFeedback({ loading, error, onRetry }: {
  loading?: boolean;
  error?: string | null;
  onRetry: () => void;
}) {
  const { t: translate } = useLanguage();
  if (loading) return <DataSkeleton />;
  if (!error) return null;
  return (
    <div role="alert" className="border-b border-red-200 bg-red-50 p-4 text-center text-sm text-red-900">
      <p>{translate(error)}</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded bg-primary px-4 py-2 font-semibold text-white">{translate("Try again")}</button>
    </div>
  );
}
