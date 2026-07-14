"use client";

import dynamic from "next/dynamic";
import type { MarketRegion } from "@/lib/public-api";

type CoverageMapProps = {
  regions: MarketRegion[];
};

function MapSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
      <div className="flex min-h-[520px] items-center justify-center rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,#072b3d_0%,#0b4f6c_48%,#0a3a52_100%)] text-sm text-white/70 lg:min-h-[640px]">
        Loading geographic map…
      </div>
      <div className="min-h-[520px] animate-pulse rounded-[2rem] border border-[var(--border)] bg-[var(--surface-muted)] lg:min-h-[640px]" />
    </div>
  );
}

const CoverageMapClient = dynamic(
  () => import("./CoverageMapClient").then((mod) => mod.CoverageMapClient),
  { ssr: false, loading: () => <MapSkeleton /> },
);

export function CoverageMap({ regions }: CoverageMapProps) {
  return <CoverageMapClient regions={regions} />;
}
