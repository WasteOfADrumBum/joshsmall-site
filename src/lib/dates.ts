/**
 * Elapsed-time helpers for the experience figures on the page. A date only carries the precision
 * that is actually known, so nothing here invents a month or a day.
 *
 * All comparisons use UTC so the result doesn't depend on the server's time zone.
 */

export type CareerDate = {
  year: number;
  /** 1–12. Leave out when only the year is known. */
  month?: number;
  /** 1–31. Leave out when only the month is known. */
  day?: number;
};

/**
 * Whole years completed since `start`, never counting a year before it is certain.
 *
 * - Day known: a year counts on its anniversary. A Feb 29 start reaches its anniversary on Mar 1 in
 *   common years, since Feb 28 is still before it.
 * - Month only: a year counts once the anniversary month has finished, because the start could
 *   have been any day of that month. Started in November 2021 → 1 year on Dec 1, 2022.
 * - Year only: a year counts once the anniversary year has finished, for the same reason.
 */
export function completeYearsSince(start: CareerDate, now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();

  let years = y - start.year;
  if (start.month === undefined) {
    years -= 1;
  } else if (start.day === undefined) {
    if (m <= start.month) years -= 1;
  } else if (m < start.month || (m === start.month && d < start.day)) {
    years -= 1;
  }
  return Math.max(0, years);
}

/**
 * Nearest whole number of years since a year that is itself only approximate ("around 2006").
 * Assuming the middle of that year, the nearest whole number works out to the year difference.
 * Show it with a qualifier such as "About", because it is an estimate, not a completed count.
 */
export function approximateYearsSince(startYear: number, now: Date = new Date()): number {
  return Math.max(0, now.getUTCFullYear() - startYear);
}

/** "5+ years": at least this many whole years. */
export function formatYearsPlus(years: number): string {
  if (years < 1) return "Under a year";
  return `${years}+ ${years === 1 ? "year" : "years"}`;
}
