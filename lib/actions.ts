"use server";

import { revalidatePath } from "next/cache";
import { getSpotBySlug } from "@/lib/mock-data";

export async function completeFocusSession(formData: FormData) {
  const spotSlug = String(formData.get("spotSlug") || "");
  const duration = Number(formData.get("duration") || 25);
  const spot = getSpotBySlug(spotSlug);
  const grantedCreature =
    spot && Math.random() >= 0.45 ? spot.featuredCreatureId : null;

  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/tasks");

  return {
    ok: true,
    spotSlug,
    duration,
    xpEarned: duration >= 60 ? 120 : duration >= 45 ? 85 : 50,
    grantedCreatureId: grantedCreature
  };
}

export async function checkInToSpot(formData: FormData) {
  const spotId = String(formData.get("spotId") || "");
  revalidatePath(`/spots/${spotId}`);
  return { ok: true, spotId };
}
