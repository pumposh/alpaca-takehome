"use client";

import { useState, useEffect } from "react";

export default function ServerStatusIndicator() {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("http://localhost:8000");
        if (res.ok) {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch {
        setStatus("disconnected");
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      {showLabel && (
        <div className="absolute right-full mr-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white">
          Server: {status === "checking" ? "Checking..." : status}
        </div>
      )}
      <div
        className={`h-3 w-3 rounded-full shadow-lg transition-colors ${
          status === "connected"
            ? "bg-[#0A958B]"
            : status === "disconnected"
            ? "bg-red-500"
            : "bg-yellow-500"
        }`}
      />
    </div>
  );
}
