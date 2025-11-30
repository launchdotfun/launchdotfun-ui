import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Rocket, TrendingUp, Users } from "lucide-react";
import { usePresaleStats } from "@/lib/presales/hooks";
import { formatNumber, type FormatNumberOptions } from "@/lib/utils/format";

export default function StatsOverview() {
  const { stats, isLoading, isFetching } = usePresaleStats();

  const formatStat = (value: number, options?: FormatNumberOptions<string>) =>
    formatNumber<string>(value || 0, options);

  const isBusy = isLoading || isFetching;
  const loadingPlaceholder = isBusy ? "--" : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider mb-2">TOTAL RAISED</p>
              <p className="text-3xl font-bold text-primary font-sans">
                {loadingPlaceholder ?? `${formatStat(stats.totalRaised, { fractionDigits: 2 })} ETH`}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary shadow-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider mb-2">ACTIVE LAUNCHES</p>
              <p className="text-3xl font-bold text-primary font-sans">
                {loadingPlaceholder ?? formatStat(stats.activeLaunches)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary shadow-sm">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider mb-2">TOTAL PRESALES</p>
              <p className="text-3xl font-bold text-primary font-sans">
                {loadingPlaceholder ?? formatStat(stats.totalPresales)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent shadow-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider mb-2">SUCCESS RATE</p>
              <p className="text-3xl font-bold text-primary font-sans">
                {loadingPlaceholder ?? `${formatStat(stats.successRate, { fractionDigits: 0 })}%`}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 shadow-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
