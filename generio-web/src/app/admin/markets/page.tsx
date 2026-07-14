"use client";

import { FormEvent, useState } from "react";
import {
  AdminDenied,
  AdminField,
  AdminFlash,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
  AdminTable,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import {
  AdminMarketRegion,
  CountryPayload,
  UpsertMarketRegionPayload,
  createAdminMarketRegion,
  errorMessage,
  fetchAdminMarkets,
  toSlug,
  updateAdminMarketCountries,
  updateAdminMarketRegion,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function emptyRegion(): UpsertMarketRegionPayload {
  return {
    name: "",
    slug: "",
    description: "",
    highlightColor: "#1B9DD9",
    boundaryJson: "",
    centroidLat: null,
    centroidLng: null,
    displayOrder: 1,
    isActive: true,
  };
}

function emptyCountry(): CountryPayload {
  return {
    id: null,
    name: "",
    isoCode: "",
    latitude: null,
    longitude: null,
    shortDescription: "",
    displayOrder: 1,
    isActive: true,
  };
}

export default function AdminMarketsPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Markets.Edit");
  const [regions, setRegions] = useState<AdminMarketRegion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [regionForm, setRegionForm] = useState<UpsertMarketRegionPayload>(emptyRegion());
  const [countries, setCountries] = useState<CountryPayload[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function applyRegions(data: AdminMarketRegion[], preferId?: string | null) {
    setRegions(data);
    const nextId = preferId !== undefined ? preferId : data[0]?.id ?? null;
    setSelectedId(nextId);
    const selected = data.find((r) => r.id === nextId);
    if (selected) {
      setRegionForm({
        name: selected.name,
        slug: selected.slug,
        description: selected.description ?? "",
        highlightColor: selected.highlightColor ?? "#1B9DD9",
        boundaryJson: selected.boundaryJson ?? "",
        centroidLat: selected.centroidLat,
        centroidLng: selected.centroidLng,
        displayOrder: selected.displayOrder,
        isActive: selected.isActive,
      });
      setCountries(
        selected.countries.map((c) => ({
          id: c.id,
          name: c.name,
          isoCode: c.isoCode ?? "",
          latitude: c.latitude,
          longitude: c.longitude,
          shortDescription: c.shortDescription ?? "",
          displayOrder: c.displayOrder,
          isActive: c.isActive,
        })),
      );
    } else {
      setRegionForm(emptyRegion());
      setCountries([]);
    }
  }

  async function load(selectId?: string | null) {
    if (!accessToken) return;
    const data = await fetchAdminMarkets(accessToken);
    applyRegions(data, selectId !== undefined ? selectId : selectedId);
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Markets.View")),
    () => fetchAdminMarkets(accessToken!),
    (data) => applyRegions(data, data[0]?.id ?? null),
    setError,
    "Unable to load markets.",
    [accessToken, hasPermission],
  );

  function startNew() {
    setSelectedId(null);
    setRegionForm(emptyRegion());
    setCountries([]);
  }

  function selectRegion(id: string) {
    const selected = regions.find((r) => r.id === id);
    if (!selected) return;
    setSelectedId(id);
    setRegionForm({
      name: selected.name,
      slug: selected.slug,
      description: selected.description ?? "",
      highlightColor: selected.highlightColor ?? "#1B9DD9",
      boundaryJson: selected.boundaryJson ?? "",
      centroidLat: selected.centroidLat,
      centroidLng: selected.centroidLng,
      displayOrder: selected.displayOrder,
      isActive: selected.isActive,
    });
    setCountries(
      selected.countries.map((c) => ({
        id: c.id,
        name: c.name,
        isoCode: c.isoCode ?? "",
        latitude: c.latitude,
        longitude: c.longitude,
        shortDescription: c.shortDescription ?? "",
        displayOrder: c.displayOrder,
        isActive: c.isActive,
      })),
    );
  }

  async function saveRegion(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const payload = {
      ...regionForm,
      slug: regionForm.slug?.trim() || toSlug(regionForm.name),
      centroidLat: regionForm.centroidLat === null || regionForm.centroidLat === undefined || Number.isNaN(Number(regionForm.centroidLat))
        ? null
        : Number(regionForm.centroidLat),
      centroidLng: regionForm.centroidLng === null || regionForm.centroidLng === undefined || Number.isNaN(Number(regionForm.centroidLng))
        ? null
        : Number(regionForm.centroidLng),
    };
    try {
      if (selectedId) {
        await updateAdminMarketRegion(accessToken, selectedId, payload);
        setMessage("Region saved.");
        await load(selectedId);
      } else {
        const created = await createAdminMarketRegion(accessToken, payload);
        setMessage("Region created.");
        await load(created.id);
      }
    } catch (err) {
      setError(errorMessage(err, "Unable to save region."));
    } finally {
      setSaving(false);
    }
  }

  async function saveCountries() {
    if (!accessToken || !canEdit || !selectedId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const refreshed = await updateAdminMarketCountries(
        accessToken,
        selectedId,
        countries.map((c, index) => ({
          ...c,
          name: c.name.trim(),
          displayOrder: c.displayOrder || index + 1,
          latitude: c.latitude == null || Number.isNaN(Number(c.latitude)) ? null : Number(c.latitude),
          longitude: c.longitude == null || Number.isNaN(Number(c.longitude)) ? null : Number(c.longitude),
        })),
      );
      setMessage("Countries saved.");
      await load(refreshed.id);
    } catch (err) {
      setError(errorMessage(err, "Unable to save countries."));
    } finally {
      setSaving(false);
    }
  }

  if (!hasPermission("Markets.View")) return <AdminDenied resource="markets" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Markets"
        description="Regions and countries powering the interactive coverage map."
        actions={
          canEdit ? (
            <button type="button" onClick={startNew} className={adminSecondaryButtonClass}>
              New region
            </button>
          ) : null
        }
      />

      <AdminTable headers={["Order", "Region", "Countries", "Status", ""]} empty={regions.length ? undefined : "No regions yet."}>
        {regions.map((region) => (
          <tr key={region.id} className="border-t border-[var(--border)]">
            <td className="px-4 py-2 text-[var(--ink-muted)]">{region.displayOrder}</td>
            <td className="px-4 py-2 font-medium">{region.name}</td>
            <td className="px-4 py-2 text-[var(--ink-muted)]">{region.countries.length}</td>
            <td className="px-4 py-2">
              <AdminStatusPill active={region.isActive} />
            </td>
            <td className="px-4 py-2 text-right">
              <button type="button" onClick={() => selectRegion(region.id)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title={selectedId ? "Edit region" : "Create region"}>
          <form onSubmit={saveRegion} className="space-y-4">
            <AdminField label="Name">
              <input required disabled={!canEdit} value={regionForm.name} onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Slug">
              <input disabled={!canEdit} value={regionForm.slug ?? ""} onChange={(e) => setRegionForm({ ...regionForm, slug: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Description">
              <textarea disabled={!canEdit} value={regionForm.description ?? ""} onChange={(e) => setRegionForm({ ...regionForm, description: e.target.value })} className={adminTextareaClass} />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="Highlight color">
                <input disabled={!canEdit} value={regionForm.highlightColor ?? "#1B9DD9"} onChange={(e) => setRegionForm({ ...regionForm, highlightColor: e.target.value })} className={adminInputClass} />
              </AdminField>
              <AdminField label="Centroid lat">
                <input
                  type="number"
                  step="any"
                  disabled={!canEdit}
                  value={regionForm.centroidLat ?? ""}
                  onChange={(e) => setRegionForm({ ...regionForm, centroidLat: e.target.value === "" ? null : Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Centroid lng">
                <input
                  type="number"
                  step="any"
                  disabled={!canEdit}
                  value={regionForm.centroidLng ?? ""}
                  onChange={(e) => setRegionForm({ ...regionForm, centroidLng: e.target.value === "" ? null : Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminField>
            </div>
            <AdminField label="Display order">
              <input type="number" disabled={!canEdit} value={regionForm.displayOrder} onChange={(e) => setRegionForm({ ...regionForm, displayOrder: Number(e.target.value) })} className={adminInputClass} />
            </AdminField>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={!canEdit} checked={regionForm.isActive} onChange={(e) => setRegionForm({ ...regionForm, isActive: e.target.checked })} />
              Active
            </label>
            <AdminFlash message={message} error={error} />
            {canEdit ? (
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : selectedId ? "Save region" : "Create region"}
              </button>
            ) : null}
          </form>
        </AdminPanel>

        <AdminPanel title="Countries in region">
          {!selectedId ? (
            <p className="text-sm text-[var(--ink-muted)]">Save a region first, then manage its countries.</p>
          ) : (
            <div className="space-y-4">
              {countries.map((country, index) => (
                <div key={country.id ?? `new-${index}`} className="space-y-3 rounded-md border border-[var(--border)] p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AdminField label="Name">
                      <input
                        disabled={!canEdit}
                        value={country.name}
                        onChange={(e) => {
                          const next = [...countries];
                          next[index] = { ...country, name: e.target.value };
                          setCountries(next);
                        }}
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="ISO code">
                      <input
                        disabled={!canEdit}
                        value={country.isoCode ?? ""}
                        onChange={(e) => {
                          const next = [...countries];
                          next[index] = { ...country, isoCode: e.target.value };
                          setCountries(next);
                        }}
                        className={adminInputClass}
                      />
                    </AdminField>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <AdminField label="Latitude">
                      <input
                        type="number"
                        step="any"
                        disabled={!canEdit}
                        value={country.latitude ?? ""}
                        onChange={(e) => {
                          const next = [...countries];
                          next[index] = {
                            ...country,
                            latitude: e.target.value === "" ? null : Number(e.target.value),
                          };
                          setCountries(next);
                        }}
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Longitude">
                      <input
                        type="number"
                        step="any"
                        disabled={!canEdit}
                        value={country.longitude ?? ""}
                        onChange={(e) => {
                          const next = [...countries];
                          next[index] = {
                            ...country,
                            longitude: e.target.value === "" ? null : Number(e.target.value),
                          };
                          setCountries(next);
                        }}
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Order">
                      <input
                        type="number"
                        disabled={!canEdit}
                        value={country.displayOrder}
                        onChange={(e) => {
                          const next = [...countries];
                          next[index] = { ...country, displayOrder: Number(e.target.value) };
                          setCountries(next);
                        }}
                        className={adminInputClass}
                      />
                    </AdminField>
                  </div>
                  <AdminField label="Short description">
                    <input
                      disabled={!canEdit}
                      value={country.shortDescription ?? ""}
                      onChange={(e) => {
                        const next = [...countries];
                        next[index] = { ...country, shortDescription: e.target.value };
                        setCountries(next);
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={country.isActive}
                        onChange={(e) => {
                          const next = [...countries];
                          next[index] = { ...country, isActive: e.target.checked };
                          setCountries(next);
                        }}
                      />
                      Active
                    </label>
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => setCountries(countries.filter((_, i) => i !== index))}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {canEdit ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCountries([...countries, { ...emptyCountry(), displayOrder: countries.length + 1 }])}
                    className={adminSecondaryButtonClass}
                  >
                    Add country
                  </button>
                  <button type="button" disabled={saving} onClick={saveCountries} className={adminPrimaryButtonClass}>
                    {saving ? "Saving…" : "Save countries"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
