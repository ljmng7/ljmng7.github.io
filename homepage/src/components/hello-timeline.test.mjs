import assert from "node:assert/strict";
import { test } from "node:test";
import { helloFrameAt, HELLO_CYCLE_MS, HELLO_INTRO_MS } from "./hello-timeline.ts";

test("English finishes drawing before the introduction, then fades after both lines appear", () => {
  assert.deepEqual(helloFrameAt(0, 3), { index: 0, iteration: 0, phase: "drawing", introduced: false });
  assert.equal(helloFrameAt(1799, 3).introduced, false);
  assert.equal(helloFrameAt(1800, 3).phase, "moving");
  assert.equal(helloFrameAt(3399, 3).phase, "moving");
  assert.equal(helloFrameAt(3400, 3).phase, "subtitle");
  assert.equal(helloFrameAt(4500, 3).phase, "holding");
  assert.equal(helloFrameAt(5700, 3).phase, "fading");
  assert.equal(helloFrameAt(6249, 3).index, 0);
});

test("Chinese comes first after English; later cycles repeat while the introduction stays visible", () => {
  const indices = Array.from({ length: 6 }, (_, cycle) => {
    const frame = helloFrameAt(HELLO_INTRO_MS + cycle * HELLO_CYCLE_MS, 3);
    assert.equal(frame.phase, "drawing");
    assert.equal(frame.introduced, true);
    assert.equal(frame.iteration, cycle + 1);
    return frame.index;
  });
  assert.deepEqual(indices, [1, 2, 0, 1, 2, 0]);
});

test("all looped languages share the same draw, hold, and fade durations", () => {
  for (let cycle = 0; cycle < 6; cycle++) {
    const start = HELLO_INTRO_MS + cycle * HELLO_CYCLE_MS;
    assert.equal(helloFrameAt(start + 1799, 3).phase, "drawing");
    assert.equal(helloFrameAt(start + 1800, 3).phase, "holding");
    assert.equal(helloFrameAt(start + 4199, 3).phase, "holding");
    assert.equal(helloFrameAt(start + 4200, 3).phase, "fading");
    assert.equal(helloFrameAt(start + 4749, 3).phase, "fading");
    assert.equal(helloFrameAt(start + 4750, 3).phase, "drawing");
  }
});

test("one artwork loops safely and an empty collection cannot start playback", () => {
  assert.equal(helloFrameAt(90000, 1).index, 0);
  assert.throws(() => helloFrameAt(0, 0));
});
