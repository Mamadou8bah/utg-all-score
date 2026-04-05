"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Completely remove from DOM after animation finishes (0.5s later)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#fff9e8_0%,_#f8fafc_55%,_#eef2f7_100%)] transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative animate-pulse">
        <Image 
          src="https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png" 
          alt="UTG AllScore Logo" 
          width={180} 
          height={180}
          priority
          className="h-44 w-44 object-contain drop-shadow-[0_12px_30px_rgba(15,23,42,0.22)] sm:h-48 sm:w-48"
        />
      </div>
    </div>
  );
}
