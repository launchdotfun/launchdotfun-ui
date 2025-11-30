import { EPresaleOnchainState, TManageablePresaleStatus, TPresale } from "./types";

export const MANAGEABLE_PRESALE_STATUSES: TManageablePresaleStatus[] = ["Draft", "Active", "Closed"];

export function parseManageableStatusParam(value?: string | null): TManageablePresaleStatus | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return MANAGEABLE_PRESALE_STATUSES.find((status) => status.toLowerCase() === normalized);
}

export function resolveManageablePresaleStatus(presale?: TPresale | null, now = Date.now()): TManageablePresaleStatus {
  if (!presale) return "Draft";
  if (presale.deletedAt) return "Closed";
  if (presale.closedAt) return "Closed";

  const poolState = presale.status;
  if (poolState === EPresaleOnchainState.FINALIZED || poolState === EPresaleOnchainState.CANCELED) {
    return "Closed";
  }

  const start = safeTimestamp(presale.startTime);
  const end = safeTimestamp(presale.endTime);

  if (now < start) return "Draft";

  if (poolState === EPresaleOnchainState.ACTIVE) {
    if (now <= end) {
      return "Active";
    }
    return "Closed";
  }

  if (poolState === EPresaleOnchainState.WAITING_FOR_FINALIZE) {
    return now <= end ? "Active" : "Closed";
  }

  if (now <= end) {
    return "Active";
  }

  return "Closed";
}

export function canTransitionManageableStatus(
  currentStatus: TManageablePresaleStatus,
  nextStatus: TManageablePresaleStatus
) {
  if (currentStatus === nextStatus) return false;
  if (currentStatus === "Draft" && nextStatus === "Active") return true;
  if (currentStatus === "Active" && nextStatus === "Closed") return true;
  return false;
}

function safeTimestamp(value?: string | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : Number.MAX_SAFE_INTEGER;
}
