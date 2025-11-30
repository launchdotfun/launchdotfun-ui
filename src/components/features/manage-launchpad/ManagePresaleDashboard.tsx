"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MANAGEABLE_PRESALE_STATUSES } from "@/lib/presales/helpers";
import {
  useManageablePresales,
  usePresaleStatusMutation,
  type TManageablePresale,
  type TManageablePresaleStatus,
} from "@/lib/presales/hooks";
import { EPresaleOnchainState } from "@/lib/presales/types";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/utils/error";
import {
  buildManagePresaleFilters,
  getManageStatusActions,
  MANAGE_FILTER_DEFAULTS,
  type ManageFilterState,
  shortenAddress,
  formatManageDateRange,
} from "./utils";
import { Loader2, Filter, RefreshCw, ShieldCheck, ShieldX, Eye } from "lucide-react";
import { useAccount } from "wagmi";

const ONCHAIN_STATUS_META: Record<EPresaleOnchainState, { label: string; className: string }> = {
  [EPresaleOnchainState.ACTIVE]: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-400/40",
  },
  [EPresaleOnchainState.WAITING_FOR_FINALIZE]: {
    label: "Waiting",
    className: "bg-amber-500/10 text-amber-400 border-amber-400/40",
  },
  [EPresaleOnchainState.CANCELED]: {
    label: "Canceled",
    className: "bg-rose-500/10 text-rose-400 border-rose-400/40",
  },
  [EPresaleOnchainState.FINALIZED]: {
    label: "Finalized",
    className: "bg-primary/10 text-primary border-primary/40",
  },
};

const STATUS_COLORS: Record<TManageablePresaleStatus, string> = {
  Draft: "bg-slate-500/10 text-slate-300 border-slate-500/40",
  Active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  Closed: "bg-muted text-muted-foreground border-border/60",
};

