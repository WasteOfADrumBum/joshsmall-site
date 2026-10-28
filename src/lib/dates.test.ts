import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { approximateYearsSince, completeYearsSince, formatYearsPlus } from "./dates.ts";

const on = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe("completeYearsSince with a known day", () => {
  const start = { year: 2020, month: 6, day: 15 };

  it("counts the year on the anniversary, not the day before", () => {
    assert.equal(completeYearsSince(start, on("2025-06-14")), 4);
    assert.equal(completeYearsSince(start, on("2025-06-15")), 5);
  });

  it("does not use plain year subtraction before the anniversary", () => {
    assert.equal(completeYearsSince(start, on("2025-01-01")), 4);
    assert.equal(completeYearsSince(start, on("2025-12-31")), 5);
  });

  it("returns 0 before the first anniversary and for future starts", () => {
    assert.equal(completeYearsSince(start, on("2020-06-15")), 0);
    assert.equal(completeYearsSince(start, on("2021-06-14")), 0);
    assert.equal(completeYearsSince(start, on("2019-01-01")), 0);
  });

  it("uses UTC, so a late-evening local time doesn't shift the day", () => {
    assert.equal(completeYearsSince(start, new Date("2025-06-14T23:59:59Z")), 4);
    assert.equal(completeYearsSince(start, new Date("2025-06-15T00:00:00Z")), 5);
  });
});

describe("completeYearsSince across leap years", () => {
  const leapDay = { year: 2020, month: 2, day: 29 };

  it("reaches a Feb 29 anniversary on Mar 1 in common years", () => {
    assert.equal(completeYearsSince(leapDay, on("2021-02-28")), 0);
    assert.equal(completeYearsSince(leapDay, on("2021-03-01")), 1);
    assert.equal(completeYearsSince(leapDay, on("2023-02-28")), 2);
    assert.equal(completeYearsSince(leapDay, on("2023-03-01")), 3);
  });

  it("reaches a Feb 29 anniversary on Feb 29 in leap years", () => {
    assert.equal(completeYearsSince(leapDay, on("2024-02-28")), 3);
    assert.equal(completeYearsSince(leapDay, on("2024-02-29")), 4);
  });

  it("is unaffected by Feb 29 falling inside the span", () => {
    const start = { year: 2023, month: 3, day: 1 };
    assert.equal(completeYearsSince(start, on("2024-02-29")), 0);
    assert.equal(completeYearsSince(start, on("2024-03-01")), 1);
  });
});

describe("completeYearsSince with only a month", () => {
  const juvare = { year: 2021, month: 11 };

  it("waits for the whole anniversary month to finish", () => {
    assert.equal(completeYearsSince(juvare, on("2026-10-31")), 4);
    assert.equal(completeYearsSince(juvare, on("2026-11-01")), 4);
    assert.equal(completeYearsSince(juvare, on("2026-11-30")), 4);
    assert.equal(completeYearsSince(juvare, on("2026-12-01")), 5);
  });

  it("handles a January start", () => {
    const softwareEngineering = { year: 2021, month: 1 };
    assert.equal(completeYearsSince(softwareEngineering, on("2026-01-31")), 4);
    assert.equal(completeYearsSince(softwareEngineering, on("2026-02-01")), 5);
    assert.equal(completeYearsSince(softwareEngineering, on("2026-10-17")), 5);
  });

  it("handles a December start rolling into the next year", () => {
    const start = { year: 2021, month: 12 };
    assert.equal(completeYearsSince(start, on("2022-12-31")), 0);
    assert.equal(completeYearsSince(start, on("2023-01-01")), 1);
  });

  it("handles a February start in a leap year", () => {
    const start = { year: 2020, month: 2 };
    assert.equal(completeYearsSince(start, on("2024-02-29")), 3);
    assert.equal(completeYearsSince(start, on("2024-03-01")), 4);
  });
});

describe("completeYearsSince with only a year", () => {
  it("waits for the whole anniversary year to finish", () => {
    assert.equal(completeYearsSince({ year: 2006 }, on("2026-12-31")), 19);
    assert.equal(completeYearsSince({ year: 2006 }, on("2027-01-01")), 20);
  });
});

describe("approximateYearsSince", () => {
  it("gives the nearest whole year for an approximate start year", () => {
    assert.equal(approximateYearsSince(2006, on("2026-01-01")), 20);
    assert.equal(approximateYearsSince(2006, on("2026-10-17")), 20);
    assert.equal(approximateYearsSince(2006, on("2027-01-01")), 21);
  });

  it("never goes negative", () => {
    assert.equal(approximateYearsSince(2030, on("2026-10-17")), 0);
  });
});

describe("formatYearsPlus", () => {
  it("formats whole years as a floor", () => {
    assert.equal(formatYearsPlus(0), "Under a year");
    assert.equal(formatYearsPlus(1), "1+ year");
    assert.equal(formatYearsPlus(5), "5+ years");
  });
});

describe("career config", () => {
  it("matches the counts on the page today", async () => {
    const { career } = await import("../content/site.ts");
    const today = on("2026-10-17");
    assert.equal(approximateYearsSince(career.professionalStartYear, today), 20);
    assert.equal(completeYearsSince(career.softwareEngineeringStart, today), 5);
    assert.equal(completeYearsSince(career.employerStart, today), 4);
  });
});
