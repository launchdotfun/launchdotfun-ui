import { TPresale } from "@/lib/presales/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEthersSigner } from "@/lib/hooks/useEthersSigner";
import useZamaRelayerInstance from "@/lib/hooks/useZamaRelayerInstance";
import { formatNumber } from "@/lib/utils/format";
import { LaunchDotFunPresale__factory } from "@/web3/contracts";
import { Token } from "@/web3/core/entities";
import { useMutation } from "@tanstack/react-query";
import { ethers } from "ethers";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Address, formatUnits } from "viem";
import { usePublicClient } from "wagmi";

interface ContributionInfoProps {
  launchpadData: TPresale;
  ZWETH: Token;
  address: string;
}

export default function ContributionInfo({ launchpadData, ZWETH, address }: ContributionInfoProps) {
  const publicClient = usePublicClient();
  const signer = useEthersSigner();
  const relayerInstance = useZamaRelayerInstance();

  const [isRevealed, setIsRevealed] = useState(false);

  const {
    data,
    isPending: isInfoLoading,
    mutateAsync: fetchInfo,
  } = useMutation({
    mutationFn: async () => {
      if (!publicClient || !address || !relayerInstance || !signer) {
        throw new Error("Invalid parameters");
      }
      const presaleAddress = launchpadData.presaleAddress as Address;
      const [cipherContributions, cipherClaimableTokens] = await publicClient.multicall({
        contracts: [
          {
            abi: LaunchDotFunPresale__factory.abi,
            address: presaleAddress,
            functionName: "contributions",
            args: [address as Address],
          },
          {
            abi: LaunchDotFunPresale__factory.abi,
            address: presaleAddress,
            functionName: "claimableTokens",
            args: [address as Address],
          },
        ],
        allowFailure: false,
      });
      let contributionAmount = BigInt(0);
      let claimableTokensAmount = BigInt(0);

      if (cipherContributions !== ethers.ZeroHash || cipherClaimableTokens !== ethers.ZeroHash) {
        const handlesToDecrypt: string[] = [];
        if (cipherContributions !== ethers.ZeroHash) {
          handlesToDecrypt.push(cipherContributions);
        }
        if (cipherClaimableTokens !== ethers.ZeroHash) {
          handlesToDecrypt.push(cipherClaimableTokens);
        }

        if (handlesToDecrypt.length > 0) {
          const result = await relayerInstance.publicDecrypt(handlesToDecrypt);
          if (cipherContributions !== ethers.ZeroHash) {
            contributionAmount = ((result as any)[cipherContributions] || BigInt(0)) as bigint;
          }
          if (cipherClaimableTokens !== ethers.ZeroHash) {
            claimableTokensAmount = ((result as any)[cipherClaimableTokens] || BigInt(0)) as bigint;
          }
        }
      }
      return {
        contributedAmount: contributionAmount,
        claimableTokens: claimableTokensAmount,
      };
    },
    onError: (error) => {
      console.error("Error fetching contribution data:", error);
      toast.error("Failed to fetch contribution data. Please try again.");
      setIsRevealed(false);
    },
    onSuccess: () => {
      setIsRevealed(true);
    },
  });

  const contributedAmount = data?.contributedAmount;

  const formatContributedAmount = () => {
    if (data?.contributedAmount === BigInt(0)) return "0";
    return formatNumber(data?.contributedAmount ? formatUnits(data?.contributedAmount, ZWETH.decimals) : 0, {
      fractionDigits: ZWETH.decimals,
    });
  };

  const formatClaimableTokens = () => {
    if (data?.claimableTokens === BigInt(0)) return "0";
    return formatNumber(data?.claimableTokens ? formatUnits(data?.claimableTokens, 9) : 0, {
      fractionDigits: 6,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">Your Contribution</CardTitle>
          <button
            onClick={() => {
              if (!isRevealed) {
                fetchInfo();
              } else {
                setIsRevealed(false);
              }
            }}
            className="p-2 hover:bg-muted transition-colors rounded-lg"
            aria-label={isRevealed ? "Hide contribution details" : "Show contribution details"}
          >
            {isRevealed ? (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isRevealed ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Contributed Amount</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground font-sans">{formatContributedAmount()}</div>
                <div className="text-xs text-muted-foreground font-sans">{ZWETH.symbol}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Claimable Tokens</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground font-sans">{formatClaimableTokens()}</div>
                <div className="text-xs text-muted-foreground font-sans">{launchpadData.token.symbol}</div>
              </div>
            </div>

            {contributedAmount != undefined && contributedAmount > BigInt(0) && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Share</span>
                  <span className="text-foreground">
                    {(
                      (Number(formatUnits(contributedAmount, ZWETH.decimals)) /
                        Number(formatUnits(BigInt(launchpadData.hardCap), ZWETH.decimals))) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : isInfoLoading ? (
          <div className="flex items-center justify-center py-8 flex-col gap-1">
            <Loader2 className="size-5 animate-spin" />
            <p className="text-sm">Loading your contribution info...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center mx-auto mb-3 rounded-lg shadow-sm">
                <Eye className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Click the eye icon to view your contribution details</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