function weiToNumber(value?: string) {
  try {
    if (!value) return 0;
    return Number(formatUnits(BigInt(value), 18));
  } catch {
    return 0;
  }
}
export default function ManagePresaleDashboard() {
  const [filters, setFilters] = useState<ManageFilterState>({ ...MANAGE_FILTER_DEFAULTS });
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const { address } = useAccount();
  const normalizedOwner = address?.toLowerCase() ?? "";

  useEffect(() => {
    setFilters((prev) => {
      if (prev.owner === normalizedOwner) {
        return prev;
      }
      return { ...prev, owner: normalizedOwner };
    });
  }, [normalizedOwner]);

  const enforcedFilters = useMemo(() => {
    if (!normalizedOwner) return filters;
    if (filters.owner === normalizedOwner) return filters;
    return { ...filters, owner: normalizedOwner };
  }, [filters, normalizedOwner]);

  const apiFilters = useMemo(() => buildManagePresaleFilters(enforcedFilters), [enforcedFilters]);
  const {
    data: presales,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useManageablePresales(apiFilters, {
    enabled: !!normalizedOwner,
    refetchOnWindowFocus: false,
  });
  const mutation = usePresaleStatusMutation();

  const stats = useMemo(() => {
    const list = presales ?? [];
    return {
      total: list.length,
      draft: list.filter((p) => p.manageStatus === "Draft").length,
      active: list.filter((p) => p.manageStatus === "Active").length,
      closed: list.filter((p) => p.manageStatus === "Closed").length,
    };
  }, [presales]);

  const handleFilterChange = <K extends keyof ManageFilterState>(key: K, value: ManageFilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ ...MANAGE_FILTER_DEFAULTS });
  };

  const handleStatusAction = (presale: TManageablePresale, actionLabel: string, target: EPresaleOnchainState) => {
    setPendingAddress(presale.presaleAddress);
    mutation.mutate(
      { presaleAddress: presale.presaleAddress, status: target },
      {
        onSuccess: () => {
          toast.success(`${presale.token.symbol} marked as ${actionLabel}`);
        },
        onError: (err) => {
          toast.error("Failed to update presale status", { description: getErrorMessage(err) });
        },
        onSettled: () => {
          setPendingAddress(null);
        },
      }
    );
  };

  const isMutating = mutation.isPending;
  const loadingRows = isLoading || isFetching;
  const showEmpty = !loadingRows && (presales?.length ?? 0) === 0;

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold">Manage Presales & Tokens</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Monitor creation progress, enforce guardrails, and close pools from a single dashboard.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase text-muted-foreground font-semibold">Status</span>
              <Select value={filters.status} onValueChange={(val) => handleFilterChange("status", val as any)}>
                <SelectTrigger className="bg-card border-border/70 focus-visible:ring-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All statuses</SelectItem>
                  {MANAGEABLE_PRESALE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase text-muted-foreground font-semibold">Creator</span>
              <Input
                placeholder={normalizedOwner || "Connect wallet to manage"}
                value={normalizedOwner || ""}
                disabled
                className="bg-card border-border/70 focus-visible:ring-0 text-muted-foreground"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase text-muted-foreground font-semibold">Token</span>
              <Input
                placeholder="Token address"
                value={filters.token}
                onChange={(event) => handleFilterChange("token", event.target.value)}
                className="bg-card border-border/70 focus-visible:ring-0"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase text-muted-foreground font-semibold">From</span>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => handleFilterChange("startDate", event.target.value)}
                  className="bg-card border-border/70 focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase text-muted-foreground font-semibold">To</span>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => handleFilterChange("endDate", event.target.value)}
                  className="bg-card border-border/70 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="px-3 h-8">
              Clear filters
            </Button>
            {apiFilters && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="font-semibold uppercase">Active:</span>
                <span>{Object.keys(apiFilters).join(", ").replace("creator", "owner")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!normalizedOwner && (
        <Card className="border-border/70 bg-card/60">
          <CardContent className="py-10 text-center text-muted-foreground">
            Connect your wallet to view and manage your presales.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Total Presales" value={stats.total} />
        <SummaryCard label="Draft" value={stats.draft} accent="text-slate-200" icon={<ShieldX className="h-4 w-4" />} />
        <SummaryCard
          label="Active"
          value={stats.active}
          accent="text-emerald-300"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <SummaryCard label="Closed" value={stats.closed} accent="text-muted-foreground" />
      </div>

      {normalizedOwner && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">Presale Inventory</h2>
              {error && (
                <p className="text-xs sm:text-sm text-rose-400 mt-1">
                  Failed to load presales. {getErrorMessage(error as Error)}.
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{presales?.length ?? 0} results</span>
          </div>

          {loadingRows ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(3)].map((_, index) => (
                <Card key={`skeleton-${index}`} className="border-border/70 bg-card/60">
                  <CardContent className="h-56 sm:h-60 animate-pulse rounded-xl sm:rounded-2xl" />
                </Card>
              ))}
            </div>
          ) : showEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-muted-foreground gap-2 sm:gap-3 border rounded-xl sm:rounded-2xl border-border/60 bg-muted/10 p-4 sm:p-6">
              <ShieldX className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
              <p className="text-sm sm:text-base font-medium">No presales match your filters.</p>
              <p className="text-xs sm:text-sm">Adjust the filters above or clear them to see all presales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {presales?.map((presale) => (
                <PresaleCard
                  key={presale.presaleAddress}
                  presale={presale}
                  pendingAddress={pendingAddress}
                  isMutating={isMutating}
                  onStatusAction={handleStatusAction}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur-sm shadow-sm">
      <CardContent className="py-3 sm:py-5 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase text-muted-foreground font-semibold">
          <span className="truncate">{label}</span>
          {icon && <span className="text-muted-foreground flex-shrink-0">{icon}</span>}
        </div>
        <div className={cn("text-2xl sm:text-3xl font-semibold tracking-tight", accent)}>{value}</div>
      </CardContent>
    </Card>
  );
}

type PresaleCardProps = {
  presale: TManageablePresale;
  pendingAddress: string | null;
  isMutating: boolean;
  onStatusAction: (presale: TManageablePresale, label: string, target: EPresaleOnchainState) => void;
};

function PresaleCard({ presale, pendingAddress, isMutating, onStatusAction }: PresaleCardProps) {
  const onchainMeta = ONCHAIN_STATUS_META[presale.status];
  const raised = weiToNumber(presale.raisedAmount);
  const hardCap = weiToNumber(presale.hardCap);
  const progress = hardCap > 0 ? Math.min(raised / hardCap, 1) : 0;
  const actions = getManageStatusActions(presale);
  const rowPending = isMutating && pendingAddress === presale.presaleAddress;

  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur-sm shadow-sm flex flex-col gap-3 sm:gap-4 p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <TokenAvatar symbol={presale.token.symbol} icon={presale.token.icon} />
        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
          <div className="text-xs sm:text-sm font-semibold tracking-tight truncate">{presale.token.symbol}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            Owner {shortenAddress(presale.creator)} · Token {shortenAddress(presale.token.address)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Badge className={cn("w-fit text-[9px] sm:text-xs", STATUS_COLORS[presale.manageStatus])}>
          {presale.manageStatus}
        </Badge>
        <Badge className={cn("w-fit border text-[9px] sm:text-xs", onchainMeta?.className)}>
          {onchainMeta?.label ?? "Unknown"}
        </Badge>
      </div>

      <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
        <p className="font-medium truncate">{formatManageDateRange(presale.startTime, presale.endTime)}</p>
        {presale.endTime && (
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            Ends {formatDistanceToNowStrict(new Date(presale.endTime), { addSuffix: true })}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
          <span>Raised</span>
          <span className="truncate ml-2">
            {formatNumber(raised, { fractionDigits: 1, suffix: " zWETH" })} /{" "}
            {formatNumber(hardCap, { fractionDigits: 1, suffix: " zWETH" })}
          </span>
        </div>
        <div className="h-1 sm:h-1.5 w-full bg-border/80 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-auto">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            size="sm"
            disabled={rowPending || presale.status === action.target}
            onClick={() => onStatusAction(presale, action.label, action.target)}
            className="flex-1 min-w-0 sm:min-w-[110px] text-xs sm:text-sm"
          >
            {rowPending ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : action.label}
          </Button>
        ))}
        <Button asChild size="sm" variant="ghost" className="flex-1 min-w-0 sm:min-w-[110px] text-xs sm:text-sm">
          <Link href={`/launchpad/${presale.presaleAddress}`}>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            View
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function TokenAvatar({ symbol, icon }: { symbol: string; icon?: string | null }) {
  return (
    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border border-border/60 bg-muted/60 overflow-hidden flex items-center justify-center text-[10px] sm:text-xs font-semibold text-muted-foreground flex-shrink-0">
      {icon ? <img src={icon} alt={symbol} className="h-full w-full object-cover" /> : (symbol?.slice(0, 2) ?? "??")}
    </div>
  );
}
