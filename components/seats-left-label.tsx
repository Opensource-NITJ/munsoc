"use client";

import React, { useState, useEffect } from "react";
import { getAvailablePortfoliosCount } from "@/lib/portfolios";

interface SeatsLeftLabelProps {
  seatsLeft?: number | string | null;
  className?: string;
}

const SeatsLeftLabel = ({
  seatsLeft: seatsLeftProp,
  className = "",
}: SeatsLeftLabelProps) => {
  const [fetchedSeats, setFetchedSeats] = useState<number | null>(null);

  useEffect(() => {
    // If seatsLeft was explicitly provided as a prop, no need to fetch
    if (seatsLeftProp !== undefined) return;

    let isMounted = true;
    fetch("/api/register")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setFetchedSeats(getAvailablePortfoliosCount(data));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch available portfolios for SeatsLeftLabel:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [seatsLeftProp]);

  const seatsLeft =
    seatsLeftProp !== undefined ? seatsLeftProp : fetchedSeats;

  // Do not show the pill until the number is calculated
  if (seatsLeft === null || seatsLeft === undefined) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a3d5c]/40 border border-[#38bdf8]/30 text-white/90 font-heading text-xs tracking-[0.15em] uppercase backdrop-blur-md shadow-lg shadow-[#38bdf8]/5 mb-6 hover:bg-[#1a3d5c]/60 hover:border-[#38bdf8]/50 transition-all duration-300 ${className}`}
    >
      {/* Pulsing notification dot in MUNSoC cyan */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38bdf8]"></span>
      </span>

      {/* Label text */}
      <span className="tracking-[0.15em]">
        Only <strong className="text-[#38bdf8] font-bold mx-1 text-xs sm:text-sm">{seatsLeft}</strong> seats left
      </span>
    </div>
  );
};

export default SeatsLeftLabel;
