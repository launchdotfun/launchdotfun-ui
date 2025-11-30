"use client";

import Button from "@/components/common/Button";
import DatePicker from "@/components/common/DatePicker";
import Input from "@/components/common/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useWeb3 from "@/lib/hooks/useWeb3";
import { useErc20TokenInfo, useTokenListQuery } from "@/lib/tokens/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { Info, Loader2, Rocket, UploadCloud, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import LaunchPresaleDialog from "./LaunchPresaleDialog";
import { createPresaleSchema } from "./helpers";
import { toast } from "sonner";
import { useUploadFile } from "@/lib/hooks/useUploadFile";
import { formatNumber } from "@/lib/utils/format";

export default function CreateLaunchpadView() {
  const form = useForm({
    defaultValues: {
      tokenAddress: "",
      tokenName: "",
      tokenSymbol: "",
      presaleRate: undefined,
      softCap: undefined,
      hardCap: undefined,
      description: undefined,
      website: undefined,
      telegram: undefined,
      twitter: undefined,
      startDate: undefined,
      endDate: undefined,
      thumbnail: undefined,
      zTokenAddress: undefined,
    },
    mode: "all",
    reValidateMode: "onChange",
    resolver: yupResolver(createPresaleSchema, { stripUnknown: false }),
  });

  const { address } = useWeb3();

  const {
    data: ownedTokensData,
    isLoading: isLoadingOwnedTokens,
    isFetching: isFetchingOwnedTokens,
  } = useTokenListQuery(address ? { creator: address.toLowerCase(), available: true } : undefined, {
    enabled: !!address,
    staleTime: 60_000,
  });
  const ownedTokens = useMemo(() => ownedTokensData ?? [], [ownedTokensData]);

  const [showLaunchDialog, setShowLaunchDialog] = useState(false);

  const launchpadData = form.watch();
  const formState = form.formState;

  const { data: erc20Info, isLoading: isLoadingErc20Info } = useErc20TokenInfo(launchpadData.tokenAddress, {
    staleTime: 60_000, // 1 minute
  });

  const shortenAddress = (value: string) => {
    if (!value) return "";
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  };

  const selectedTokenAddress = useMemo(() => {
    if (!launchpadData.tokenAddress) return "";
    const match = ownedTokens.find((token) => token.address === launchpadData.tokenAddress);
    return match ? match.address : "";
  }, [launchpadData.tokenAddress, ownedTokens]);

  const isTokenSelectDisabled = !address || ownedTokens.length === 0;
  const isTokenListLoading = isLoadingOwnedTokens || isFetchingOwnedTokens;

  const tokenSelectPlaceholder = useMemo(() => {
    if (!address) return "Connect your wallet to load tokens";
    if (isTokenListLoading) return "Loading your tokens...";
    if (ownedTokens.length === 0) return "No available tokens";
    return "Select one of your tokens";
  }, [address, isTokenListLoading, ownedTokens.length]);

  const showCreateTokenCta = !!address && !isTokenListLoading && ownedTokens.length === 0;

  useEffect(() => {
    if (!address) {
      form.setValue("tokenAddress", "", { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    const currentAddress = form.getValues("tokenAddress");
    if (currentAddress && ownedTokens.length > 0) {
      const exists = ownedTokens.some((token) => token.address === currentAddress);
      if (!exists) {
        form.setValue("tokenAddress", "", { shouldValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedTokens]);

  const onSubmit = () => {
    setShowLaunchDialog(true);
  };

  const uploadFileMutation = useUploadFile();

  const handleUploadIcon = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 1 * 1024 * 1024) {
        // 1MB limit
        toast.error("Icon file size must be less than 1MB.");
        return;
      }
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        toast.error("Unsupported file format. Please upload a JPEG, PNG, GIF, or WEBP image.");
        form.setValue("thumbnail", "");
        return;
      }
      try {
        form.setValue("thumbnail", "");
        const res = await uploadFileMutation.mutateAsync(file);
        form.setValue("thumbnail", res.url);
      } catch (error) {
        console.error("Error uploading icon:", error);
        toast.error("Failed to upload icon. Please try again.");
        form.setValue("thumbnail", "");
        // Reset the input file
        if (event.target) {
          event.target.value = "";
        }
      }
    } else {
      form.setValue("thumbnail", "");
    }
  };

  useEffect(() => {
    if (erc20Info) {
      form.setValue("tokenName", erc20Info.name);
      form.setValue("tokenSymbol", erc20Info.symbol);
    } else {
      form.setValue("tokenName", "");
      form.setValue("tokenSymbol", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Info]);

  return (
    <div className="pb-8 sm:pb-12 pt-4 sm:pt-6 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 border-b border-border pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Create Launchpad</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Set up your token presale campaign</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            form="create-launchpad-form"
            type="submit"
            disabled={formState.isSubmitting || formState.isLoading}
            size="lg"
            className="px-4 sm:px-6 w-full sm:w-auto"
          >
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">{formState.isSubmitting ? "Launching..." : "Launch Presale"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Launchpad Form */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className="bg-card border border-border rounded-xl p-0 overflow-hidden shadow-lg">
            <div className="p-3 sm:p-4 border-b border-border">
              <h3 className="text-foreground text-base sm:text-lg font-bold">Presale Configuration</h3>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <form
                id="create-launchpad-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 sm:space-y-8"
              >
                {/* Token Information */}
                <div className="space-y-4 sm:space-y-6 border-b border-border pb-6 sm:pb-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">STEP 1</span>
                    Token Information
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="tokenAddress"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        Token Contract Address
                        {isTokenListLoading ? (
                          <Loader2 className="size-[1.1em] animate-spin text-muted-foreground" />
                        ) : null}
                      </label>
                      <Link
                        href="/create-token"
                        className="text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-2"
                      >
                        Create Token
                      </Link>
                    </div>
                    <Select
                      value={selectedTokenAddress}
                      onValueChange={(value) => form.setValue("tokenAddress", value, { shouldValidate: true })}
                      disabled={isTokenSelectDisabled}
                    >
                      <SelectTrigger className="h-12 font-medium w-full text-left" disabled={isTokenSelectDisabled}>
                        <SelectValue placeholder={tokenSelectPlaceholder} />
                      </SelectTrigger>
                      {ownedTokens.length > 0 ? (
                        <SelectContent className="bg-card border-border" position="popper">
                          {ownedTokens.map((token) => (
                            <SelectItem
                              key={token.address}
                              value={token.address}
                              className="text-foreground hover:bg-muted cursor-pointer"
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-semibold text-sm">
                                  {token.name} ({token.symbol})
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {shortenAddress(token.address)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      ) : null}
                    </Select>
                    {!address && (
                      <p className="text-xs text-muted-foreground font-medium">
                        Connect your wallet to see your tokens.
                      </p>
                    )}
                    {showCreateTokenCta && (
                      <p className="text-xs text-muted-foreground font-medium">
                        You don&apos;t have any unused tokens yet.{" "}
                        <Link href="/create-token" className="text-primary underline underline-offset-2">
                          Create one
                        </Link>{" "}
                        to continue.
                      </p>
                    )}
                    {formState.errors.tokenAddress?.message ? (
                      <p className="text-xs text-destructive font-medium">{formState.errors.tokenAddress.message}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="tokenName"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        Token Name {isLoadingErc20Info ? <Loader2 className="size-[1.2em] animate-spin" /> : null}
                      </label>
                      <Input
                        id="tokenName"
                        placeholder="Auto-filled from contract"
                        value={launchpadData.tokenName ?? ""}
                        disabled
                        className="h-12 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="tokenSymbol"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        Token Symbol {isLoadingErc20Info ? <Loader2 className="size-[1.2em] animate-spin" /> : null}
                      </label>
                      <Input
                        id="tokenSymbol"
                        placeholder="Auto-filled from contract"
                        value={launchpadData.tokenSymbol ?? ""}
                        disabled
                        className="h-12 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Presale Details */}
                <div className="space-y-4 sm:space-y-6 border-b border-border pb-6 sm:pb-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">STEP 2</span>
                    Presale Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label htmlFor="presaleRate" className="text-sm font-semibold text-foreground">
                        Presale Rate (tokens/zWETH)
                      </label>
                      <Input.Number
                        id="presaleRate"
                        placeholder="e.g., 1000"
                        {...form.register("presaleRate")}
                        value={launchpadData.presaleRate ?? ""}
                        error={!!formState.errors.presaleRate}
                        helperText={formState.errors.presaleRate?.message}
                        className="h-12 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label htmlFor="softCap" className="text-sm font-semibold text-foreground">
                        Soft Cap (zWETH)
                      </label>
                      <Input.Number
                        id="softCap"
                        placeholder="e.g., 50"
                        value={launchpadData.softCap ?? ""}
                        {...form.register("softCap")}
                        error={!!formState.errors.softCap}
                        helperText={formState.errors.softCap?.message}
                        className="h-12 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hardCap" className="text-sm font-semibold text-foreground">
                        Hard Cap (zWETH)
                      </label>
                      <Input.Number
                        id="hardCap"
                        placeholder="e.g., 200"
                        value={launchpadData.hardCap ?? ""}
                        {...form.register("hardCap")}
                        error={!!formState.errors.hardCap}
                        helperText={formState.errors.hardCap?.message}
                        className="h-12 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4 sm:space-y-6 border-b border-border pb-6 sm:pb-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">STEP 3</span>
                    Timeline
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Start Date</label>
                      <DatePicker
                        date={launchpadData.startDate}
                        onChange={(date) => form.setValue("startDate", date!, { shouldValidate: true })}
                        error={!!formState.errors.startDate}
                        helperText={formState.errors.startDate?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">End Date</label>
                      <DatePicker
                        date={launchpadData.endDate}
                        onChange={(date) => form.setValue("endDate", date!, { shouldValidate: true })}
                        error={!!formState.errors.endDate}
                        helperText={formState.errors.endDate?.message}
                      />
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">STEP 4</span>
                    Project Information
                  </h3>

                  <div className="space-y-3">
                    <label htmlFor="icon" className="text-sm font-semibold text-foreground">
                      Project Thumbnail
                    </label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="w-full sm:w-48 aspect-[3.85] border border-border bg-muted rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                        {launchpadData.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={launchpadData.thumbnail}
                            alt="Project Thumbnail"
                            className="w-full h-full object-cover"
                          />
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
                          <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted/80 transition-colors w-full sm:w-auto justify-center sm:justify-start shadow-sm">
                            <UploadCloud className="w-5 h-5" />
                            <span className="font-semibold text-sm">Choose File</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">JPEG, PNG, GIF or WEBP. Max 1MB.</p>

                        {uploadFileMutation.isPending && (
                          <div className="flex items-center gap-2 text-sm text-primary font-semibold animate-pulse">
                            <span className="loading loading-spinner w-4 h-4"></span>
                            Uploading...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-semibold text-foreground">
                      Project Description
                    </label>
                    <Input.Textarea
                      id="description"
                      placeholder="Describe your project, its goals, and why investors should participate..."
                      value={launchpadData.description ?? ""}
                      {...form.register("description")}
                      error={!!formState.errors.description}
                      helperText={formState.errors.description?.message}
                      className="min-h-[120px] font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-semibold text-foreground">
                        Website
                      </label>
                      <Input
                        id="website"
                        placeholder="https://yourproject.com"
                        value={launchpadData.website ?? ""}
                        {...form.register("website")}
                        error={!!formState.errors.website}
                        helperText={formState.errors.website?.message}
                        className="h-12 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="telegram" className="text-sm font-semibold text-foreground">
                          Telegram
                        </label>
                        <Input
                          id="telegram"
                          placeholder="@yourprojectgroup"
                          value={launchpadData.telegram ?? ""}
                          {...form.register("telegram")}
                          error={!!formState.errors.telegram}
                          helperText={formState.errors.telegram?.message}
                          className="h-12 font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="twitter" className="text-sm font-semibold text-foreground">
                          Twitter
                        </label>
                        <Input
                          id="twitter"
                          placeholder="@yourproject"
                          value={launchpadData.twitter ?? ""}
                          {...form.register("twitter")}
                          error={!!formState.errors.twitter}
                          helperText={formState.errors.twitter?.message}
                          className="h-12 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Preview & Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Preview */}
          <div className="bg-card border border-border rounded-xl p-0 shadow-lg">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-bold uppercase text-foreground">Preview</h3>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-full aspect-[3.85] border border-border bg-muted rounded-lg flex items-center justify-center shadow-sm mb-2 overflow-hidden relative">
                {launchpadData.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={launchpadData.thumbnail} alt="Project Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-semibold">No Image</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground break-all">
                  {launchpadData.tokenName || "Project Name"}
                </h3>
                <p className="text-muted-foreground font-semibold mt-1">{launchpadData.tokenSymbol || "SYMBOL"}</p>
              </div>

              <div className="w-full border-t border-border my-4"></div>

              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Soft Cap:</span>
                  <span className="text-foreground font-bold">
                    {launchpadData.softCap ? formatNumber(launchpadData.softCap) : "-"} zWETH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Hard Cap:</span>
                  <span className="text-foreground font-bold">
                    {launchpadData.hardCap ? formatNumber(launchpadData.hardCap) : "-"} zWETH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Rate:</span>
                  <span className="text-foreground font-bold">
                    {launchpadData.presaleRate ? formatNumber(launchpadData.presaleRate) : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-card border border-border rounded-xl p-0 shadow-lg">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-bold uppercase text-foreground">Info</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 border border-border rounded-lg shadow-sm">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Launching a presale will create a new Launchpad contract. Ensure your token is already deployed and
                  you have enough balance to cover fees.
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Network</span>
                  <span className="text-foreground font-bold">Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Currency</span>
                  <span className="text-foreground font-bold">zWETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Listing</span>
                  <span className="text-foreground font-bold">Uniswap</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {erc20Info && (
        <LaunchPresaleDialog
          onOpenChange={setShowLaunchDialog}
          open={showLaunchDialog}
          launchpadData={launchpadData}
          erc20Info={erc20Info}
        />
      )}
    </div>
  );
}
