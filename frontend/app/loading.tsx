import { SkeletonBlock } from "@/components/cards";

export default function Loading() {
  return (
    <div className="page-shell section-space space-y-6" role="status" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-28 rounded-full" />
        <SkeletonBlock className="h-10 w-64 rounded-xl" />
        <SkeletonBlock className="h-4 w-80 max-w-full rounded-full" />
      </div>
      <SkeletonBlock className="h-60 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock key={index} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
