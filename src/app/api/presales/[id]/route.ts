"server only";

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { documentToPresale } from "@/lib/presales/models";
import { Collection, ObjectId } from "mongodb";
import { EPresaleOnchainState, TPresale } from "@/lib/presales/types";
import {
  canTransitionManageableStatus,
  parseManageableStatusParam,
  resolveManageablePresaleStatus,
} from "@/lib/presales/helpers";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("presales");
    const presale = await findPresale(collection, id);

    if (!presale) {
      return NextResponse.json({ error: "Presale not found" }, { status: 404 });
    }

    return NextResponse.json(documentToPresale(presale as any), { status: 200 });
  } catch (error) {
    console.error("Error fetching presale:", error);
    return NextResponse.json(
      { error: "Failed to fetch presale" },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: Partial<TPresale> = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("presales");
    const presale = await findPresale(collection, id);

    if (!presale) {
      return NextResponse.json({ error: "Presale not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.softCap !== undefined) updateData.softCap = body.softCap;
    if (body.hardCap !== undefined) updateData.hardCap = body.hardCap;
    if (body.presaleRate !== undefined) updateData.presaleRate = body.presaleRate;
    if (body.tokensForSale !== undefined) updateData.tokensForSale = body.tokensForSale;
    if (body.tokensForLiquidity !== undefined) updateData.tokensForLiquidity = body.tokensForLiquidity;
    if (body.liquidityPercent !== undefined) updateData.liquidityPercent = body.liquidityPercent;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.presaleAddress !== undefined) updateData.presaleAddress = body.presaleAddress;
    if (body.zTokenAddress !== undefined) updateData.zTokenAddress = body.zTokenAddress;
    if (body.creator !== undefined) updateData.creator = body.creator;
    if (body.txHash !== undefined) updateData.txHash = body.txHash;
    if (body.raisedAmount !== undefined) updateData.raisedAmount = body.raisedAmount;
    if (body.social !== undefined) updateData.social = body.social;
    if (body.token !== undefined) updateData.token = body.token as any;
    if (body.deletedAt !== undefined) {
      updateData.deletedAt = body.deletedAt ? new Date(body.deletedAt) : null;
    }
    if (body.closedAt !== undefined) {
      updateData.closedAt = body.closedAt ? new Date(body.closedAt) : null;
    }

    const query = presale._id ? { _id: presale._id } : { presaleAddress: id };
    await collection.updateOne(query, { $set: updateData });

    const updated = await collection.findOne(query);
    return NextResponse.json(documentToPresale(updated as any), { status: 200 });
  } catch (error) {
    console.error("Error updating presale:", error);
    return NextResponse.json({ error: "Failed to update presale" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const targetStatus = parseManageableStatusParam(body?.status);

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    if (!targetStatus) {
      return NextResponse.json({ error: "Invalid status provided" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("presales");
    const presaleDoc = await findPresale(collection, id);

    if (!presaleDoc) {
      return NextResponse.json({ error: "Presale not found" }, { status: 404 });
    }

    const currentPresale = documentToPresale(presaleDoc as any);
    const currentStatus = resolveManageablePresaleStatus(currentPresale);
    if (!canTransitionManageableStatus(currentStatus, targetStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${targetStatus}` },
        { status: 422 }
      );
    }

    const now = new Date();
    const updateData: Record<string, any> = {
      updatedAt: now,
    };

    if (targetStatus === "Active") {
      updateData.status = EPresaleOnchainState.ACTIVE;
      updateData.closedAt = null;
    } else if (targetStatus === "Closed") {
      updateData.status = EPresaleOnchainState.FINALIZED;
      updateData.closedAt = now;
      const endTime = Date.parse(currentPresale.endTime);
      if (!Number.isFinite(endTime) || endTime < now.getTime()) {
        updateData.endTime = now.toISOString();
      }
    }

    const query = presaleDoc._id ? { _id: presaleDoc._id } : { presaleAddress: id };
    await collection.updateOne(query, { $set: updateData });

    const updated = await collection.findOne(query);
    return NextResponse.json(documentToPresale(updated as any), { status: 200 });
  } catch (error) {
    console.error("Error patching presale status:", error);
    return NextResponse.json({ error: "Failed to update presale status" }, { status: 500 });
  }
}

async function findPresale(collection: Collection, id: string) {
  let presale = null;
  try {
    const objectId = new ObjectId(id);
    presale = await collection.findOne({ _id: objectId, deletedAt: null });
    if (presale) {
      return presale;
    }
  } catch {
    // ignore invalid objectId
  }

  presale = await collection.findOne({ presaleAddress: id, deletedAt: null });
  if (presale) {
    return presale;
  }

  return null;
}
