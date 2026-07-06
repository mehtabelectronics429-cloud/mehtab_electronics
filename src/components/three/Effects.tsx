"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Cinematic postprocessing stack for dark 3D stages.
 * Bloom gives emissive materials that Apple/Tesla-grade glow; vignette focuses
 * the frame. Kept lightweight (mipmap blur, no normal pass) for 60fps.
 */
export default function SceneEffects({
  bloomIntensity = 1.15,
  threshold = 0.18,
}: {
  bloomIntensity?: number;
  threshold?: number;
}) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={threshold}
        luminanceSmoothing={0.35}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}
