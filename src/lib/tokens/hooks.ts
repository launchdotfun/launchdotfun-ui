import { tokenApi, TokenListQueryParams } from "./api";
import { TToken } from "./types";
import { TQueryOptions } from "@/lib/types";
import { ERC20__factory } from "@/web3/contracts";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { usePublicClient } from "wagmi";

export function useTokenListQuery(params?: TokenListQueryParams, options?: TQueryOptions<TToken[]>) {
  return useQuery({
    queryKey: ["tokenList", params],
    queryFn: async () => {
      return tokenApi.getTokenList(params);
    },
    staleTime: 10_000,
    ...options,
    enabled: options?.enabled ?? false,
  });
}

export type UseErc20TokenInfoOptions = TQueryOptions<TToken>;

export function useErc20TokenInfo(tokenAddress?: string, options?: UseErc20TokenInfoOptions) {
  const publicClient = usePublicClient();
  const multicall = publicClient?.multicall;

  return useQuery({
    queryKey: ["erc20TokenInfo", tokenAddress],
    queryFn: async () => {
      if (!tokenAddress || !isAddress(tokenAddress)) {
        throw new Error("Invalid token address");
      }

      try {
        const tokenInfo = await tokenApi.getTokenByAddress(tokenAddress.toLowerCase());
        return tokenInfo;
      } catch {}

      const res = await multicall!({
        contracts: [
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "name" },
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "symbol" },
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "decimals" },
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "totalSupply" },
        ],
        allowFailure: false,
      });

      return {
        address: tokenAddress,
        name: res[0],
        symbol: res[1],
        decimals: res[2],
        totalSupply: res[3].toString(),
        icon: "/images/empty-token.webp",
        creator: "",
        usedAt: null,
      } as TToken;
    },
    staleTime: 10_000,
    ...options,
    enabled: !!tokenAddress && isAddress(tokenAddress) && !!multicall,
  });
}

export type TManageableToken = TToken & {
  usageStatus: "Available" | "Used";
};

export function useCreatorTokensQuery(creator?: string | null, options?: TQueryOptions<TManageableToken[]>) {
  return useQuery({
    queryKey: ["creatorTokens", creator],
    queryFn: async () => {
      if (!creator) return [];
      const tokens = await tokenApi.getTokensByCreator(creator);
      return tokens.map((token) => ({
        ...token,
        usageStatus: token.usedAt ? "Used" : "Available",
      }));
    },
    staleTime: 10_000,
    ...options,
    enabled: !!creator && (options?.enabled ?? true),
  });
}
