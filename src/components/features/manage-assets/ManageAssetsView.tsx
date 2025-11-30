"use client";

import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useWeb3 from "@/lib/hooks/useWeb3";
import { useCreatorTokensQuery, TManageableToken } from "@/lib/tokens/hooks";
import { cn } from "@/lib/utils";
import { formatUnits } from "viem";

const usageBadgeStyles: Record<TManageableToken["usageStatus"], string> = {
  Available: "border-emerald-200/60 text-emerald-500 bg-emerald-500/10",
  Used: "border-slate-200/60 text-slate-500 bg-slate-500/10",
};

function truncateAddress(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatTokenSupply(token: TManageableToken) {
  if (!token.totalSupply) return "—";
  try {
    const formatted = Number(formatUnits(BigInt(token.totalSupply), token.decimals ?? 18));
    if (Number.isFinite(formatted)) {
      return formatted.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  } catch {}
  return token.totalSupply;
}

export function ManageAssetsView() {
  const { address } = useWeb3();
  const normalizedAddress = address?.toLowerCase();

  const tokenQuery = useCreatorTokensQuery(normalizedAddress, {
    enabled: !!normalizedAddress,
    refetchInterval: 45_000,
  });

  const tokens = tokenQuery.data ?? [];
  const tokenCount = tokens.length;
  const usedTokenCount = tokens.filter((token) => token.usageStatus === "Used").length;
  const availableTokenCount = tokens.filter((token) => token.usageStatus === "Available").length;

  return (
    <section className="space-y-8 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Your Tokens</h1>
          <p className="text-muted-foreground">
            Review tokens minted from this wallet, check usage, and launch presales directly from each asset.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/create-token" className="gap-1">
              Create token
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/create-launchpad" className="gap-1">
              Launch presale
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      {!normalizedAddress ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect a wallet to continue</CardTitle>
            <CardDescription>
              We look up tokens by creator address. Connect your wallet using the button in the header to load your
              data.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard label="Total tokens" value={tokenCount} />
            <SummaryCard label="Available" value={availableTokenCount} accent="text-emerald-300" />
            <SummaryCard label="Linked" value={usedTokenCount} accent="text-slate-300" />
          </div>
          <TokenGrid tokens={tokens} isLoading={tokenQuery.isLoading || tokenQuery.isFetching} />
        </>
      )}
    </section>
  );
}

type TokenGridProps = {
  tokens: TManageableToken[];
  isLoading: boolean;
};

function TokenGrid({ tokens, isLoading }: TokenGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading tokens...
      </div>
    );
  }

  if (!tokens.length) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground border rounded-2xl border-border/60 bg-card/60">
        <p className="font-semibold">No tokens found yet.</p>
        <p className="text-sm">Spin up a token to see it listed here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <Card
          key={token.address}
          className="border-border/70 bg-card/70 backdrop-blur-sm shadow-sm flex flex-col gap-4 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold tracking-tight">{token.name}</div>
              <p className="text-xs text-muted-foreground">{truncateAddress(token.address)}</p>
            </div>
            <Badge variant="outline" className={cn("capitalize", usageBadgeStyles[token.usageStatus])}>
              {token.usageStatus}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Symbol</p>
            <p className="text-base text-foreground font-semibold">{token.symbol}</p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Total supply</p>
            <p className="text-base text-foreground font-semibold">{formatTokenSupply(token)}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {token.usageStatus === "Available" ? (
              <Button variant="outline" size="sm" className="flex-1 min-w-[120px]" asChild>
                <Link href={`/create-launchpad?token=${token.address}`} className="gap-1">
                  Launch presale
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground">Linked to a presale</div>
            )}
            <Button variant="ghost" size="sm" className="flex-1 min-w-[120px]" asChild>
              <Link href={`/create-token?prefill=${token.address}`} className="gap-1">
                Duplicate
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur-sm shadow-sm">
      <CardContent className="py-5 flex flex-col gap-2">
        <span className="text-xs uppercase text-muted-foreground font-semibold">{label}</span>
        <span className={cn("text-3xl font-semibold tracking-tight", accent)}>{value}</span>
      </CardContent>
    </Card>
  );
}

export default ManageAssetsView;
