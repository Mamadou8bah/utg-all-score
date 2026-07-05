"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2000);

    return () => clearTimeout(removeTimer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50">
      <div className="relative animate-pulse">
        <Image
          src="https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png"
          alt="UTG AllScore Logo"
          width={180}
          height={180}
          priority
          className="h-44 w-44 object-contain shadow-lg sm:h-48 sm:w-48"
        />
      </div>
    </div>
  );
}
