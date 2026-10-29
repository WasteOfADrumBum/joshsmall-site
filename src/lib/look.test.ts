import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { approach, clamp, idleLook, lookToward, tiltToLook } from "./look.ts";

const box = { left: 100, top: 100, width: 280, height: 280 };
const viewport = { width: 1280, height: 800 };

describe("lookToward", () => {
  it("looks straight ahead when the point is the center of the box", () => {
    assert.deepEqual(lookToward(240, 240, box, viewport), { x: 0, y: 0 });
  });

  it("turns left and up toward a point above and to the left", () => {
    const look = lookToward(140, 140, box, viewport);
    assert.ok(look.x < 0 && look.y < 0);
  });

  it("never turns past the limit, however far away the point is", () => {
    assert.deepEqual(lookToward(99999, -99999, box, viewport), { x: 1, y: -1 });
  });

  it("uses the box as the reach on small screens so it turns fully at the edges", () => {
    const phone = { width: 390, height: 844 };
    assert.equal(lookToward(380, 240, box, phone).x, 0.5);
    assert.equal(lookToward(520, 240, box, phone).x, 1);
  });
});

describe("tiltToLook", () => {
  it("is neutral when the phone is held at a normal angle", () => {
    assert.deepEqual(tiltToLook(45, 0), { x: 0, y: 0 });
  });

  it("clamps big tilts", () => {
    assert.deepEqual(tiltToLook(180, -90), { x: -1, y: 1 });
  });
});

describe("approach", () => {
  it("moves part of the way each frame and settles on the target", () => {
    let current = { x: 0, y: 0 };
    const target = { x: 1, y: -1 };
    current = approach(current, target);
    assert.ok(Math.abs(current.x - 0.08) < 1e-9);
    for (let i = 0; i < 200; i++) current = approach(current, target);
    assert.ok(Math.abs(current.x - 1) < 1e-3 && Math.abs(current.y + 1) < 1e-3);
  });
});

describe("helpers", () => {
  it("clamp keeps values in range", () => {
    assert.equal(clamp(2), 1);
    assert.equal(clamp(-2), -1);
    assert.equal(clamp(0.3), 0.3);
  });

  it("the idle look stays gentle", () => {
    for (let t = 0; t < 60000; t += 250) {
      const { x, y } = idleLook(t);
      assert.ok(Math.abs(x) <= 0.4 && Math.abs(y) <= 0.18);
    }
  });
});
