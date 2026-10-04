"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div role="alert" className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold">Unable to load this screen</h1><p className="my-4">Check your connection and try again.</p><button onClick={reset} className="rounded-xl bg-blue-800 px-6 py-3 text-white">Try again</button></div>;
}
