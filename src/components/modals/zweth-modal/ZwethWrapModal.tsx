import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useZWETHBalanceMutation } from "@/lib/hooks/useBalance";
import useWeb3 from "@/lib/hooks/useWeb3";
import { useZwethWrapModal } from "@/lib/state/modal/zweth-wrap";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBalance, usePublicClient } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { useEthersSigner } from "@/lib/hooks/useEthersSigner";
import useZamaRelayerInstance from "@/lib/hooks/useZamaRelayerInstance";
import { Z_WETH9, ChainId } from "@/web3/core/constants";
import UnWrapTabContent from "./UnWrapTabContent";
import WrapTabContent from "./WrapTabContent";

export default function ZwethWrapModal() {
  const { address, chainId } = useWeb3();
  const { open, setModalOpen } = useZwethWrapModal();

  const [showZwethBalance, setShowZwethBalance] = useState(false);

  const zWETH = Z_WETH9[chainId as ChainId];
  const signer = useEthersSigner({ chainId });
  const publicClient = usePublicClient({ chainId });
  const relayerInstance = useZamaRelayerInstance();

  console.debug("🔍 [ZwethWrapModal] Dependencies check:", {
    hasAddress: !!address,
    address,
    hasChainId: !!chainId,
    chainId,
    chainIdType: typeof chainId,
    ChainId_SEPOLIA: ChainId.SEPOLIA,
    ChainId_SEPOLIA_Type: typeof ChainId.SEPOLIA,
    chainIdMatches: chainId === ChainId.SEPOLIA,
    hasZWETH: !!zWETH,
    zWETH: zWETH ? zWETH : null,
    availableChainIds: Object.keys(Z_WETH9),
    availableChainIdsValues: Object.keys(Z_WETH9).map((key) => ({ key, value: Z_WETH9[key as ChainId] })),
    Z_WETH9_keys: Object.keys(Z_WETH9),
    Z_WETH9_direct_access: Z_WETH9[chainId as ChainId],
    hasSigner: !!signer,
    signerType: signer ? typeof signer : "null",
    hasPublicClient: !!publicClient,
    publicClientType: publicClient ? typeof publicClient : "null",
    hasRelayerInstance: !!relayerInstance,
    relayerInstance: relayerInstance ? "exists" : "null/undefined",
    isReady: Boolean(address && zWETH && signer && publicClient && relayerInstance),
    missingDeps: {
      address: !address,
      zWETH: !zWETH,
      signer: !signer,
      publicClient: !publicClient,
      relayerInstance: !relayerInstance,
    },
  });

  const isReady = Boolean(address && zWETH && signer && publicClient && relayerInstance);

  const {
    data: zWETHBalance,
    isPending,
    mutateAsync: fetchZwethBalance,
  } = useZWETHBalanceMutation(address, {
    onError: (error) => {
      console.error("Error fetching zWETH balance:", error);
      toast.error("Failed to fetch zWETH balance.", { description: getErrorMessage(error) });
      setShowZwethBalance(false);
    },
  });

  const { data: ethBalance } = useBalance({
    address: address,
  });

  return (
    <Dialog open={open} onOpenChange={setModalOpen}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-white" />
            </div>
            zWETH Wrapper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 border border-border p-3 rounded-lg shadow-sm">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">ETH BALANCE</div>
              <div className="text-lg font-bold text-foreground font-mono">
                {formatNumber(ethBalance?.formatted, { fractionDigits: 5 })}
              </div>
            </div>
            <div className="bg-muted/50 border border-border p-3 rounded-lg shadow-sm">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">zWETH BALANCE</div>
              <div className="text-lg font-bold text-primary font-mono flex items-center gap-2">
                <div className="flex-1">
                  {showZwethBalance ? (
                    <>
                      {isPending ? (
                        <div className="animate-pulse h-6 bg-muted w-30 rounded" />
                      ) : (
                        formatNumber(zWETHBalance?.formatted, { fractionDigits: 5 })
                      )}
                    </>
                  ) : (
                    "••••••"
                  )}
                </div>
                {showZwethBalance ? (
                  <Tooltip>
                    <TooltipTrigger onClick={() => setShowZwethBalance(false)}>
                      <EyeOff className="w-5 h-5 text-neutral-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-sm font-medium">Hide balance</span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger
                      onClick={async () => {
                        console.debug("🔍 [ZwethWrapModal] Eye icon clicked, checking readiness...");
                        if (!isReady) {
                          const missingDeps = {
                            address: !address,
                            zWETH: !zWETH,
                            signer: !signer,
                            publicClient: !publicClient,
                            relayerInstance: !relayerInstance,
                          };
                          console.error("❌ [ZwethWrapModal] Not ready, missing dependencies:", missingDeps);
                          console.error("❌ [ZwethWrapModal] Detailed dependency status:", {
                            address: address || "MISSING",
                            chainId: chainId || "MISSING",
                            zWETH: zWETH || "MISSING",
                            signer: signer ? "EXISTS" : "MISSING",
                            publicClient: publicClient ? "EXISTS" : "MISSING",
                            relayerInstance: relayerInstance ? "EXISTS" : "MISSING",
                            windowRelayerSDK: !!window.relayerSDK,
                          });

                          let errorDescription = "Required dependencies are not ready. Please try again.";
                          if (!address) {
                            errorDescription = "Please connect your wallet";
                          } else if (!chainId) {
                            errorDescription = "Please switch to a supported network";
                          } else if (!zWETH) {
                            errorDescription = `zWETH is not available for network ${chainId}. Please switch to a supported network.`;
                          } else if (!signer) {
                            errorDescription = "Wallet signer is not available. Please try reconnecting your wallet.";
                          } else if (!publicClient) {
                            errorDescription = "Public client is not available. Please try refreshing the page.";
                          } else if (!relayerInstance) {
                            errorDescription = "Launch relayer is initializing. Please wait a moment and try again.";
                          }

                          toast.error("Unable to fetch balance", {
                            description: errorDescription,
                          });
                          return;
                        }
                        try {
                          await fetchZwethBalance();
                          setShowZwethBalance(true);
                        } catch (_error) {}
                      }}
                    >
                      <Eye className="w-5 h-5 text-neutral-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-sm font-medium">Reveal balance</span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="wrap" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="wrap" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Wrap ETH
              </TabsTrigger>
              <TabsTrigger value="unwrap" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Unwrap zWETH
              </TabsTrigger>
            </TabsList>

            <WrapTabContent />

            <UnWrapTabContent />
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
