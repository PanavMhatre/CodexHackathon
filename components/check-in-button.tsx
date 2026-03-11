"use client";

import { useState, useTransition } from "react";
import { checkInToSpot } from "@/lib/actions";

export function CheckInButton({ spotId }: { spotId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckIn() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("spotId", spotId);
      await checkInToSpot(formData);
      setMessage("Checked in. You're ready to start a focus session.");
    });
  }

  if (message) {
    return (
      <button
        type="button"
        disabled
        className="rounded-2xl bg-moss/40 px-5 py-3 text-sm font-semibold text-cream cursor-default"
      >
        ✓ Checked in
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCheckIn}
      disabled={isPending}
      className="rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-cream"
    >
      {isPending ? "Checking in..." : "Check in"}
    </button>
  );
}
