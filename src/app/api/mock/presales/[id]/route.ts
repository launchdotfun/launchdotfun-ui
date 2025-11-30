"server only";

import { NextResponse } from "next/server";
import { mockPresales } from "@/lib/presales/mock-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const presale = mockPresales.find((item) => item.presaleAddress === id || String(item.id) === id);

  if (!presale) {
    return NextResponse.json({ error: "Presale not found" }, { status: 404 });
  }

  return NextResponse.json(presale, { status: 200 });
}
