import { type TManageablePresale } from "@/lib/presales/hooks";
import { EPresaleOnchainState, type TPresaleListFilters, type TManageablePresaleStatus } from "@/lib/presales/types";

export type ManageFilterState = {
  status: "all" | TManageablePresaleStatus;
  owner: string;
  token: string;
  startDate: string;
  endDate: string;
};

export const MANAGE_FILTER_DEFAULTS: ManageFilterState = {
  status: "all",
  owner: "",
  token: "",
  startDate: "",
  endDate: "",
};

const ISO_END_SUFFIX = "T23:59:59.999Z";
const ISO_START_SUFFIX = "T00:00:00.000Z";

export function toISODate(value?: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  const suffix = endOfDay ? ISO_END_SUFFIX : ISO_START_SUFFIX;
  const date = new Date(`${value}${suffix}`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function buildManagePresaleFilters(state: ManageFilterState): TPresaleListFilters | undefined {
  const filters: TPresaleListFilters = {};

  if (state.status !== "all") {
    filters.status = state.status;
  }
  if (state.owner.trim()) {
    filters.owner = state.owner.trim().toLowerCase();
  }
  if (state.token.trim()) {
    filters.token = state.token.trim().toLowerCase();
  }

  const startISO = toISODate(state.startDate, false);
  const endISO = toISODate(state.endDate, true);

  if (startISO && endISO) {
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    if (startDate > endDate) {
      filters.startDate = endISO;
      filters.endDate = startISO;
    } else {
      filters.startDate = startISO;
      filters.endDate = endISO;
    }
  } else {
    if (startISO) {
      filters.startDate = startISO;
    }
    if (endISO) {
      filters.endDate = endISO;
    }
  }

  return Object.keys(filters).length ? filters : undefined;
}

export type ManageStatusAction = {
  label: string;
  target: EPresaleOnchainState;
  variant: "default" | "outline" | "destructive";
};

export function getManageStatusActions(presale: TManageablePresale): ManageStatusAction[] {
  const actions: ManageStatusAction[] = [];

  if (presale.manageStatus === "Draft") {
    actions.push({ label: "Activate", target: EPresaleOnchainState.ACTIVE, variant: "default" });
    return actions;
  }

  if (presale.manageStatus === "Active") {
    actions.push({ label: "Mark Waiting", target: EPresaleOnchainState.WAITING_FOR_FINALIZE, variant: "outline" });
    actions.push({ label: "Finalize", target: EPresaleOnchainState.FINALIZED, variant: "default" });
    actions.push({ label: "Cancel", target: EPresaleOnchainState.CANCELED, variant: "destructive" });
    return actions;
  }

  return actions;
}

export function shortenAddress(value?: string | null, chars = 4) {
  if (!value) return "";
  if (value.length <= chars * 2) return value;
  return `${value.slice(0, chars + 2)}…${value.slice(-chars)}`;
}

export function formatManageDateRange(start?: string, end?: string) {
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

  if (!startDate && !endDate) return "—";
  if (startDate && endDate) {
    return `${formatter.format(startDate)} → ${formatter.format(endDate)}`;
  }
  return formatter.format((startDate ?? endDate)!);
}
