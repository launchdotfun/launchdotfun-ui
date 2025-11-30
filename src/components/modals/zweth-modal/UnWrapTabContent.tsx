import Input from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function UnWrapTabContent() {
  const [wrapAmount, setWrapAmount] = useState("");
  const [wrapStatus, setWrapStatus] = useState("pending");
  const [_transactionHash, _setTransactionHash] = useState("");
  const [_ethBalance, _setEthBalance] = useState("2.5847");
  const [_zwethBalance, _setZwethBalance] = useState("0.0000");

  const handleUnwrapETH = async () => {
    if (!wrapAmount || Number.parseFloat(wrapAmount) <= 0) return;

    // TODO: Implement unwrap functionality using zWETH contract
    // This will require using withdrawAndFinalize with encrypted amounts and proofs
    // For now, this feature is disabled (Coming Soon)
    setWrapStatus("loading");

    try {
      // Implementation pending - unwrap requires confidential token handling
      // const zWETHContract = useZamaWETHContractWrite();
      // const tx = await zWETHContract.withdrawAndFinalize(...);
      // await tx.wait();
      // setTransactionHash(tx.hash);
      // setWrapStatus("success");

      throw new Error("Unwrap functionality not yet implemented");
    } catch (_error) {
      setWrapStatus("error");
    }
  };

  const setMaxAmount = (isWrap: boolean) => {
    if (isWrap) {
      const maxWrap = Math.max(0, Number.parseFloat(_ethBalance) - 0.01);
      setWrapAmount(maxWrap.toFixed(4));
    } else {
      setWrapAmount(_zwethBalance);
    }
  };

  return (
    <TabsContent value="unwrap" className="space-y-4">
      <div className="bg-neutral-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-400">Amount to Unwrap</span>
          <Button
            variant="link"
            onClick={() => setMaxAmount(false)}
            className="text-primary text-xs p-0 h-auto hover:text-yellow-500"
          >
            MAX
          </Button>
        </div>
        <div className="relative">
          <Input
            placeholder="0.0"
            value={wrapAmount}
            onChange={(e) => setWrapAmount(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white text-right pr-20 text-lg font-mono"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-sm text-primary font-medium">zWETH</span>
          </div>
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          You will receive: <span className="text-white font-mono">{wrapAmount || "0.0"} ETH</span>
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/30 p-3">
        <div className="text-xs text-orange-400 mb-1">⚠️ Gas Fees</div>
        <div className="text-xs text-neutral-300">
          Unwrapping requires gas fees to be paid in ETH. Make sure you have some ETH for transaction costs.
        </div>
      </div>

      {wrapStatus === "success" && (
        <div className="bg-green-500/10 border border-green-500/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">zWETH Unwrapped Successfully!</span>
          </div>
          <div className="text-xs text-neutral-400">
            Transaction:
            <code className="ml-1 text-green-400 font-mono text-xs">{_transactionHash}</code>
          </div>
        </div>
      )}

      {wrapStatus === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">Unwrapping failed. Please try again.</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleUnwrapETH}
        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
        disabled
      >
        Coming Soon
      </Button>
    </TabsContent>
  );
}
