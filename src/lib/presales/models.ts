"server only";

import { TPresale } from "./types";
import { ObjectId } from "mongodb";
import { TokenDocument, documentToToken } from "@/lib/tokens/models";

export interface PresaleDocument
  extends Omit<TPresale, "id" | "token" | "createdAt" | "updatedAt" | "deletedAt" | "closedAt"> {
  _id?: ObjectId;
  token: TokenDocument | string; // Can be embedded or reference
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  closedAt?: Date | null;
}

export function presaleToDocument(
  presale: Omit<TPresale, "id">
): Omit<PresaleDocument, "_id" | "createdAt" | "updatedAt"> {
  return {
    thumbnail: presale.thumbnail,
    name: presale.name,
    description: presale.description,
    startTime: presale.startTime,
    endTime: presale.endTime,
    token: presale.token as any, // Will be stored as embedded document
    softCap: presale.softCap,
    hardCap: presale.hardCap,
    presaleRate: presale.presaleRate,
    tokensForSale: presale.tokensForSale,
    tokensForLiquidity: presale.tokensForLiquidity,
    liquidityPercent: presale.liquidityPercent,
    status: presale.status,
    presaleAddress: presale.presaleAddress,
    zTokenAddress: presale.zTokenAddress,
    creator: presale.creator,
    txHash: presale.txHash,
    raisedAmount: presale.raisedAmount,
    social: presale.social,
    deletedAt: presale.deletedAt ? new Date(presale.deletedAt) : null,
    closedAt: presale.closedAt ? new Date(presale.closedAt) : null,
  };
}

export function documentToPresale(doc: PresaleDocument): TPresale {
  const token = typeof doc.token === "string" ? ({} as any) : documentToToken(doc.token as TokenDocument);

  const id = doc._id ? parseInt(doc._id.toString().slice(-8), 16) : 0;

  return {
    id,
    thumbnail: doc.thumbnail,
    name: doc.name,
    description: doc.description,
    startTime: doc.startTime,
    endTime: doc.endTime,
    token,
    softCap: doc.softCap,
    hardCap: doc.hardCap,
    presaleRate: doc.presaleRate,
    tokensForSale: doc.tokensForSale,
    tokensForLiquidity: doc.tokensForLiquidity,
    liquidityPercent: doc.liquidityPercent,
    status: doc.status,
    presaleAddress: doc.presaleAddress,
    zTokenAddress: doc.zTokenAddress,
    creator: doc.creator,
    txHash: doc.txHash,
    raisedAmount: doc.raisedAmount,
    social: doc.social,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    deletedAt: doc.deletedAt?.toISOString() || null,
    closedAt: doc.closedAt?.toISOString() || null,
  };
}
