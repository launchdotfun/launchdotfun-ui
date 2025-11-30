import Input from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useZamaWETHContractWrite } from "@/lib/hooks/useContract";
import useWeb3 from "@/lib/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import { getExplorerLink } from "@/web3/core/functions/explorer";
import BigNumber from "bignumber.js";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useBalance } from "wagmi";

export default function WrapTabContent() {
  const { address, chainId } = useWeb3();
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
  });

  const zWETHContract = useZamaWETHContractWrite();

  const [transactionHash, setTransactionHash] = useState("0xabc");
  const [wrapAmount, setWrapAmount] = useState("");
  const [wrapStatus, setWrapStatus] = useState("pending");

  const handleWrapETH = async () => {
    if (!wrapAmount || Number.parseFloat(wrapAmount) <= 0) return;

    setWrapStatus("loading");

    try {
      if (!zWETHContract) {
        throw new Error("zWETH contract not available");
      }
      if (!address) {
        throw new Error("Wallet address not connected");
      }
      const tx = await zWETHContract.deposit(address, {
        value: parseEther(new BigNumber(wrapAmount).toFixed(9, BigNumber.ROUND_DOWN)),
      });
      await tx.wait();
      toastTxSuccess("ETH Wrapped Successfully!", tx.hash);
      setTransactionHash(tx.hash);
      setWrapStatus("success");
      refetchEthBalance();
    } catch (error) {
      setWrapStatus("error");
      toast.error("Wrapping failed. Please try again.");
      console.error("Wrap error:", error);
    }
  };

  const setMaxAmount = () => {
    const maxAmountCanWrap = new BigNumber(ethBalance?.formatted || "0").minus(0.01).toFixed();
    setWrapAmount(maxAmountCanWrap);
  };

  const receiveAmount = wrapAmount
    ? new BigNumber(wrapAmount).toFixed(9, BigNumber.ROUND_DOWN).replace(/\.?0+$/, "")
    : "0";

  return (
    <TabsContent value="wrap" className="space-y-4">
      <div className="bg-neutral-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-400">Amount to Wrap</span>
          <Button
            variant="link"
            onClick={setMaxAmount}
            className="text-primary text-xs p-0 h-auto hover:text-yellow-500"
          >
            MAX
          </Button>
        </div>
        <div className="relative">
          <Input.Number
            autoFocus
            placeholder="0.0"
            value={wrapAmount}
            onChange={(e) => setWrapAmount(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white text-right pr-16 text-lg font-mono"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-sm text-white font-medium">ETH</span>
          </div>
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          You will receive: <span className="text-primary font-mono">{receiveAmount} zWETH</span>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/30 p-3">
        <div className="text-xs text-primary mb-1">ℹ️ About zWETH</div>
        <div className="text-xs text-neutral-300">
          zWETH is the confidential WETH token. It is a wrapped version of ETH that enables private transactions and can
          be used in DeFi protocols.
          <br />1 ETH = 1 zWETH always.
        </div>
      </div>

      {wrapStatus === "success" && (
        <div className="bg-green-500/10 border border-green-500/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">ETH Wrapped Successfully!</span>
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

      {wrapStatus === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">Wrapping failed. Please try again.</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleWrapETH}
        disabled={wrapStatus === "loading" || !wrapAmount || Number.parseFloat(wrapAmount) <= 0}
        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
      >
        {wrapStatus === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Wrapping...
          </>
        ) : (
          "Wrap ETH to zWETH"
        )}
      </Button>
    </TabsContent>
  );
}
