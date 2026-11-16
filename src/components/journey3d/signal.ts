// Shared between the page (HTML) and the 3D canvas, without re-rendering the
// canvas. This file must not import three, so the page itself stays light.

export type Anchor = {
  el: HTMLElement;
  world: [number, number, number];
  x: number;
  y: number;
  settled: boolean;
};

export const signal = {
  /** -1 before any year, 0–3 the active year, 4 the full system. */
  stage: -1,
  focus: null as number | null,
  pointerX: 0,
  pointerY: 0,
  reduced: false,
  compact: false,
  /** Seconds since the room started booting. */
  time: 0,
  anchors: new Map<string, Anchor>(),
};

// The camera is framed so the scene lines up with the 1717×916 design.
const PX_PER_UNIT = 78;
const CENTRE_X = 1099;
const CENTRE_Y = 458;
const HEIGHT_PX = 69.6;
const DEPTH_PX = 35.4;
export const TARGET_Y = 1.74;

/** The world position that appears at a design pixel, at a given height. */
export function at(
  px: number,
  py: number,
  height = 0,
): [number, number, number] {
  return [
    (px - CENTRE_X) / PX_PER_UNIT,
    height,
    (py - CENTRE_Y + (height - TARGET_Y) * HEIGHT_PX) / DEPTH_PX,
  ];
}

/** The world position at a design pixel, on the plane through the engine. */
export function onPlane(px: number, py: number): [number, number, number] {
  return [
    (px - CENTRE_X) / PX_PER_UNIT,
    TARGET_Y + (CENTRE_Y - py) / HEIGHT_PX,
    0,
  ];
}
