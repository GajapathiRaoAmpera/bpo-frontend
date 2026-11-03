"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { windowPointer, useWindowPointer } from "@/hooks/use-window-pointer";

const MAX_TILT = 3;

// Frosted card that leans up to 3° toward the mouse with a light sheen following it.
// It settles flat while a field inside has focus so it never moves under the user's typing.
export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useWindowPointer(!reduced);

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el) return;
    const now = { rx: 0, ry: 0, mx: 50, my: 0, sheen: 0 };
    let frame = 0;

    const tick = () => {
      const r = el.getBoundingClientRect();
      const typing = el.contains(document.activeElement) && document.activeElement !== el;
      const { clientX, clientY } = windowPointer;
      const known = !Number.isNaN(clientX);
      const dx = known ? Math.max(-1, Math.min(1, (clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))) : 0;
      const dy = known ? Math.max(-1, Math.min(1, (clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))) : 0;
      const over = known && clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;

      const k = 0.1;
      now.ry += ((typing ? 0 : dx * MAX_TILT) - now.ry) * k;
      now.rx += ((typing ? 0 : -dy * MAX_TILT) - now.rx) * k;
      if (known) {
        now.mx += (((clientX - r.left) / r.width) * 100 - now.mx) * k;
        now.my += (((clientY - r.top) / r.height) * 100 - now.my) * k;
      }
      now.sheen += ((over ? 1 : 0.35) - now.sheen) * k;

      el.style.setProperty("--rx", `${now.rx.toFixed(3)}deg`);
      el.style.setProperty("--ry", `${now.ry.toFixed(3)}deg`);
      el.style.setProperty("--mx", `${now.mx.toFixed(1)}%`);
      el.style.setProperty("--my", `${now.my.toFixed(1)}%`);
      el.style.setProperty("--sheen", now.sheen.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
