import { describe, expect, it } from "vitest";
import { addDaysISO, parseChileanAmount, parseFlexibleDate } from "./money";

describe("parseChileanAmount", () => {
  it("reads dotted thousands", () => {
    expect(parseChileanAmount("$1.200.000")).toBe(1_200_000);
    expect(parseChileanAmount("450000")).toBe(450_000);
  });

  it("reads decimal comma", () => {
    expect(parseChileanAmount("1.200,50")).toBe(1201);
  });
});

describe("dates", () => {
  it("parses d/m/y", () => {
    expect(parseFlexibleDate("19/08/2026", "2026-01-01")).toBe("2026-08-19");
  });

  it("adds days", () => {
    expect(addDaysISO("2026-08-19", 30)).toBe("2026-09-18");
  });
});
