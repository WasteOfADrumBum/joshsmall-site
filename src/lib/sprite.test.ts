import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ARRIVED, SET_OFF, SHEET, clips, frameAt, sheetPosition, stepToward } from "./sprite.ts";

describe("clips", () => {
  it("cover the 57 frames of the sheet once each, in order", () => {
    const all = Object.values(clips).sort((a, b) => a.start - b.start);
    let next = 0;
    for (const c of all) {
      assert.equal(c.start, next);
      next += c.count;
    }
    assert.equal(next, 57);
    assert.ok(next <= SHEET.columns * SHEET.rows);
  });
});

describe("frameAt", () => {
  it("loops a looping clip", () => {
    assert.equal(frameAt(clips.idle, 0).frame, 0);
    assert.equal(frameAt(clips.idle, 1000).frame, 4);
    assert.equal(frameAt(clips.idle, 1500).frame, 0);
  });

  it("holds the last frame of a one-shot clip and reports it done", () => {
    const end = frameAt(clips.wave, 5000);
    assert.equal(end.frame, clips.wave.start + clips.wave.count - 1);
    assert.equal(end.done, true);
    assert.equal(frameAt(clips.wave, 0).done, false);
  });
});

describe("sheetPosition", () => {
  it("maps the corners of the sheet", () => {
    assert.deepEqual(sheetPosition(0), { x: 0, y: 0 });
    assert.deepEqual(sheetPosition(7), { x: 100, y: 0 });
    assert.deepEqual(sheetPosition(56), { x: 0, y: 100 });
  });
});

describe("stepToward", () => {
  it("stops once close enough", () => {
    assert.deepEqual(stepToward(0, ARRIVED / 2, 0.016, true), { pos: 0, running: 0 });
  });

  it("ignores small moves while standing, but keeps going on them while running", () => {
    const small = (ARRIVED + SET_OFF) / 2;
    assert.equal(stepToward(0, small, 0.016).running, 0);
    assert.equal(stepToward(0, small, 0.016, true).running, 1);
  });

  it("runs toward the target without overshooting", () => {
    const right = stepToward(0, 0.9, 0.1);
    assert.equal(right.running, 1);
    assert.ok(right.pos > 0 && right.pos < 0.9);
    assert.equal(stepToward(0, -0.9, 0.1).running, -1);
    assert.equal(stepToward(0.2, 0.5, 10, true).pos, 0.5);
  });
});
