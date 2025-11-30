import { EPresaleOnchainState } from "@/lib/presales/types";

const ONCHAIN_STATUS_VALUES = new Set(
  Object.values(EPresaleOnchainState).filter((value) => typeof value === "number") as number[]
);

export function parseOnchainStatusParam(value?: string | number | null): EPresaleOnchainState | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "number" && ONCHAIN_STATUS_VALUES.has(value)) {
    return value as EPresaleOnchainState;
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric) && ONCHAIN_STATUS_VALUES.has(numeric)) {
    return numeric as EPresaleOnchainState;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (normalized in EPresaleOnchainState) {
      const resolved = EPresaleOnchainState[normalized as keyof typeof EPresaleOnchainState];
      if (typeof resolved === "number") {
        return resolved as EPresaleOnchainState;
      }
    }
  }

  return undefined;
}

export function parseOnchainStatusFilters(values: (string | number)[]): EPresaleOnchainState[] {
  if (!values.length) return [];

  const statuses = new Set<EPresaleOnchainState>();

  values
    .flatMap((entry) => {
      if (typeof entry === "number") return [entry];
      return entry.split(",");
    })
    .map((entry) => (typeof entry === "string" ? entry.trim() : entry))
    .forEach((entry) => {
      const status = parseOnchainStatusParam(entry as string | number);
      if (status !== undefined) {
        statuses.add(status);
      }
    });

  return Array.from(statuses);
}
