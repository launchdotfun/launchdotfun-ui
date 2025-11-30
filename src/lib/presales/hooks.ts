import { presaleApi } from "./api";
import { TQueryOptions } from "@/lib/types";
import {
  EPresaleOnchainState,
  EPresaleStatus,
  TPresaleListFilters,
  type TPresale,
  type TPresaleStatusUpdatePayload,
} from "./types";
import { LaunchDotFunPresale__factory } from "@/web3/contracts";
import { resolveManageablePresaleStatus } from "./helpers";
import type { TManageablePresaleStatus } from "./types";

export type { TPresale, EPresaleStatus, TManageablePresaleStatus } from "./types";
import { useMutation, useQuery, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Address, formatUnits } from "viem";
import { useReadContracts } from "wagmi";

export { EPresaleOnchainState } from "./types";
export type TManageablePresale = TPresale & { manageStatus: TManageablePresaleStatus };

export type TPoolInfo = {
  tokenAddress: string;
  zTokenAddress: string;
  tokenBalance: bigint;
  tokensSold: bigint;
  weiRaise: bigint;
  ethRaisedEncrypted: string;
  tokenPerEthWithDecimals: bigint;
  zWETHAddress: string;
  state: EPresaleOnchainState;
};

export type TPresaleStats = {
  totalRaised: number;
  activeLaunches: number;
  totalPresales: number;
  successRate: number;
};

export function usePresalePoolInfo(presaleAddress?: string, options?: { refetchInterval?: number | false }) {
  const { data, ...other } = useReadContracts({
    contracts: [
      {
        address: presaleAddress as Address,
        abi: LaunchDotFunPresale__factory.abi,
        functionName: "pool",
      },
    ],
    allowFailure: false,
    query: {
      // @ts-ignore
      ...options,
      refetchInterval: 5000,
      gcTime: 0,
    },
  });

  const normalizedData = useMemo(() => {
    if (!data) return undefined;
    const pool = data[0];
    if (!pool) return undefined;
    return {
      tokenAddress: pool[0] as Address,
      zTokenAddress: pool[1] as Address,
      tokenBalance: BigInt(pool[2]),
      tokensSold: BigInt(pool[3]),
      weiRaise: BigInt(pool[4]),
      ethRaisedEncrypted: pool[5],
      tokenPerEthWithDecimals: BigInt(pool[6]),
      zWETHAddress: pool[7] as Address,
      state: pool[8] as EPresaleOnchainState,
    } as TPoolInfo;
  }, [data]);

  return {
    data: normalizedData,
    ...other,
  };
}

export function usePresaleListQuery(filters?: TPresaleListFilters, options?: TQueryOptions<TPresale[]>) {
  return useQuery({
    queryKey: ["presaleList", filters],
    queryFn: async () => {
      return presaleApi.getPresaleList(filters);
    },
    staleTime: 10_000,
    ...options,
    enabled: options?.enabled ?? false,
  });
}

export function useManageablePresales(filters?: TPresaleListFilters, options?: TQueryOptions<TPresale[]>) {
  const query = usePresaleListQuery(filters, options);

  const enriched = useMemo(() => {
    if (!query.data) return undefined;
    return query.data.map((presale) => ({
      ...presale,
      manageStatus: resolveManageablePresaleStatus(presale),
    }));
  }, [query.data]);

  return {
    ...query,
    data: enriched,
  };
}

export function usePresaleQuery(presaleAddress?: string, options?: TQueryOptions<TPresale>) {
  return useQuery({
    queryKey: ["presale", presaleAddress],
    queryFn: async () => {
      return presaleApi.getPresaleByAddress(presaleAddress as string);
    },
    staleTime: 10_000,
    ...options,
    enabled: !!presaleAddress && (options?.enabled ?? false),
  });
}

export function usePresaleStats() {
  const query = usePresaleListQuery(undefined, { enabled: true });

  const stats = useMemo<TPresaleStats>(() => {
    const presales = query.data;
    if (!presales?.length) {
      return {
        totalRaised: 0,
        activeLaunches: 0,
        totalPresales: 0,
        successRate: 0,
      };
    }

    const activeLaunches = presales.filter((launch) => getPresaleStatus(launch) === EPresaleStatus.Active).length;
    const completedLaunches = presales.filter((launch) => getPresaleStatus(launch) === EPresaleStatus.Completed).length;

    const totalRaised = presales.reduce((sum, launch) => {
      try {
        if (!launch.raisedAmount) return sum;
        const raised = Number(formatUnits(BigInt(launch.raisedAmount), 18));
        return sum + (Number.isFinite(raised) ? raised : 0);
      } catch {
        return sum;
      }
    }, 0);

    const totalPresales = presales.length;
    const successRate = totalPresales ? Math.round((completedLaunches / totalPresales) * 100) : 0;

    return {
      totalRaised,
      activeLaunches,
      totalPresales,
      successRate,
    };
  }, [query.data]);

  return {
    ...query,
    stats,
  };
}

export const getPresaleStatus = (presale?: TPresale, poolInfo?: TPoolInfo) => {
  if (!presale) return EPresaleStatus.Upcoming;
  const status = poolInfo?.state || presale.status;

  const now = Date.now();
  const start = new Date(presale.startTime).getTime();
  const end = new Date(presale.endTime).getTime();
  if (now < start) return EPresaleStatus.Upcoming;
  if (now > end) {
    if (status == EPresaleOnchainState.FINALIZED) {
      return EPresaleStatus.Completed;
    } else if (status == EPresaleOnchainState.CANCELED) {
      return EPresaleStatus.Failed;
    } else if (status == EPresaleOnchainState.WAITING_FOR_FINALIZE) {
      return EPresaleStatus.Ended;
    }
    if (status == EPresaleOnchainState.ACTIVE) {
      return EPresaleStatus.Ended;
    }
    return EPresaleStatus.Ended;
  }
  return EPresaleStatus.Active;
};

export function usePresaleStatus(presale?: TPresale, poolInfo?: TPoolInfo) {
  const [status, setStatus] = useState<EPresaleStatus>(EPresaleStatus.Upcoming);
  useEffect(() => {
    setStatus(getPresaleStatus(presale, poolInfo));
    const intervalId = setInterval(() => {
      setStatus(getPresaleStatus(presale, poolInfo));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [presale, poolInfo]);

  return status;
}

type PresaleStatusMutationPayload = TPresaleStatusUpdatePayload;

type PresaleStatusMutationOptions = Omit<
  UseMutationOptions<TPresale, unknown, PresaleStatusMutationPayload>,
  "mutationFn"
>;

export function usePresaleStatusMutation(options?: PresaleStatusMutationOptions) {
  const queryClient = useQueryClient();
  const { onSuccess: userOnSuccess, ...restOptions } = options ?? {};

  return useMutation<TPresale, unknown, PresaleStatusMutationPayload>({
    mutationFn: (payload) => presaleApi.updatePresaleStatus(payload),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ["presaleList"] });
      queryClient.invalidateQueries({ queryKey: ["presale", data.presaleAddress] });
      userOnSuccess?.(data, variables, context, mutation);
    },
    ...restOptions,
  });
}
