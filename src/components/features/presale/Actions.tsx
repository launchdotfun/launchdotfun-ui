import { EPresaleOnchainState, TPresale, usePresalePoolInfo } from "@/lib/presales/hooks";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useZamaPresaleContractWrite } from "@/lib/hooks/useContract";
import useZamaRelayerInstance from "@/lib/hooks/useZamaRelayerInstance";
import { toastTxSuccess } from "@/lib/toast";
import { getErrorMessage } from "@/lib/utils/error";
import { useMutation } from "@tanstack/react-query";
import { ethers } from "ethers";
import { toast } from "sonner";
import { useReadContract } from "wagmi";
import { LaunchDotFunPresale__factory } from "@/web3/contracts";
import { Address } from "viem";

export default function Actions({ launchpadData, address }: { launchpadData: TPresale; address: string }) {
  const presaleContract = useZamaPresaleContractWrite(launchpadData.presaleAddress);
  const relayerInstance = useZamaRelayerInstance();

  const poolQuery = usePresalePoolInfo(launchpadData.presaleAddress);
  console.debug("🚀 ~ Actions ~ poolQuery:", poolQuery.isFetching);

  const presaleState = poolQuery.data?.state;

  const isSaleEnded = new Date(launchpadData.endTime).getTime() < Date.now();

  const { data: hasSettled, refetch: refetchSettled } = useReadContract({
    address: launchpadData.presaleAddress as Address,
    abi: LaunchDotFunPresale__factory.abi,
    functionName: "settled",
    args: [address as Address],
    query: {
      enabled: !!address && presaleState === EPresaleOnchainState.FINALIZED,
      refetchInterval: 5000,
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) {
        throw new Error("Presale contract not available");
      }
      const tx = await presaleContract.claimTokens(address);
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error(`Error claiming tokens`, { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) {
        toastTxSuccess("Claim successful", tx.hash);
      } else {
        toast.success("Claim successful");
      }
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) {
        throw new Error("Presale contract not available");
      }
      if (!relayerInstance) {
        throw new Error("Relayer instance not available");
      }
      if (!poolQuery.data) {
        throw new Error("Pool info not available");
      }

      const poolInfo = poolQuery.data;
      const hardCap = BigInt(launchpadData.hardCap);
      const tokenPerEthWithDecimals = poolInfo.tokenPerEthWithDecimals;

      const ethRaisedEncrypted = poolInfo.ethRaisedEncrypted;
      if (!ethRaisedEncrypted || ethRaisedEncrypted === ethers.ZeroHash) {
        throw new Error("No encrypted eth raised data available");
      }

      const decryptResult = await relayerInstance.publicDecrypt([ethRaisedEncrypted]);
      const ethRaised = ((decryptResult as any)[ethRaisedEncrypted] || BigInt(0)) as bigint;

      if (ethRaised === BigInt(0)) {
        throw new Error("Failed to decrypt eth raised or no bids found");
      }

      const ethRaisedUsed = ethRaised <= hardCap ? ethRaised : hardCap;

      const tokensSold = ethRaisedUsed * tokenPerEthWithDecimals;

      const fillNumerator = ethRaisedUsed;
      const fillDenominator = ethRaised;

      const tx = await presaleContract.finalizePreSale(ethRaisedUsed, tokensSold, fillNumerator, fillDenominator);
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error(`Error finalizing presale`, { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) {
        toastTxSuccess("Presale finalized successfully", tx.hash);
      } else {
        toast.success("Presale finalized successfully");
      }
      poolQuery.refetch();
    },
  });

  const settleBidMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) {
        throw new Error("Presale contract not available");
      }
      const tx = await presaleContract.settleBid(address);
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error(`Error settling bid`, { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) {
        toastTxSuccess("Bid settled successfully", tx.hash);
      } else {
        toast.success("Bid settled successfully");
      }
      refetchSettled();
      poolQuery.refetch();
    },
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) {
        throw new Error("Presale contract not available");
      }
      const tx = await presaleContract.refund();
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error(`Error requesting refund`, { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) {
        toastTxSuccess("Refund requested successfully", tx.hash);
      } else {
        toast.success("Refund requested successfully");
      }
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-bold text-foreground">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={() => finalizeMutation.mutate()}
          loading={finalizeMutation.isPending}
          disabled={
            finalizeMutation.isPending ||
            finalizeMutation.isSuccess ||
            presaleState !== EPresaleOnchainState.ACTIVE ||
            !isSaleEnded ||
            !relayerInstance ||
            !poolQuery.data
          }
          loadingText="Finalizing..."
        >
          Request Finalization
        </Button>
        {presaleState === EPresaleOnchainState.FINALIZED && (
          <>
            {!hasSettled && (
              <Button
                className="w-full"
                loading={settleBidMutation.isPending}
                loadingText="Settling..."
                disabled={settleBidMutation.isPending || settleBidMutation.isSuccess}
                onClick={() => settleBidMutation.mutate()}
              >
                Settle Bid
              </Button>
            )}
            {hasSettled && (
              <Button
                className="w-full"
                loading={claimMutation.isPending}
                loadingText="Claiming..."
                disabled={claimMutation.isPending || claimMutation.isSuccess}
                onClick={() => claimMutation.mutate()}
              >
                Claim Tokens
              </Button>
            )}
          </>
        )}
        {presaleState === EPresaleOnchainState.CANCELED && (
          <Button
            className="w-full"
            onClick={() => refundMutation.mutate()}
            loading={refundMutation.isPending}
            disabled={refundMutation.isPending || refundMutation.isSuccess}
            loadingText="Refunding..."
          >
            Refund
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
