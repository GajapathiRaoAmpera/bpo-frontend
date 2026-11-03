"use client";

import { useEffect } from "react";

// One shared, mutable mouse position for every scene on the page. Read it inside
// frame loops, never during render. x/y are viewport-normalised to -1..1 (y up).
export const windowPointer = { x: 0, y: 0, clientX: Number.NaN, clientY: Number.NaN };

let subscribers = 0;

function onMove(e: PointerEvent) {
  if (e.pointerType !== "mouse") return;
  windowPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  windowPointer.y = 1 - (e.clientY / window.innerHeight) * 2;
  windowPointer.clientX = e.clientX;
  windowPointer.clientY = e.clientY;
}

export function useWindowPointer(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (subscribers++ === 0) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (--subscribers === 0) window.removeEventListener("pointermove", onMove);
    };
  }, [enabled]);
  return windowPointer;
}

// Mouse position in a canvas's world plane (z=0, viewport vw×vh), or null when the cursor is outside it.
export function pointerInCanvas(el: HTMLElement, vw: number, vh: number): [number, number] | null {
  const r = el.getBoundingClientRect();
  const { clientX: cx, clientY: cy } = windowPointer;
  if (!(cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom)) return null;
  return [((cx - r.left) / r.width - 0.5) * vw, (0.5 - (cy - r.top) / r.height) * vh];
}
