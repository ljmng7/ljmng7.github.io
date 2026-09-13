export const HELLO_DRAW_MS = 1800;
export const HELLO_FADE_MS = 550;
const MOVE_END = HELLO_DRAW_MS + 1600;
const INTRO_END = MOVE_END + 1100;
const FIRST_FADE_START = INTRO_END + 1200;
export const HELLO_INTRO_MS = FIRST_FADE_START + HELLO_FADE_MS;
export const HELLO_CYCLE_MS = HELLO_DRAW_MS + 2400 + HELLO_FADE_MS;

/** Map the shared hello clock onto the hint's paused 4s animation. */
export function scrollHintTimeAt(elapsed: number): number {
  const first = elapsed < HELLO_INTRO_MS;
  const time = first ? elapsed - MOVE_END
    : (elapsed - HELLO_INTRO_MS) % HELLO_CYCLE_MS - HELLO_DRAW_MS;
  if (time < 0) return 3200;
  const fadeStart = first ? FIRST_FADE_START - MOVE_END : 2400;
  if (time <= 1600) return time;
  if (time < fadeStart) return 1600 + (time - 1600) / (fadeStart - 1600) * 800;
  return Math.min(3200, 2400 + (time - fadeStart) / HELLO_FADE_MS * 800);
}

export type HelloFrame = {
  index: number;
  iteration: number;
  phase: "drawing" | "moving" | "subtitle" | "holding" | "fading";
  introduced: boolean;
};

/** English opens the scene; the supplied list puts Chinese second. */
export function helloFrameAt(elapsed: number, count: number): HelloFrame {
  if (count < 1) throw new Error("At least one hello artwork is required.");
  const time = Math.max(0, elapsed);
  if (time < HELLO_INTRO_MS) {
    const phase = time < HELLO_DRAW_MS ? "drawing"
      : time < MOVE_END ? "moving"
      : time < INTRO_END ? "subtitle"
      : time < FIRST_FADE_START ? "holding" : "fading";
    return { index: 0, iteration: 0, phase, introduced: time >= HELLO_DRAW_MS };
  }
  const cycleTime = time - HELLO_INTRO_MS;
  const iteration = Math.floor(cycleTime / HELLO_CYCLE_MS) + 1;
  const progress = cycleTime % HELLO_CYCLE_MS;
  return {
    index: iteration % count,
    iteration,
    phase: progress < HELLO_DRAW_MS ? "drawing"
      : progress < HELLO_CYCLE_MS - HELLO_FADE_MS ? "holding" : "fading",
    introduced: true,
  };
}
