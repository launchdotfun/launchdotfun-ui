import { presaleApi } from "@/lib/presales/api";
import { EPresaleOnchainState } from "@/lib/presales/types";
import { TToken } from "@/lib/tokens/types";
import Button from "@/components/common/Button";
import { Button as UIButton } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useApproveCallback, { ApprovalState } from "@/lib/hooks/useApproveCallback";
import { usePresaleFactoryContractWrite } from "@/lib/hooks/useContract";
import useWeb3 from "@/lib/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import { Z_WETH9, ChainId } from "@/web3/core/constants";
import { Token } from "@/web3/core/entities";
import { getExplorerLink } from "@/web3/core/functions/explorer";
import { DialogProps } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits, isAddress, zeroAddress } from "viem";
import { FormData } from "./helpers";
import Link from "next/link";

export default function LaunchPresaleDialog({
  onOpenChange,
  open,
  erc20Info,
  launchpadData,
}: {
  open?: boolean;
  onOpenChange?: DialogProps["onOpenChange"];
  launchpadData: FormData;
  erc20Info: TToken;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Launch Presale</DialogTitle>
        </DialogHeader>

        <Content launchpadData={launchpadData} erc20Info={erc20Info} onClose={() => onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  launchpadData,
  erc20Info,
  onClose = () => {},
}: {
  launchpadData: FormData;
  erc20Info: TToken;
  onClose?: () => void;
}) {
  const { address, chainId } = useWeb3();
  const presaleFactoryContract = usePresaleFactoryContractWrite();
  const queryClient = useQueryClient();

  const ZWETH = Z_WETH9[chainId as ChainId];

  const [launchStep, setLaunchStep] = useState(1); // 1: Token Approve, 2: Confirmation
  const [deploymentStatus, setDeploymentStatus] = useState("pending"); // pending, loading, success, error
  const [transactionHash, setTransactionHash] = useState("");
  const [presaleAddress, setPresaleAddress] = useState("");
  const [_zTokenAddress, setZTokenAddress] = useState("");
  const [apiCallFailed, setApiCallFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [deploymentData, setDeploymentData] = useState<{
    presaleAddress: string;
    zTokenAddress: string;
    txHash: string;
  } | null>(null);

  const data = useMemo(() => {
    const tokenAddress = launchpadData.tokenAddress;
    const softCapInWei = parseUnits(launchpadData.softCap.toString(), ZWETH.decimals);
    const hardCapInWei = parseUnits(launchpadData.hardCap.toString(), ZWETH.decimals);
    const startTime = Math.floor(launchpadData.startDate.getTime() / 1000);
    const endTime = Math.floor(launchpadData.endDate.getTime() / 1000);

    const tokenForPresale = BigInt(
      new BigNumber(launchpadData.hardCap)
        .times(Math.pow(10, erc20Info!.decimals))
        .times(launchpadData.presaleRate)
        .toFixed(0)
    );

    return {
      tokenAddress,
      softCap: softCapInWei,
      hardCap: hardCapInWei,
      startTime,
      endTime,
      tokenForPresale,
      totalTokens: tokenForPresale,
      presaleRate: launchpadData.presaleRate,
    };
  }, [erc20Info, launchpadData, ZWETH]);

  const currency = useMemo(() => {
    return new Token(ChainId.SEPOLIA, erc20Info.address, erc20Info.decimals, erc20Info.symbol, erc20Info.name);
  }, [erc20Info]);

  const [approvalStatus, approve] = useApproveCallback({
    amountToApprove: data.totalTokens,
    currency,
    spender: presaleFactoryContract?.target,
    onReceipt: (tx) => {
      if (tx?.hash) {
        toastTxSuccess("Token approved successfully!", tx.hash);
      } else {
        toast.success("Token approved successfully!");
      }
    },
    onError: (error) => {
      console.error("Approval error:", error);
      toast.error("Token approval failed. Please try again.");
    },
  });

  const handleTokenApproval = async () => {
    await approve();
  };

  const handleConfirmDeployment = async () => {
    setDeploymentStatus("loading");
    try {
      if (!address) {
        toast.error("Please connect your wallet to create a launchpad.");
        return;
      }
      if (!presaleFactoryContract) {
        toast.error("Presale factory contract is not available. Please check your connection.");
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeBuffer = 60; // 60 seconds buffer for block time
      if (data.startTime < currentTime - timeBuffer) {
        throw new Error("Start time cannot be in the past. Please select a future date.");
      }
      if (data.endTime < currentTime - timeBuffer) {
        throw new Error("End time cannot be in the past. Please select a future date.");
      }
      if (data.endTime <= data.startTime) {
        throw new Error("End time must be after start time.");
      }

      const tx = await presaleFactoryContract.createLaunchDotFunPresale(data.tokenAddress, {
        tokenPresale: data.tokenForPresale,
        hardCap: data.hardCap,
        softCap: data.softCap,
        start: data.startTime,
        end: data.endTime,
      });
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }

      const eventFilter = presaleFactoryContract.filters.LaunchDotFunPresaleCreated(address);
      const events = await presaleFactoryContract.queryFilter(eventFilter, receipt.blockNumber, receipt.blockNumber);
      if (events.length === 0) {
        throw new Error("LaunchDotFunPresaleCreated event not found in transaction receipt");
      }
      const event = events.filter((e) => e.transactionHash === tx.hash).pop() || events[events.length - 1];
      const presaleAddress = event.args.presale;
      const zTokenAddress = event.args.ztoken;

      if (!presaleAddress || presaleAddress === zeroAddress || !isAddress(presaleAddress)) {
        throw new Error("Invalid presale address from contract event");
      }
      if (!zTokenAddress || zTokenAddress === zeroAddress || !isAddress(zTokenAddress)) {
        throw new Error("Invalid zToken address from contract event");
      }

      const deploymentInfo = {
        presaleAddress,
        zTokenAddress,
        txHash: tx.hash,
      };
      setDeploymentData(deploymentInfo);
      setTransactionHash(tx.hash);
      setPresaleAddress(presaleAddress);
      setZTokenAddress(zTokenAddress);

      let apiSuccess = false;
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await presaleApi.createPresale({
            token: erc20Info,
            softCap: data.softCap.toString(),
            hardCap: data.hardCap.toString(),
            presaleRate: data.presaleRate.toString(),
            tokensForSale: data.tokenForPresale.toString(),
            tokensForLiquidity: "0",
            liquidityPercent: 0,
            createdAt: new Date().toISOString(),
            startTime: new Date(data.startTime * 1000).toISOString(),
            endTime: new Date(data.endTime * 1000).toISOString(),
            description: launchpadData.description,
            social: {
              website: launchpadData.website,
              twitter: launchpadData.twitter,
              telegram: launchpadData.telegram,
            },
            name: launchpadData.tokenName,
            thumbnail: launchpadData.thumbnail,
            presaleAddress: presaleAddress,
            raisedAmount: "0",
            txHash: tx.hash,
            status: EPresaleOnchainState.ACTIVE,
            updatedAt: new Date().toISOString(),
            zTokenAddress: zTokenAddress,
            creator: address,
          });
          await queryClient.invalidateQueries({ queryKey: ["tokenList"] });
          apiSuccess = true;
          break;
        } catch (apiError) {
          lastError = apiError as Error;
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (!apiSuccess) {
        setApiCallFailed(true);
        toast.error("Contract deployed but failed to save data. You can retry saving the data.", {
          description: getErrorMessage(lastError),
          duration: 10000,
        });
        setDeploymentStatus("error");
        return;
      }

      toastTxSuccess("Launchpad created successfully!", tx.hash);
      setDeploymentStatus("success");
      setApiCallFailed(false);
    } catch (error) {
      console.error("Error submitting launchpad data:", error);
      toast.error("Failed to create launchpad", { description: getErrorMessage(error) });
      setDeploymentStatus("error");
    }
  };

  const resetDialog = () => {
    onClose();
  };

  const handleRetryApiCall = async () => {
    if (!deploymentData) {
      toast.error("No deployment data available for retry");
      return;
    }

    setIsRetrying(true);
    setApiCallFailed(false);
    try {
      await presaleApi.createPresale({
        token: erc20Info,
        softCap: data.softCap.toString(),
        hardCap: data.hardCap.toString(),
        presaleRate: data.presaleRate.toString(),
        tokensForSale: data.tokenForPresale.toString(),
        tokensForLiquidity: "0",
        liquidityPercent: 0,
        createdAt: new Date().toISOString(),
        startTime: new Date(data.startTime * 1000).toISOString(),
        endTime: new Date(data.endTime * 1000).toISOString(),
        description: launchpadData.description,
        social: {
          website: launchpadData.website,
          twitter: launchpadData.twitter,
          telegram: launchpadData.telegram,
        },
        name: launchpadData.tokenName,
        thumbnail: launchpadData.thumbnail,
        presaleAddress: deploymentData.presaleAddress,
        raisedAmount: "0",
        txHash: deploymentData.txHash,
        status: EPresaleOnchainState.ACTIVE,
        updatedAt: new Date().toISOString(),
        zTokenAddress: deploymentData.zTokenAddress,
        creator: address!,
      });
      await queryClient.invalidateQueries({ queryKey: ["tokenList"] });
      toastTxSuccess("Launchpad data saved successfully!", deploymentData.txHash);
      setDeploymentStatus("success");
      setApiCallFailed(false);
      setIsRetrying(false);
    } catch (error) {
      console.error("Error retrying API call:", error);
      toast.error("Failed to save launchpad data", { description: getErrorMessage(error) });
      setApiCallFailed(true);
      setDeploymentStatus("error");
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (approvalStatus === ApprovalState.APPROVED) {
      setLaunchStep(2);
    }
  }, [approvalStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans shadow-sm",
              launchStep >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}
          >
            1
          </div>
          <span className={cn("text-sm font-medium", launchStep >= 1 ? "text-foreground" : "text-muted-foreground")}>
            Token Approve
          </span>
        </div>

        <div className={cn("w-12 h-px", launchStep >= 2 ? "bg-primary" : "bg-muted")} />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans shadow-sm",
              launchStep >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}
          >
            2
          </div>
          <span className={cn("text-sm font-medium", launchStep >= 2 ? "text-foreground" : "text-muted-foreground")}>
            Confirmation
          </span>
        </div>
      </div>

      {launchStep === 1 && (
        <div className="space-y-4">
          <div className="bg-muted/50 border border-border p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">Token Approval Required</h3>
            <p className="text-xs text-muted-foreground mb-3">
              You need to approve the smart contract to spend your tokens for the presale.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token:</span>
                <span className="text-foreground font-mono font-semibold">{launchpadData.tokenSymbol || "TOKEN"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-foreground font-mono font-semibold">
                  {formatNumber(formatUnits(data.totalTokens, erc20Info.decimals))} {erc20Info.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Fee:</span>
                <span className="text-foreground font-mono font-semibold">~0.0001 ETH</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleTokenApproval}
            disabled={
              approvalStatus === ApprovalState.PENDING ||
              approvalStatus === ApprovalState.UNKNOWN ||
              approvalStatus === ApprovalState.APPROVED
            }
            className="w-full"
            loading={approvalStatus === ApprovalState.PENDING}
            loadingText="Approving..."
          >
            {approvalStatus === ApprovalState.APPROVED ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved
              </>
            ) : (
              "Approve Tokens"
            )}
          </Button>
        </div>
      )}

      {launchStep === 2 && (
        <div className="space-y-4">
          <div className="bg-muted/50 border border-border p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">Confirm Presale Launch</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Review your presale details and confirm the deployment.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token:</span>
                <span className="text-foreground font-mono font-semibold">
                  {launchpadData.tokenName || "Token Name"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soft Cap:</span>
                <span className="text-foreground font-mono font-semibold">
                  {formatNumber(launchpadData.softCap, { fractionDigits: 6 }) || "0"} {ZWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hard Cap:</span>
                <span className="text-foreground font-mono font-semibold">
                  {formatNumber(launchpadData.hardCap, { fractionDigits: 6 }) || "0"} {ZWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Presale Rate:</span>
                <span className="text-foreground font-mono font-semibold">
                  {formatNumber(launchpadData.presaleRate, { fractionDigits: 6 }) || "0"} {erc20Info.symbol}/
                  {ZWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee:</span>
                <span className="text-foreground font-mono font-semibold">0%</span>
              </div>
            </div>
          </div>

          {deploymentStatus === "success" && (
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">Presale Launched Successfully!</span>
              </div>
              <div className="text-xs text-neutral-400 break-all">
                Transaction:
                <a
                  href={getExplorerLink(chainId, transactionHash, "transaction")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-green-400 font-mono text-xs underline hover:text-green-300"
                >
                  {transactionHash}
                </a>
              </div>
            </div>
          )}

          {deploymentStatus === "error" && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {apiCallFailed
                    ? "Contract deployed but failed to save data. You can retry saving."
                    : "Deployment failed. Please try again."}
                </span>
              </div>
              {apiCallFailed && deploymentData && (
                <div className="mt-2">
                  <div className="text-xs text-neutral-400 break-all mb-2">
                    Transaction:{" "}
                    <a
                      href={getExplorerLink(chainId, deploymentData.txHash, "transaction")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 font-mono text-xs underline hover:text-red-300"
                    >
                      {deploymentData.txHash}
                    </a>
                  </div>
                  <Button
                    onClick={handleRetryApiCall}
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white"
                    disabled={isRetrying}
                    loading={isRetrying}
                    loadingText="Retrying..."
                  >
                    Retry Save Data
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetDialog}
              className="flex-1 border-border text-muted-foreground hover:bg-muted bg-transparent"
            >
              Cancel
            </Button>
            {deploymentStatus === "success" && presaleAddress ? (
              <UIButton asChild className="flex-1 bg-primary hover:bg-primary/80 text-black font-semibold">
                <Link href={`/launchpad/${presaleAddress}`}>View Presale</Link>
              </UIButton>
            ) : (
              <Button
                onClick={handleConfirmDeployment}
                disabled={deploymentStatus === "loading" || deploymentStatus === "success"}
                className="flex-1 bg-primary hover:bg-primary/80 text-black font-semibold"
                loading={deploymentStatus === "loading"}
                loadingText="Deploying..."
              >
                {deploymentStatus === "success" ? "Completed" : "Confirm Launch"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
