"server only";

import { TToken } from "./types";
import { ObjectId } from "mongodb";

export interface TokenDocument extends Omit<TToken, "address" | "usedAt"> {
  _id?: ObjectId;
  address: string; // Using address as unique identifier
  createdAt: Date;
  updatedAt: Date;
  usedAt?: Date | null;
  deletedAt?: Date | null;
}

export function tokenToDocument(token: TToken): Omit<TokenDocument, "_id" | "createdAt" | "updatedAt"> {
  return {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    totalSupply: token.totalSupply,
    icon: token.icon,
    creator: token.creator,
    usedAt: token.usedAt ? new Date(token.usedAt) : null,
    deletedAt: null,
  };
}

export function documentToToken(doc: TokenDocument): TToken {
  return {
    address: doc.address,
    name: doc.name,
    symbol: doc.symbol,
    decimals: doc.decimals,
    totalSupply: doc.totalSupply,
    icon: doc.icon,
    creator: doc.creator,
    usedAt: doc.usedAt?.toISOString() || null,
  };
}
