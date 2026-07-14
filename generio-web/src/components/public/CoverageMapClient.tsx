"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MarketCountry, MarketRegion } from "@/lib/public-api";

const COVERAGE_BOUNDS: L.LatLngBoundsExpression = [
  [-12, 5],
  [43, 95],
];

function regionLatLng(region: MarketRegion): [number, number] {
  return [region.centroidLat ?? 20, region.centroidLng ?? 45];
}

function countryLatLng(country: MarketCountry, fallback: MarketRegion, index: number): [number, number] {
  if (country.latitude != null && country.longitude != null) {
    return [country.latitude, country.longitude];
  }
  const [lat, lng] = regionLatLng(fallback);
  const angle = (index / Math.max(fallback.countries.length, 1)) * Math.PI * 2;
  return [lat + Math.cos(angle) * 1.4, lng + Math.sin(angle) * 1.8];
}

function regionIcon(label: string, color: string, selected: boolean) {
  const size = selected ? 54 : 42;
  return L.divIcon({
    className: "generio-map-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="generio-marker ${selected ? "is-active" : ""}" style="--marker:${color}">
      <span class="generio-marker-dot"></span>
      <span class="generio-marker-label">${label}</span>
    </div>`,
  });
}

function MapFocus({
  active,
  focusedCountry,
}: {
  active: MarketRegion | null;
  focusedCountry: MarketCountry | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(COVERAGE_BOUNDS, { padding: [28, 28], animate: false });
  }, [map]);

  useEffect(() => {
    if (!active) return;
    if (focusedCountry) {
      const index = active.countries.findIndex((c) => c.id === focusedCountry.id);
      const [lat, lng] = countryLatLng(focusedCountry, active, Math.max(index, 0));
      map.flyTo([lat, lng], 6.2, { duration: 0.65 });
      return;
    }
    const [lat, lng] = regionLatLng(active);
    map.flyTo([lat, lng], 5.1, { duration: 0.75 });
  }, [active, focusedCountry, map]);

  return null;
}

type CoverageMapClientProps = {
  regions: MarketRegion[];
};

export function CoverageMapClient({ regions }: CoverageMapClientProps) {
  const sorted = useMemo(
    () => [...regions].sort((a, b) => a.displayOrder - b.displayOrder),
    [regions],
  );
  const [activeSlug, setActiveSlug] = useState(sorted[0]?.slug ?? "");
  const [focusedCountryId, setFocusedCountryId] = useState<string | null>(null);
  const active = sorted.find((r) => r.slug === activeSlug) ?? sorted[0] ?? null;

  const focusedCountry =
    active?.countries.find((country) => country.id === focusedCountryId) ?? null;

  function selectRegion(slug: string) {
    setActiveSlug(slug);
    setFocusedCountryId(null);
  }

  if (!sorted.length) {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-white px-6 py-16 text-center text-[var(--ink-muted)]">
        Market coverage data will appear here once published.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#072b3d] shadow-[0_40px_80px_-48px_rgba(7,43,61,0.65)]">
        <div className="px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#7ec8e8]">
            Interactive coverage
          </p>
          <p className="mt-2 max-w-md text-sm text-white/65">
            Real geography with Generio regions overlaid. Select a region, then inspect country pins.
          </p>
        </div>

        <div className="relative mx-3 mb-3 h-[380px] overflow-hidden rounded-[1.4rem] sm:mx-4 sm:mb-4 sm:h-[460px]">
          <MapContainer
            bounds={COVERAGE_BOUNDS}
            scrollWheelZoom
            className="generio-leaflet-map h-full w-full"
            style={{ background: "#0a3244" }}
          >
            <TileLayer
              attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
            <MapFocus active={active} focusedCountry={focusedCountry} />

            {sorted.map((region) => {
              const selected = region.slug === active?.slug;
              const color = region.highlightColor || "#1B9DD9";
              const [lat, lng] = regionLatLng(region);
              return (
                <Marker
                  key={region.id}
                  position={[lat, lng]}
                  icon={regionIcon(region.name, color, selected)}
                  eventHandlers={{
                    click: () => selectRegion(region.slug),
                  }}
                  zIndexOffset={selected ? 600 : 200}
                >
                  <Tooltip direction="top" offset={[0, -18]} opacity={1}>
                    <span className="font-semibold">{region.name}</span>
                    <span className="block text-xs opacity-70">{region.countries.length} markets</span>
                  </Tooltip>
                </Marker>
              );
            })}

            {active?.countries.map((country, index) => {
              const [lat, lng] = countryLatLng(country, active, index);
              const focused = focusedCountryId === country.id;
              return (
                <CircleMarker
                  key={country.id}
                  center={[lat, lng]}
                  radius={focused ? 10 : 7}
                  pathOptions={{
                    color: focused ? "#ffffff" : "#7ec8e8",
                    fillColor: focused ? "#1B9DD9" : "#1B9DD9",
                    fillOpacity: focused ? 1 : 0.85,
                    weight: focused ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => setFocusedCountryId(country.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]}>
                    {country.name}
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-5 sm:px-6 lg:hidden">
          {sorted.map((region) => {
            const selected = region.slug === active?.slug;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => selectRegion(region.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? "bg-white text-[var(--brand-deep)]"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {region.name}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="flex flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border)] px-6 py-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            Region detail
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {active?.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
            {active?.description ?? "Generio coverage for this region."}
          </p>
          <div className="mt-5 flex items-center gap-3 text-sm text-[var(--ink-muted)]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: active?.highlightColor || "#1B9DD9" }}
            />
            {active?.countries.length ?? 0} markets in focus
          </div>
        </div>

        <div className="hidden flex-wrap gap-2 border-b border-[var(--border)] px-6 py-4 lg:flex">
          {sorted.map((region) => {
            const selected = region.slug === active?.slug;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => selectRegion(region.slug)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  selected
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {region.name}
              </button>
            );
          })}
        </div>

        <ul className="flex-1 divide-y divide-[var(--border)] overflow-y-auto" aria-live="polite">
          {(active?.countries ?? []).map((country, index) => (
            <li key={country.id}>
              <button
                type="button"
                onClick={() => setFocusedCountryId(country.id)}
                className={`flex w-full items-start gap-4 px-6 py-4 text-left transition ${
                  focusedCountryId === country.id
                    ? "bg-[var(--brand-primary-light)]"
                    : "hover:bg-[var(--surface-muted)]"
                }`}
              >
                <span className="mt-0.5 font-display text-xs font-semibold tracking-[0.18em] text-[var(--brand-primary)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold text-[var(--ink)]">
                    {country.name}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--ink-muted)]">
                    {country.shortDescription ?? "Active Generio coverage market"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
