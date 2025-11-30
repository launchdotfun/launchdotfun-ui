"server only";

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { tokenToDocument, documentToToken } from "@/lib/tokens/models";
import { TToken } from "@/lib/tokens/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator")?.toLowerCase() || undefined;
    const available = searchParams.get("available");

    const filter: Record<string, any> = { deletedAt: null };
    if (creator) {
      filter.creator = creator;
    }
    if (available === "true") {
      filter.usedAt = null;
    }

    const db = await getDatabase();
    const tokens = await db.collection("tokens").find(filter).sort({ createdAt: -1 }).toArray();

    const result = tokens.map((doc) => documentToToken(doc as any));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TToken = await request.json();

    if (!body.address || !body.name || !body.symbol || !body.creator) {
      return NextResponse.json({ error: "Missing required fields: address, name, symbol, creator" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("tokens");

    const tokenAddress = body.address.toLowerCase();
    const creatorAddress = body.creator.toLowerCase();

    // Check if token with this address already exists
    const existing = await collection.findOne({ address: tokenAddress, deletedAt: null });
    if (existing) {
      return NextResponse.json({ error: "Token with this address already exists" }, { status: 409 });
    }

    const now = new Date();
    const tokenDoc = {
      ...tokenToDocument({
        ...body,
        address: tokenAddress,
        creator: creatorAddress,
        usedAt: null,
      }),
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(tokenDoc);
    const inserted = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json(documentToToken(inserted as any), { status: 201 });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
