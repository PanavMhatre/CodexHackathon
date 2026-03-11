"use client";

import { useState, useTransition } from "react";
import { checkInToSpot } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

export function CheckInButton({ spotId }: { spotId: string }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { pushToast } = useToast();

  function handleCheckIn() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("spotId", spotId);
      await checkInToSpot(formData);
      setCheckedIn(true);
      pushToast({
        tone: "success",
        title: "Check-in complete",
        description: "You’re ready to start a focus session at this spot."
      });
    });
  }

  return (
    <Button onClick={handleCheckIn} disabled={checkedIn || isPending}>
      {checkedIn ? "Checked in" : isPending ? "Checking in..." : "Check in"}
    </Button>
  );
}
