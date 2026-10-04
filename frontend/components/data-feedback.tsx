"use client";

export function DataFeedback({ loading, error, onRetry }: {
  loading?: boolean;
  error?: string | null;
  onRetry: () => void;
}) {
  if (loading) return <p className="empty-state" role="status">Loading updates...</p>;
  if (!error) return null;
  return (
    <div role="alert" className="border-b border-red-200 bg-red-50 p-4 text-center text-sm text-red-900">
      <p>{error}</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded bg-primary px-4 py-2 font-semibold text-white">Try again</button>
    </div>
  );
}
