"use client";

import { useState } from "react";
import type { Puppy } from "@/utils/PuppyData";

interface PuppyReserveButtonProps {
  puppy: Puppy;
}

export default function PuppyReserveButton({
  puppy,
}: PuppyReserveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReserve() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puppyId: puppy.id }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setLoading(false);
    }
  }

  if (puppy.status === "adopted") {
    return (
      <div className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm text-stone-500">
        This puppy has already been adopted.
      </div>
    );
  }

  if (puppy.status === "reserved") {
    return (
      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        This puppy is currently reserved. Contact us to join the waitlist or
        ask about upcoming litters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleReserve}
        disabled={loading}
        className="w-full rounded-full bg-emerald-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {loading
          ? "Opening secure checkout..."
          : `Reserve with $${puppy.depositAmount.toLocaleString()} Deposit`}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
