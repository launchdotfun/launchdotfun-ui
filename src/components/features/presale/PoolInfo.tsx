import { TPresale } from "@/lib/presales/types";
import { CopyButton } from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import { Token } from "@/web3/core/entities";
import { format } from "date-fns";
import { formatUnits } from "viem";

export default function PoolInfo({ launchpadData, ZWETH }: { launchpadData: TPresale; ZWETH: Token }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Pool Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:hidden">
          {/* Mobile: Stack vertically */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Address</div>
            <div className="flex items-center gap-2">
              <div className="bg-muted px-2 py-1 border border-border text-primary text-xs truncate min-w-0 rounded-lg shadow-sm flex-1">
                {launchpadData.presaleAddress}
              </div>
              <CopyButton text={launchpadData.presaleAddress} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">zToken Address</div>
            <div className="flex items-center gap-2">
              <div className="bg-muted px-2 py-1 border border-border text-primary text-xs truncate min-w-0 rounded-lg shadow-sm flex-1">
                {launchpadData.zTokenAddress}
              </div>
              <CopyButton text={launchpadData.zTokenAddress} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Tokens For Presale</div>
            <div className="text-xs text-foreground">
              {formatNumber(formatUnits(BigInt(launchpadData.tokensForSale), launchpadData.token.decimals))}{" "}
              {launchpadData.token.symbol}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Tokens For Liquidity</div>
            <div className="text-xs text-foreground">
              {formatNumber(formatUnits(BigInt(launchpadData.tokensForLiquidity), launchpadData.token.decimals))}{" "}
              {launchpadData.token.symbol}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Soft Cap</div>
            <div className="text-xs text-foreground">
              {formatNumber(formatUnits(BigInt(launchpadData.softCap), ZWETH.decimals), {
                fractionDigits: ZWETH.decimals,
              })}{" "}
              {ZWETH.symbol}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Hard Cap</div>
            <div className="text-xs text-foreground">
              {formatNumber(formatUnits(BigInt(launchpadData.hardCap), ZWETH.decimals), {
                fractionDigits: ZWETH.decimals,
              })}{" "}
              {ZWETH.symbol}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Start Time</div>
            <div className="text-xs text-foreground">{format(launchpadData.startTime, "PPpp")}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">End Time</div>
            <div className="text-xs text-foreground">{format(launchpadData.endTime, "PPpp")}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Listing On</div>
            <div className="text-xs">
              <span className="text-primary font-medium">Uniswap</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium">Liquidity Percent</div>
            <div className="text-xs text-foreground">{Number(launchpadData.liquidityPercent) / 100}%</div>
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
                      {launchpadData.presaleAddress}
                    </div>
                    <CopyButton text={launchpadData.presaleAddress} />
                  </div>
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium w-1/3">zToken Address</td>
                <td className="py-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted px-2 py-1 border border-border text-primary text-sm truncate min-w-0 rounded-lg shadow-sm">
                      {launchpadData.zTokenAddress}
                    </div>
                    <CopyButton text={launchpadData.zTokenAddress} />
                  </div>
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Tokens For Presale</td>
                <td className="py-3 text-sm text-foreground">
                  {formatNumber(formatUnits(BigInt(launchpadData.tokensForSale), launchpadData.token.decimals))}{" "}
                  {launchpadData.token.symbol}
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Tokens For Liquidity</td>
                <td className="py-3 text-sm text-foreground">
                  {formatNumber(formatUnits(BigInt(launchpadData.tokensForLiquidity), launchpadData.token.decimals))}{" "}
                  {launchpadData.token.symbol}
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Soft Cap</td>
                <td className="py-3 text-sm text-foreground">
                  {formatNumber(formatUnits(BigInt(launchpadData.softCap), ZWETH.decimals), {
                    fractionDigits: ZWETH.decimals,
                  })}{" "}
                  {ZWETH.symbol}
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Hard Cap</td>
                <td className="py-3 text-sm text-foreground">
                  {formatNumber(formatUnits(BigInt(launchpadData.hardCap), ZWETH.decimals), {
                    fractionDigits: ZWETH.decimals,
                  })}{" "}
                  {ZWETH.symbol}
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Start Time</td>
                <td className="py-3 text-sm text-foreground">{format(launchpadData.startTime, "PPpp")}</td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">End Time</td>
                <td className="py-3 text-sm text-foreground">{format(launchpadData.endTime, "PPpp")}</td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Listing On</td>
                <td className="py-3 text-sm">
                  <span className="text-primary font-medium">Uniswap</span>
                </td>
              </tr>
              <tr className="">
                <td className="py-3 pr-4 text-sm text-muted-foreground font-medium">Liquidity Percent</td>
                <td className="py-3 text-sm text-foreground">{Number(launchpadData.liquidityPercent) / 100}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
