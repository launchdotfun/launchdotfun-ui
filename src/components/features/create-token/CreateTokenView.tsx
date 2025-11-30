"use client";

import { tokenApi } from "@/lib/tokens/api";
import { TToken } from "@/lib/tokens/types";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useTokenFactoryContractWrite } from "@/lib/hooks/useContract";
import { useUploadFile } from "@/lib/hooks/useUploadFile";
import useWeb3 from "@/lib/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import yup from "@/lib/yup";
import { getErrorMessage } from "@/lib/utils/error";
import { formatNumber } from "@/lib/utils/format";
import { yupResolver } from "@hookform/resolvers/yup";
import { EventLog } from "ethers";
import { Info, Zap, UploadCloud, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  symbol: yup.string().required("Symbol is required"),
  decimals: yup
    .number()
    .integer("Decimals must be an integer")
    .min(6, "Decimals must be at least 6")
    .max(18, "Decimals must be at most 18")
    .required("Decimals is required"),
  totalSupply: yup
    .number()
    .integer("Total supply must be an integer")
    .positive("Total supply must be a positive number")
    .required("Total supply is required"),
  icon: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateTokenView() {
  const { address } = useWeb3();
  const tokenFactoryContract = useTokenFactoryContractWrite();

  const form = useForm({
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 18,
      totalSupply: 1_000_000_000,
      icon: undefined as string | undefined,
    },
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: yupResolver(schema),
  });

  const tokenData = form.watch();
  const formState = form.formState;
  const uploadFileMutation = useUploadFile();

  const handleUploadIcon = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Icon file size must be less than 1MB.");
        return;
      }
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        toast.error("Unsupported file format. Please upload a JPEG, PNG, GIF, or WEBP image.");
        form.setValue("icon", "");
        return;
      }
      try {
        form.setValue("icon", "");
        const res = await uploadFileMutation.mutateAsync(file);
        form.setValue("icon", res.url);
      } catch (error) {
        console.error("Error uploading icon:", error);
        toast.error("Failed to upload icon. Please try again.");
        form.setValue("icon", "");
        if (event.target) {
          event.target.value = "";
        }
      }
    } else {
      form.setValue("icon", "");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!address) {
        throw new Error("Please connect your wallet to create a token.");
      }
      if (!tokenFactoryContract) {
        throw new Error("Token Factory contract is not available.");
      }
      const totalSupplyInWei = BigInt(Math.floor(data.totalSupply)) * BigInt(10) ** BigInt(data.decimals);
      const tx = await tokenFactoryContract.createToken(
        data.name,
        data.symbol,
        data.decimals,
        totalSupplyInWei,
        data.icon || ""
      );

      const receipt = await tx.wait();

      // Fallback to original index assumption to read the TokenCreated event
      const event = receipt?.logs?.[2] as EventLog | undefined;

      if (!event && !receipt?.logs?.length) {
        console.warn("Could not find TokenCreated event log");
        // We continue but might miss the address for the API call
      }

      const tokenAddress = event && event.args ? (event.args[0] as string) : "";

      if (tokenAddress) {
        const tokenPayload: TToken = {
          address: tokenAddress.toLowerCase(),
          name: data.name,
          symbol: data.symbol,
          decimals: data.decimals,
          totalSupply: totalSupplyInWei.toString(),
          icon: data.icon || null,
          creator: address.toLowerCase(),
          usedAt: null,
        };
        await tokenApi.createToken(tokenPayload);
      }

      toastTxSuccess("Token created successfully!", tx.hash);
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create token", { description: getErrorMessage(error) });
    }
  };

  return (
    <div className="pb-12 pt-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tighter mb-2">
            Create Token
          </h1>
          <p className="text-base text-muted-foreground font-medium">Deploy your own ERC-20 token on the network.</p>
        </div>
        <div className="flex gap-3">
          <Button
            form="create-token-form"
            type="submit"
            size="lg"
            className="px-6"
            loading={formState.isSubmitting}
            disabled={formState.isValidating || formState.isLoading || formState.isSubmitting}
            loadingText="Deploying..."
            icon={<Zap className="w-5 h-5 mr-2" />}
          >
            DEPLOY TOKEN
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Token Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-xl p-0 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-border">
              <h3 className="text-foreground text-lg font-bold">TOKEN CONFIGURATION</h3>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id="create-token-form">
                {/* Icon Upload */}
                <div className="space-y-3">
                  <label htmlFor="icon" className="text-sm font-bold text-foreground uppercase">
                    Token Icon
                  </label>

                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="size-24 min-w-[6rem] border border-border bg-muted flex items-center justify-center rounded-lg shadow-sm">
                      {tokenData.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tokenData.icon} alt="Token Icon" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <div className="relative">
                        <input
                          id="icon"
                          type="file"
                          accept="image/*"
                          onChange={handleUploadIcon}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          value=""
                        />
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border cursor-pointer hover:bg-muted/80 transition-colors w-full sm:w-auto justify-center sm:justify-start rounded-lg shadow-sm">
                          <UploadCloud className="w-5 h-5" />
                          <span className="font-bold text-sm">CHOOSE FILE</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        JPEG, PNG, GIF or WEBP. Max 1MB. Recommended 256x256px.
                      </p>

                      {uploadFileMutation.isPending && (
                        <div className="flex items-center gap-2 text-sm text-[#FF9F1C] font-bold animate-pulse">
                          <span className="loading loading-spinner w-4 h-4"></span>
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-foreground uppercase">
                      Token Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g. Bitcoin"
                      {...form.register("name")}
                      error={!!formState.errors.name}
                      helperText={formState.errors.name?.message}
                      className="h-12 font-medium focus:border-[#FF9F1C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="symbol" className="text-sm font-bold text-foreground uppercase">
                      Token Symbol <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="symbol"
                      placeholder="e.g. BTC"
                      {...form.register("symbol")}
                      error={!!formState.errors.symbol}
                      helperText={formState.errors.symbol?.message}
                      className="h-12 font-medium focus:border-[#FF9F1C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="decimals" className="text-sm font-bold text-foreground uppercase">
                      Decimals <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="decimals"
                      type="number"
                      min="6"
                      max="18"
                      placeholder="18"
                      {...form.register("decimals")}
                      error={!!formState.errors.decimals}
                      helperText={formState.errors.decimals?.message}
                      className="h-12 font-medium focus:border-[#FF9F1C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="totalSupply" className="text-sm font-bold text-foreground uppercase">
                      Total Supply <span className="text-red-500">*</span>
                    </label>
                    <Input.Number
                      id="totalSupply"
                      placeholder="1000000"
                      {...form.register("totalSupply")}
                      value={tokenData.totalSupply ?? ""}
                      error={!!formState.errors.totalSupply}
                      helperText={formState.errors.totalSupply?.message}
                      className="h-12 font-medium focus:border-[#FF9F1C]"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Preview & Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Token Preview */}
          <div className="bg-card border border-border rounded-xl p-0 shadow-lg">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-bold uppercase text-foreground">PREVIEW</h3>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="size-24 border border-border bg-primary flex items-center justify-center rounded-lg shadow-sm mb-2 overflow-hidden">
                {tokenData.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tokenData.icon} alt="Token Icon" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-foreground text-3xl font-bold">
                    {tokenData.symbol ? tokenData.symbol.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground break-all">{tokenData.name || "Your Token"}</h3>
                <p className="text-muted-foreground font-bold mt-1">{tokenData.symbol || "SYMBOL"}</p>
              </div>

              <div className="w-full border-t border-border my-4"></div>

              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Supply:</span>
                  <span className="text-foreground font-bold">{formatNumber(tokenData.totalSupply || "0")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Decimals:</span>
                  <span className="text-foreground font-bold">{tokenData.decimals}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Info */}
          <div className="bg-card border border-border rounded-xl p-0 shadow-lg">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-bold uppercase text-foreground">Info</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 border border-border rounded-lg shadow-sm">
                <Info className="w-5 h-5 text-[#118AB2] shrink-0 mt-0.5" />
                <div className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Deploying creates a new ERC-20 contract. You will receive the total supply in your wallet.
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Network</span>
                  <span className="text-foreground font-bold">Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Standard</span>
                  <span className="text-foreground font-bold">ERC-20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Est. Gas</span>
                  <span className="text-foreground font-bold">~0.0012 ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
