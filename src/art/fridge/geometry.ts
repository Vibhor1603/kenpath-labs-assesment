/**
 * Side-section geometry of a single-door fridge with a top freezer box, in a
 * 400 x 500 viewBox. Front (door) is on the left, the back wall on the right.
 * The refrigerant loop: compressor, discharge line, condenser coils on the back,
 * filter drier, capillary tube, evaporator in the freezer, suction line.
 */

export const VIEW = { w: 400, h: 500 } as const;

function serpentine(
  x0: number,
  x1: number,
  y0: number,
  rows: number,
  pitch: number,
): string {
  const r = pitch / 2;
  let d = `M${x0} ${y0}`;
  for (let i = 0; i < rows; i++) {
    const y = y0 + pitch * i;
    const xEnd = i % 2 === 0 ? x1 : x0;
    d += ` H${xEnd}`;
    if (i < rows - 1)
      d += ` A${r} ${r} 0 0 ${xEnd < (x0 + x1) / 2 ? 0 : 1} ${xEnd} ${y + pitch}`;
  }
  return d;
}

function wiggle(x: number, y0: number, turns: number, step: number, amp: number): string {
  let d = "";
  for (let i = 0; i < turns; i++) {
    const cx = x + (i % 2 === 0 ? -amp : amp);
    d += ` Q${cx} ${y0 + i * step + step / 2} ${x} ${y0 + (i + 1) * step}`;
  }
  return d;
}

export const pipe = {
  discharge: "M274 440 H364 Q370 440 370 434 V72 Q370 66 364 66 H358",
  condenser: serpentine(358, 326, 66, 13, 20),
  liquid: "M326 306 V366",
  capillary:
    "M326 366" +
    wiggle(326, 366, 8, 4, 5) +
    " V400 Q326 406 320 406 H318 Q314 406 314 402 V76 Q314 72 310 72 H276",
  evaporator: serpentine(276, 228, 72, 6, 14),
  suction: "M276 142 H304 Q308 142 308 146 V410 Q308 414 304 414 H274",
} as const;

/** Walls in section: outer shell minus the open cavity (front is open, the door seals it). */
export const shell = {
  outer:
    "M80 40 H290 Q300 40 300 50 V372 H206 V456 H76 Q70 456 70 450 V46 Q70 40 80 40 Z",
  cavity: "M70 54 H286 V358 H192 V442 H70 Z",
  partition: "M70 150 H200 V162 H70 Z M214 150 H286 V162 H214 Z",
} as const;
