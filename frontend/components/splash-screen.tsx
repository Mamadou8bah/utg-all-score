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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative animate-pulse">
        <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-[32px] bg-white shadow-2xl">
          <Image 
            src="https://res.cloudinary.com/dflsnes44/image/upload/q_auto/f_auto/v1775301714/ChatGPT_Image_Apr_4_2026_11_16_34_AM_dxzi5q.png" 
            alt="UTG AllScore Logo" 
            width={80} 
            height={80}
            priority
          />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-black tracking-tighter text-white">
          UTG <span className="text-primary">AllScore</span>
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          The Official Hub for University Sports
        </p>
      </div>

      <div className="absolute bottom-12 flex items-center gap-3">
        <div className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <div className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <div className="h-1 w-1 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}
