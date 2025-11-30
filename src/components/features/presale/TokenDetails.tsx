import { TPresale } from "@/lib/presales/types";
import { CopyButton } from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import { formatUnits } from "viem";

export default function TokenDetails({ launchpadData }: { launchpadData: TPresale }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Token</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:hidden">
          {/* Mobile: Stack vertically */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Address</div>
            <div className="flex items-center gap-2">
              <div className="bg-muted px-2 py-1 border border-border text-primary text-xs truncate min-w-0 rounded-lg shadow-sm flex-1">
                {launchpadData.token.address}
              </div>
              <CopyButton text={launchpadData.token.address} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Name</div>
            <div className="text-xs text-foreground font-medium">{launchpadData.token.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Symbol</div>
            <div className="text-xs text-foreground font-medium">{launchpadData.token.symbol}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Decimals</div>
            <div className="text-xs text-foreground">{launchpadData.token.decimals}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Total Supply</div>
            <div className="text-xs text-foreground">
              {formatNumber(formatUnits(BigInt(launchpadData.token.totalSupply), launchpadData.token.decimals))}
            </div>
          </div>
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-border">
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium w-1/3">Address</td>
                <td className="py-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted px-2 py-1 border border-border text-primary text-sm truncate min-w-0 rounded-lg shadow-sm">
                      {launchpadData.token.address}
                    </div>
                    <CopyButton text={launchpadData.token.address} />
                  </div>
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Name</td>
                <td className="py-3 text-sm text-foreground font-medium">{launchpadData.token.name}</td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Symbol</td>
                <td className="py-3 text-sm text-foreground font-medium">{launchpadData.token.symbol}</td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Decimals</td>
                <td className="py-3 text-sm text-foreground">{launchpadData.token.decimals}</td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Total Supply</td>
                <td className="py-3 text-sm text-foreground">
                  {formatNumber(formatUnits(BigInt(launchpadData.token.totalSupply), launchpadData.token.decimals))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
