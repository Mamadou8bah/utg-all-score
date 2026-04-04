import { SkeletonBlock } from "@/components/cards";

export default function Loading() {
  return (
    <div className="page-shell section-space space-y-4">
      <SkeletonBlock className="h-60 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-48 w-full" />
      </div>
    </div>
  );
}
