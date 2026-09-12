export const HELLO_DRAW_MS = 1800;
export const HELLO_FADE_MS = 550;
const MOVE_END = HELLO_DRAW_MS + 1600;
const INTRO_END = MOVE_END + 1100;
const FIRST_FADE_START = INTRO_END + 1200;
export const HELLO_INTRO_MS = FIRST_FADE_START + HELLO_FADE_MS;
export const HELLO_CYCLE_MS = HELLO_DRAW_MS + 2400 + HELLO_FADE_MS;

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
