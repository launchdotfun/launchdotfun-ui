"server only";

import { Filter, ModifyResult, WithId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { documentToPresale, presaleToDocument, PresaleDocument } from "@/lib/presales/models";
import { EPresaleOnchainState, TPresale } from "@/lib/presales/types";
import { parseManageableStatusParam, resolveManageablePresaleStatus } from "@/lib/presales/helpers";
import { parseOnchainStatusFilters, parseOnchainStatusParam } from "@/lib/presales/filter-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const creator = searchParams.get("creator")?.toLowerCase();
    const statusFilters = searchParams
      .getAll("status")
      .flatMap((value) => value.split(","))
      .map((value) => parseManageableStatusParam(value))
      .filter((value): value is NonNullable<ReturnType<typeof parseManageableStatusParam>> => Boolean(value));
    const tokenAddress = searchParams.get("token")?.toLowerCase();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const onchainStatuses = parseOnchainStatusFilters(searchParams.getAll("onchainStatus"));

    const db = await getDatabase();
    const collection = db.collection<PresaleDocument>("presales");
    const filter: Filter<PresaleDocument> = { deletedAt: null };
    if (creator) {
      filter.creator = creator;
    }
    if (tokenAddress) {
      (filter as Record<string, unknown>)["token.address"] = tokenAddress;
    }

    if (startDate || endDate) {
      const createdAt: Filter<PresaleDocument>["createdAt"] = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!Number.isNaN(start.getTime())) {
          createdAt.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!Number.isNaN(end.getTime())) {
          createdAt.$lte = end;
        }
      }
      if (createdAt.$gte || createdAt.$lte) {
        filter.createdAt = createdAt as any;
      }
    }

    if (onchainStatuses.length) {
      filter.status = { $in: onchainStatuses };
    }

    const presales = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    let result = presales.map((doc) => documentToPresale(doc as any));

    if (statusFilters.length) {
      result = result.filter((presale) => {
        const status = resolveManageablePresaleStatus(presale);
        return statusFilters.includes(status);
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching presales:", error);
    return NextResponse.json({ error: "Failed to fetch presales" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<TPresale, "id"> = await request.json();

    if (!body.presaleAddress || !body.name || !body.token?.address) {
      return NextResponse.json(
        { error: "Missing required fields: presaleAddress, name, token.address" },
        { status: 400 }
      );
    }

    const tokenAddress = body.token.address.toLowerCase();
    body.token.address = tokenAddress;
    if (body.token.creator) {
      body.token.creator = body.token.creator.toLowerCase();
    }
    if (body.creator) {
      body.creator = body.creator.toLowerCase();
    }

    const db = await getDatabase();
    const collection = db.collection<PresaleDocument>("presales");

    const existing = await collection.findOne({
      presaleAddress: body.presaleAddress,
      deletedAt: null,
    });
    if (existing) {
      return NextResponse.json({ error: "Presale with this address already exists" }, { status: 409 });
    }

    const duplicateToken = await collection.findOne({
      "token.address": tokenAddress,
      deletedAt: null,
    });
    if (duplicateToken) {
      return NextResponse.json({ error: "A presale for this token already exists" }, { status: 409 });
    }

    const now = new Date();
    const presaleDoc = {
      ...presaleToDocument(body),
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(presaleDoc);
    const inserted = await collection.findOne({ _id: result.insertedId });

    await db.collection("tokens").updateOne(
      { address: tokenAddress, deletedAt: null },
      {
        $set: { usedAt: now, updatedAt: now },
      }
    );

    return NextResponse.json(documentToPresale(inserted as any), { status: 201 });
  } catch (error) {
    console.error("Error creating presale:", error);
    return NextResponse.json({ error: "Failed to create presale" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { presaleAddress, status, closedAt } = body as {
      presaleAddress?: string;
      status?: EPresaleOnchainState | string | number;
      closedAt?: string | null;
    };

    if (!presaleAddress) {
      return NextResponse.json({ error: "presaleAddress is required" }, { status: 400 });
    }

    const nextStatus = parseOnchainStatusParam(status ?? null);
    if (nextStatus === undefined) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<PresaleDocument>("presales");

    const now = new Date();
    const updateDoc: Partial<PresaleDocument> = {
      status: nextStatus,
      updatedAt: now,
    };

    if (closedAt !== undefined) {
      updateDoc.closedAt = closedAt ? new Date(closedAt) : null;
    } else if (
      nextStatus === EPresaleOnchainState.FINALIZED ||
      nextStatus === EPresaleOnchainState.CANCELED ||
      nextStatus === EPresaleOnchainState.WAITING_FOR_FINALIZE
    ) {
      updateDoc.closedAt = now;
    }

    const updatedResult: ModifyResult<PresaleDocument> = await collection.findOneAndUpdate(
      { presaleAddress, deletedAt: null },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    const updatedDoc = updatedResult.value as WithId<PresaleDocument> | null;

    if (!updatedDoc) {
      return NextResponse.json({ error: "Presale not found" }, { status: 404 });
    }

    return NextResponse.json(documentToPresale(updatedDoc), { status: 200 });
  } catch (error) {
    console.error("Error updating presale status:", error);
    return NextResponse.json({ error: "Failed to update presale status" }, { status: 500 });
  }
}
