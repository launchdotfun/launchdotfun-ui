import { describe, expect, it } from "vitest";
import { getManageStatusActions, buildManagePresaleFilters, MANAGE_FILTER_DEFAULTS } from "./utils";
import type { TManageablePresale } from "@/lib/presales/hooks";
import { EPresaleOnchainState } from "@/lib/presales/types";

function mockPresale(status: "Draft" | "Active" | "Closed", onchain = EPresaleOnchainState.ACTIVE) {
  return {
    id: 1,
    thumbnail: null,
    name: "Test",
    description: "",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600_000).toISOString(),
    token: {
      address: "0xToken",
      name: "Token",
      symbol: "TKN",
      decimals: 18,
      totalSupply: "0",
      icon: null,
      creator: "0xcreator",
      usedAt: null,
    },
    softCap: "0",
    hardCap: "0",
    presaleRate: "0",
    tokensForSale: "0",
    tokensForLiquidity: "0",
    liquidityPercent: 0,
    status: onchain,
    presaleAddress: "0xPresale",
    zTokenAddress: "0xZtoken",
    creator: "0xCreator",
    txHash: "0xhash",
    raisedAmount: "0",
    social: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    manageStatus: status,
  } as TManageablePresale;
}

describe("buildManagePresaleFilters", () => {
  it("returns undefined when no filters selected", () => {
    expect(buildManagePresaleFilters(MANAGE_FILTER_DEFAULTS)).toBeUndefined();
  });

  it("normalizes casing and date range", () => {
    const filters = buildManagePresaleFilters({
      status: "Active",
      owner: "0xABCDEF",
      token: "0xTOKEN",
      startDate: "2025-01-10",
      endDate: "2025-01-05",
    });
    expect(filters).toMatchObject({
      status: "Active",
      owner: "0xabcdef",
      token: "0xtoken",
    });
    expect(filters?.startDate && filters?.endDate).toBeTruthy();
    // When start > end, they should be swapped
    const start = new Date(filters!.startDate!);
    const end = new Date(filters!.endDate!);
    expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
  });
});

describe("getManageStatusActions", () => {
  it("returns activation action for drafts", () => {
    const actions = getManageStatusActions(mockPresale("Draft"));
    expect(actions).toHaveLength(1);
    expect(actions[0].target).toBe(EPresaleOnchainState.ACTIVE);
  });

  it("returns finalize/cancel for active presales", () => {
    const actions = getManageStatusActions(mockPresale("Active"));
    const labels = actions.map((action) => action.label);
    expect(labels).toContain("Finalize");
    expect(labels).toContain("Cancel");
    expect(labels).toContain("Mark Waiting");
  });

  it("returns no actions for closed presales", () => {
    const actions = getManageStatusActions(mockPresale("Closed", EPresaleOnchainState.FINALIZED));
    expect(actions).toHaveLength(0);
  });
});
