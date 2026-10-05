"use client";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
export default function NotFound() {
  const { t: translate } = useLanguage();
  return <div className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold">{translate("Page not found")}</h1><p className="my-4">{translate("This page may have moved or been removed.")}</p><Link href="/" className="inline-block rounded-xl bg-blue-800 px-6 py-3 text-white">{translate("Go home")}</Link></div>;
}
