"server only";

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { documentToToken } from "@/lib/tokens/models";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const token = await db.collection("tokens").findOne({
      address: address.toLowerCase(),
      deletedAt: null,
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json(documentToToken(token as any), { status: 200 });
  } catch (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}
