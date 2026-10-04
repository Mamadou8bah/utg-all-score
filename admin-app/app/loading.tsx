import { PortalSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="portal-shell flex flex-col">
      <div className="h-14 shrink-0 border-b border-slate-100 bg-white" />
      <div className="portal-scroll mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 lg:py-8 xl:px-8">
        <PortalSkeleton />
      </div>
    </div>
  );
}
