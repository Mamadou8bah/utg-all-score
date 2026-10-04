import Link from "next/link";
export default function NotFound() {
  return <div className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold">Page not found</h1><p className="my-4">This page may have moved or been removed.</p><Link href="/" className="inline-block rounded-xl bg-blue-800 px-6 py-3 text-white">Go home</Link></div>;
}
