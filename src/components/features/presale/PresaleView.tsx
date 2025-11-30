"use client";

import { usePresaleQuery } from "@/lib/presales/hooks";
import useWeb3 from "@/lib/hooks/useWeb3";
import { Z_WETH9 } from "@/web3/core/constants";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import About from "./About";
import Actions from "./Actions";
import BannerAndToken from "./BannerAndToken";
import Comments from "./Comments";
import ContributionInfo from "./ContributionInfo";
import PoolInfo from "./PoolInfo";
import PresaleForm from "./PresaleForm";
import TokenDetails from "./TokenDetails";

export default function PresaleView() {
  const { chainId, address } = useWeb3();
  const ZWETH = Z_WETH9[chainId];

  const presaleAddress = useParams().id as string;

  const {
    data: launchpadData,
    isLoading,
    isPending,
  } = usePresaleQuery(presaleAddress, {
    enabled: true,
    refetchInterval: 20_000,
  });

  return (
    <div className="py-6">
      {isLoading || isPending ? (
        <div className="flex items-center justify-center py-10 flex-col gap-2 text-primary">
          <Loader2 className="size-[1.5em] animate-spin" />
          <span className="">Loading data...</span>
        </div>
      ) : (
        <div>
          {launchpadData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BannerAndToken launchpadData={launchpadData} />

                <About description={launchpadData.description} />

                <TokenDetails launchpadData={launchpadData} />

                <PoolInfo launchpadData={launchpadData} ZWETH={ZWETH} />

                {address && <Comments />}
              </div>

              <div className="space-y-6">
                <PresaleForm launchpadData={launchpadData} ZWETH={ZWETH} />

                {address && <ContributionInfo launchpadData={launchpadData} ZWETH={ZWETH} address={address} />}

                {address && <Actions launchpadData={launchpadData} address={address} />}
              </div>
            </div>
          )}
          {!launchpadData && (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-lg">Presale not </p>
              <p className="text-sm">The presale you are looking for does not exist or has been removed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
