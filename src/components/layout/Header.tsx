"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletButton from "@/components/common/WalletButton";
import { useZwethWrapModal } from "@/lib/state/modal/zweth-wrap";
import { cn } from "@/lib/utils";
import { usePresaleListQuery, getPresaleStatus } from "@/lib/presales/hooks";
import { formatNumber } from "@/lib/utils/format";
import { formatUnits } from "viem";
import { EPresaleStatus, type TPresale } from "@/lib/presales/types";
import MobileMenu from "./MobileMenu";

const STATS_DISABLED_PATHS = ["/manage-launchpad"];

export default function Header() {
  const { setModalOpen: setShowWrapDialog } = useZwethWrapModal();
  const pathname = usePathname();
  const showStats = pathname ? !STATS_DISABLED_PATHS.some((path) => pathname.startsWith(path)) : true;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-background border-b border-border/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Mobile menu button - only visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Link href={"/"} className="flex items-center group flex-shrink-0">
                <div className="flex flex-col">
                  <h1 className="text-foreground font-bold text-xl sm:text-2xl lg:text-3xl tracking-tight font-sans group-hover:text-primary transition-colors">
                    Launch.Fun
                  </h1>
                </div>
              </Link>

              {/* Stats bar - hidden on mobile, visible from sm up */}
              {showStats && (
                <div className="hidden sm:flex flex-1 overflow-hidden min-w-0">
                  <HeaderStatsBar />
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Button
                  onClick={() => setShowWrapDialog(true)}
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-primary/50 hover:bg-muted/50 hidden sm:flex"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">zWETH</span>
                  </div>
                </Button>

                <div>
                  <WalletButton />
                </div>
              </div>
            </div>

            {/* Stats bar for mobile - shown below main header on mobile */}
            {showStats && (
              <div className="sm:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
                <HeaderStatsBar />
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </>
  );
}

function HeaderStatsBar() {
  const { data: presales, isLoading } = usePresaleListQuery(undefined, {
    enabled: true,
    refetchInterval: 20_000,
  });

  const trending = useMemo(() => {
    if (!presales?.length) return [];
    const activeOnly = presales.filter((presale) => getPresaleStatus(presale) === EPresaleStatus.Active);
    return activeOnly
      .map(buildHotnessEntry)
      .sort((a, b) => {
        if (b.progressRatio !== a.progressRatio) {
          return b.progressRatio - a.progressRatio;
        }
        if (b.raised !== a.raised) {
          return b.raised - a.raised;
        }
        return a.startedAt - b.startedAt;
      })
      .slice(0, 6);
  }, [presales]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
      {isLoading ? (
        [...Array(4)].map((_, index) => (
          <div
            key={index}
            className="min-w-[140px] sm:min-w-[180px] h-12 sm:h-14 rounded-xl border border-border/60 bg-card/60 animate-pulse"
          />
        ))
      ) : trending.length === 0 ? (
        <div className="text-[10px] sm:text-xs text-muted-foreground py-2 whitespace-nowrap">
          No active presales found.
        </div>
      ) : (
        trending.map(({ presale, raised, progressRatio }) => {
          const progressPercent = Math.min(progressRatio * 100, 999);
          const status = getPresaleStatus(presale);

          return (
            <Link
              key={presale.presaleAddress}
              href={`/launchpad/${presale.presaleAddress}`}
              className="group min-w-[150px] sm:min-w-[190px] rounded-xl sm:rounded-2xl border border-border/70 bg-card/70 px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-sm hover:border-primary/50 transition-all flex-shrink-0"
            >
              <TrendingAvatar symbol={presale.token.symbol} icon={presale.token.icon} name={presale.token.name} />
              <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1 text-[11px] sm:text-[13px] font-semibold text-foreground truncate">
                  <span className="truncate">{presale.token.symbol}</span>
                  <span
                    className={cn(
                      "text-[8px] sm:text-[9px] font-semibold uppercase rounded-full px-1 sm:px-1.5 py-0.5 border flex-shrink-0",
                      status === EPresaleStatus.Active
                        ? "text-green-400 border-green-400/40"
                        : "text-muted-foreground border-border"
                    )}
                  >
                    {status}
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-1 truncate">
                  <span className="truncate">{formatNumber(raised, { fractionDigits: 1, suffix: " zWETH" })}</span>
                  <span className="text-muted-foreground/60 flex-shrink-0">•</span>
                  <span className="flex-shrink-0">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-0.5 sm:h-1 bg-border/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

function getRaisedAmount(presale: TPresale) {
  try {
    if (!presale.raisedAmount) return 0;
    return Number(formatUnits(BigInt(presale.raisedAmount), 18));
  } catch {
    return 0;
  }
}

function getHardCap(presale: TPresale) {
  try {
    if (!presale.hardCap) return 0;
    return Number(formatUnits(BigInt(presale.hardCap), 18));
  } catch {
    return 0;
  }
}

function buildHotnessEntry(presale: TPresale) {
  const raised = getRaisedAmount(presale);
  const hardCap = getHardCap(presale);
  const progressRatio = hardCap > 0 ? Math.min(raised / hardCap, 10) : 0;

  return {
    presale,
    raised,
    hardCap,
    progressRatio,
    startedAt: new Date(presale.startTime).getTime(),
  };
}

function TrendingAvatar({ symbol, icon, name }: { symbol: string; icon?: string | null; name: string }) {
  return (
    <div className="size-6 sm:size-8 rounded-lg sm:rounded-xl border border-border bg-muted/40 flex items-center justify-center overflow-hidden text-[9px] sm:text-[11px] font-semibold text-primary flex-shrink-0">
      {icon ? <img src={icon} alt={name} className="h-full w-full object-cover" /> : (symbol?.slice(0, 2) ?? "?")}
    </div>
  );
}
