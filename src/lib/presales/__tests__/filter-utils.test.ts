import { describe, expect, it } from "vitest";
import { parseOnchainStatusFilters, parseOnchainStatusParam } from "@/lib/presales/filter-utils";
import { EPresaleOnchainState } from "@/lib/presales/types";

describe("parseOnchainStatusParam", () => {
  it("parses enum labels", () => {
    expect(parseOnchainStatusParam("active")).toBe(EPresaleOnchainState.ACTIVE);
    expect(parseOnchainStatusParam("FINALIZED")).toBe(EPresaleOnchainState.FINALIZED);
  });

  it("parses numeric values", () => {
    expect(parseOnchainStatusParam("2")).toBe(EPresaleOnchainState.WAITING_FOR_FINALIZE);
    expect(parseOnchainStatusParam(3)).toBe(EPresaleOnchainState.CANCELED);
  });

  it("returns undefined for invalid values", () => {
    expect(parseOnchainStatusParam(null)).toBeUndefined();
    expect(parseOnchainStatusParam("")).toBeUndefined();
    expect(parseOnchainStatusParam("unknown")).toBeUndefined();
  });
});

describe("parseOnchainStatusFilters", () => {
  it("deduplicates and flattens status params", () => {
    const statuses = parseOnchainStatusFilters(["1,4", "WAITING_FOR_FINALIZE", "3", "Active"]);
    expect(statuses).toContain(EPresaleOnchainState.ACTIVE);
    expect(statuses).toContain(EPresaleOnchainState.WAITING_FOR_FINALIZE);
    expect(statuses).toContain(EPresaleOnchainState.CANCELED);
    expect(statuses).toContain(EPresaleOnchainState.FINALIZED);
    expect(statuses.length).toBe(4);
  });

  it("ignores invalid inputs", () => {
    expect(parseOnchainStatusFilters(["foo", ""])).toEqual([]);
  });
});
