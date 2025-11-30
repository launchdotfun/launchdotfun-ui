"use client";

import { useTokenListQuery } from "@/lib/tokens/hooks";

export default function DataPrefetch() {
  useTokenListQuery(undefined, { enabled: true, refetchInterval: 20_000 });
  return null;
}
