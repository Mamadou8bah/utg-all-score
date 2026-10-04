"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const publicPage = pathname === "/login" || pathname === "/offline";

  useEffect(() => {
    if (pathname === "/login" || pathname === "/offline") return;
    if (!getToken()) { setChecked(false); router.replace("/login"); }
    else setChecked(true);
  }, [pathname, router]);

  return publicPage || checked ? <>{children}</> : null;
}
