import { TToken } from "@/lib/tokens/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Clock, DollarSign, Rocket, Target } from "lucide-react";

export default function PresalePreview({
  launchpadData,
  erc20Info,
}: {
  launchpadData: {
    softCap?: number;
    hardCap?: number;
    startDate?: Date;
    endDate?: Date;
    liquidityLockup?: number;
  };
  erc20Info?: TToken;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Presale Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted/50 border border-border rounded-lg shadow-sm">
          <div className="flex justify-center mb-3">
            <Avatar className="size-16">
              <AvatarImage src={erc20Info?.icon || undefined} alt={erc20Info?.name} />
              <AvatarFallback className="bg-primary text-white">
                <Rocket className="w-8 h-8 text-white" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-foreground font-bold">{erc20Info?.name || "Token Name"}</h3>
          <p className="text-muted-foreground text-sm">{erc20Info?.symbol || "SYMBOL"}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Soft Cap:</span>
            <span className="text-foreground font-semibold">{launchpadData.softCap || "0"} zWETH</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Hard Cap:</span>
            <span className="text-foreground font-semibold">{launchpadData.hardCap || "0"} zWETH</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-foreground font-semibold">
              {launchpadData.startDate && launchpadData.endDate
                ? formatDistance(launchpadData.startDate, launchpadData.endDate, {
                    addSuffix: false,
                  })
                : "Not set"}
            </span>
          </div>
          {/* <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-neutral-400">Liquidity Lock:</span>
            <span className="text-white">{launchpadData?.liquidityLockup || 0} days</span>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
