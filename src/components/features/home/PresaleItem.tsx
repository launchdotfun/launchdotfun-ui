import { TPresale, usePresaleStatus } from "@/lib/presales/hooks";
import { EPresaleStatus } from "@/lib/presales/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils/format";
import { formatDistance } from "date-fns";
import _ from "lodash";
import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { formatUnits } from "viem";

const getStatusConfig = (status: EPresaleStatus) => {
  switch (status) {
    case EPresaleStatus.Upcoming:
      return {
        bg: "bg-blue-50/50",
        border: "border-blue-200",
        text: "text-blue-600",
        badge: "bg-blue-100 text-blue-700 border border-blue-300",
        icon: "🚀",
      };
    case EPresaleStatus.Completed:
      return {
        bg: "bg-green-50/50",
        border: "border-green-200",
        text: "text-green-600",
        badge: "bg-green-100 text-green-700 border border-green-300",
        icon: "✅",
      };
    case EPresaleStatus.Failed:
      return {
        bg: "bg-red-50/50",
        border: "border-red-200",
        text: "text-red-600",
        badge: "bg-red-100 text-red-700 border border-red-300",
        icon: "❌",
      };
    default:
      return {
        bg: "bg-neutral-50/50",
        border: "border-neutral-200",
        text: "text-neutral-600",
        badge: "bg-neutral-100 text-neutral-700 border border-neutral-300",
        icon: "⏳",
      };
  }
};

export default function PresaleItem({ presale }: { presale: TPresale }) {
  const status = usePresaleStatus(presale);
  const statusConfig = getStatusConfig(status);

  const raised = presale.raisedAmount ? formatUnits(BigInt(presale.raisedAmount), 9) : "0";
  const target = presale.hardCap ? formatUnits(BigInt(presale.hardCap), 9) : "0";

  const progress = (Number(raised) / Number(target)) * 100 || 0;

  return (
    <div
      key={presale.id}
      className={`bg-card border border-border p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden shadow-sm`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="size-10 sm:size-12 border border-border rounded-lg flex-shrink-0">
              <AvatarImage src={presale.token.icon || undefined} alt={presale.token.name} className="object-cover" />
              <AvatarFallback className="bg-primary text-white rounded-lg">
                <span className="text-sm sm:text-lg font-bold font-sans">{presale.token.symbol.charAt(0)}</span>
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3
                className={`text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors font-sans truncate`}
              >
                {presale.token.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold truncate">{presale.token.symbol}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase whitespace-nowrap ${status === EPresaleStatus.Active ? "bg-primary text-white shadow-sm" : statusConfig.badge}`}
            >
              {status.toUpperCase()}
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 font-medium border-l-2 border-border pl-2">
          {presale.description}
        </p>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold">
            <span className="text-muted-foreground">Progress</span>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className={`truncate ${status === EPresaleStatus.Active ? "text-primary" : statusConfig.text}`}>
                {status === EPresaleStatus.Active
                  ? `? / ${formatNumber(target, { fractionDigits: 2, suffix: " zWETH" })}`
                  : `${formatNumber(raised, { fractionDigits: 2 })} / ${formatNumber(target, { fractionDigits: 2, suffix: " zWETH" })}`}
              </span>
              {status !== EPresaleStatus.Active && (
                <span className="text-muted-foreground flex-shrink-0">({progress.toFixed(0)}%)</span>
              )}
            </div>
          </div>

          {status !== EPresaleStatus.Upcoming && status !== EPresaleStatus.Active && (
            <div className={`w-full bg-muted h-2 rounded-full overflow-hidden`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  status === EPresaleStatus.Completed
                    ? "bg-green-500"
                    : status === EPresaleStatus.Failed
                      ? "bg-red-500"
                      : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 border-t border-border mt-3 sm:mt-4">
            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {formatDistance(presale.startTime, presale.endTime, {
                    addSuffix: false,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span>{status === EPresaleStatus.Upcoming ? 0 : _.random(10, 1000)}</span>
              </div>
            </div>
            <Button size="sm" variant="default" asChild className="w-full sm:w-auto">
              <Link href={`/launchpad/${presale.presaleAddress}`}>View</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
