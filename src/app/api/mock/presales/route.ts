"server only";

import { NextRequest, NextResponse } from "next/server";
import { mockPresales } from "@/lib/presales/mock-data";
import { parseManageableStatusParam, resolveManageablePresaleStatus } from "@/lib/presales/helpers";
import { parseOnchainStatusFilters } from "@/lib/presales/filter-utils";
import { EPresaleOnchainState } from "@/lib/presales/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let result = [...mockPresales];

  const creator = searchParams.get("creator")?.toLowerCase();
  if (creator) {
    result = result.filter((presale) => presale.creator.toLowerCase() === creator);
  }

  const tokenAddress = searchParams.get("token")?.toLowerCase();
  if (tokenAddress) {
    result = result.filter((presale) => presale.token.address.toLowerCase() === tokenAddress);
  }

  const statuses = parseOnchainStatusFilters(searchParams.getAll("onchainStatus"));
  if (statuses.length) {
    result = result.filter((presale) => statuses.includes(presale.status as EPresaleOnchainState));
  }

  const manageableStatus = parseManageableStatusParam(searchParams.get("status"));
  if (manageableStatus) {
    result = result.filter((presale) => resolveManageablePresaleStatus(presale) === manageableStatus);
  }

  const startDate = searchParams.get("startDate");
  if (startDate) {
    const ts = Date.parse(startDate);
    if (!Number.isNaN(ts)) {
      result = result.filter((presale) => Date.parse(presale.createdAt) >= ts);
    }
  }

  const endDate = searchParams.get("endDate");
  if (endDate) {
    const ts = Date.parse(endDate);
    if (!Number.isNaN(ts)) {
      result = result.filter((presale) => Date.parse(presale.createdAt) <= ts);
    }
  }

  return NextResponse.json(result, { status: 200 });
}
