import { TToken } from "./types";
import authorizedRequest from "@/lib/api-client";

export type TokenListQueryParams = {
  creator?: string | null;
  available?: boolean;
};

export const tokenApi = {
  getTokenList: (params?: TokenListQueryParams) => {
    const normalizedCreator = params?.creator?.toLowerCase();
    return authorizedRequest.get<TToken[], TToken[]>("/tokens", {
      params: {
        creator: normalizedCreator ?? undefined,
        available: params?.available ?? undefined,
      },
    });
  },
  getTokensByCreator: (creator: string) => {
    const normalized = creator?.toLowerCase();
    return authorizedRequest.get<TToken[], TToken[]>("/tokens", {
      params: {
        creator: normalized,
      },
    });
  },
  getTokenByAddress: (address: string) => {
    return authorizedRequest.get<TToken, TToken>(`/tokens/${address}`);
  },
  createToken: (data: TToken) => {
    return authorizedRequest.post<TToken, TToken>("/tokens", data);
  },
};
