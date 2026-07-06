"use client";

import FeatureRow from "@/components/ui/FeatureRow";
import { FEATURES } from "@/lib/features";

export { FEATURES } from "@/lib/features";

export default function FeatureSections() {
  return (
    <>
      {FEATURES.map((f) => (
        <FeatureRow key={f.id} {...f} />
      ))}
    </>
  );
}
