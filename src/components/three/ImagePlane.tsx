"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A borderless plane textured with a real photo — reads as the actual part.
 * Loaded at runtime with graceful fallback (a dark plane shows until/if the
 * image fails). `toneMapped=false` lets the Rig brighten it past 1.0 so the
 * active part blooms/glows without any frame or border.
 */
export default function ImagePlane({ url, w, h }: { url: string; w: number; h: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (tex) => {
        if (!alive || !ref.current) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        const m = ref.current.material as THREE.MeshBasicMaterial;
        m.map = tex;
        m.color.set("#ffffff");
        m.needsUpdate = true;
      },
      undefined,
      () => {}
    );
    return () => { alive = false; };
  }, [url]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color="#1a2233" transparent toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
