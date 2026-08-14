"use client";

import * as React from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { LocateFixed, Search, Loader2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map, MapMarker, MarkerContent, MapControls, useMap, type MapRef } from "@/components/ui/map";

// Jakarta — sane default center when no geolocation/initial coords are
// available. MapLibre (mapcn) uses [lng, lat] order, unlike Leaflet's [lat, lng].
const DEFAULT_CENTER: [number, number] = [106.8456, -6.2088];

type NominatimResult = { display_name: string; lat: string; lon: string };

export interface LocationPickerResult {
  address: string;
  lat: number;
  lng: number;
}

/** Reports map clicks as lng/lat — renders inside <Map> to read the instance
 * off context (mapcn's `useMap`) rather than managing its own ref/lifecycle. */
function ClickToPlace({ onPick }: { onPick: (lng: number, lat: number) => void }) {
  const { map } = useMap();
  React.useEffect(() => {
    if (!map) return;
    const handleClick = (e: MapMouseEvent) => onPick(e.lngLat.lng, e.lngLat.lat);
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onPick]);
  return null;
}

/** Pin-on-map address picker built on mapcn's MapLibre components (free CARTO
 * basemap tiles, no API key) + Nominatim geocoding (also free, no API key).
 * Nominatim's usage policy expects a server-side integration to identify
 * itself via a custom User-Agent, which isn't possible from browser `fetch`
 * — fine for this app's traffic level, but a production deployment with real
 * volume should proxy these requests through its own backend instead of
 * calling Nominatim directly. */
export default function LocationPickerDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: LocationPickerResult) => void;
}) {
  const mapRef = React.useRef<MapRef>(null);

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<NominatimResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [resolvedAddress, setResolvedAddress] = React.useState("");
  const [resolving, setResolving] = React.useState(false);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(false);
  // MapLibre (mapcn) draws entirely via WebGL, unlike the old Leaflet setup
  // which used plain <img> raster tiles — a browser/VM/remote-desktop with
  // WebGL disabled or broken renders nothing at all rather than degrading
  // gracefully. WebGL support doesn't change mid-session, so a lazy
  // initializer (checked once, ever) is enough — falls back to search-only
  // picking, which stays fully functional without the visual map.
  const [webglSupported] = React.useState<boolean>(() => {
    if (typeof document === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  });

  const reverseGeocode = React.useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=0`);
      const data = await res.json();
      setResolvedAddress(data?.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch {
      setResolvedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setResolving(false);
    }
  }, []);

  const moveTo = React.useCallback(
    (lat: number, lng: number, fly = true) => {
      setCoords({ lat, lng });
      if (fly) mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
      reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(trimmed)}&countrycodes=id&limit=5`,
      );
      setResults((await res.json()) as NominatimResult[]);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (result: NominatimResult) => {
    setResults([]);
    setQuery(result.display_name);
    moveTo(Number(result.lat), Number(result.lon));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        moveTo(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Resets UI-only state when the dialog closes so re-opening starts fresh —
  // mapcn's <Map> tears itself down on unmount, so there's no map/marker
  // cleanup to do here.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setResults([]);
      setQuery("");
    }
    onOpenChange(next);
  };

  const markerPosition = coords ?? { lat: DEFAULT_CENTER[1], lng: DEFAULT_CENTER[0] };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" /> Pilih Lokasi di Peta
          </DialogTitle>
          <DialogDescription>Klik atau geser pin ke lokasi pengirimanmu — alamat terisi otomatis.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari alamat, jalan, atau tempat..." className="flex-1" />
            <Button type="submit" size="icon" variant="outline" disabled={searching} aria-label="Cari lokasi">
              {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={useMyLocation} disabled={locating} aria-label="Gunakan lokasi saya">
              {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
            </Button>
          </form>

          {results.length > 0 && (
            <ul className="max-h-32 space-y-0.5 overflow-y-auto rounded-lg border-2 border-border/60 bg-background p-1">
              {results.map((result) => (
                <li key={`${result.lat}-${result.lon}`}>
                  <button type="button" onClick={() => selectResult(result)} className="w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted">
                    {result.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {open && webglSupported !== false && (
          <div className="h-64 w-full overflow-hidden rounded-xl border-2 border-border/60 sm:h-80">
            <Map ref={mapRef} center={coords ? [coords.lng, coords.lat] : DEFAULT_CENTER} zoom={coords ? 16 : 12}>
              <MapControls position="top-right" showZoom />
              <ClickToPlace onPick={(lng, lat) => moveTo(lat, lng, false)} />
              <MapMarker
                longitude={markerPosition.lng}
                latitude={markerPosition.lat}
                draggable
                onDragEnd={(lngLat) => moveTo(lngLat.lat, lngLat.lng, false)}
              >
                <MarkerContent>
                  <MapPin className="size-8 -translate-y-1/2 fill-primary text-primary-foreground drop-shadow-md" strokeWidth={1.5} />
                </MarkerContent>
              </MapMarker>
            </Map>
          </div>
        )}

        {open && webglSupported === false && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-muted/40 p-4 text-center text-sm text-muted-foreground sm:h-80">
            <MapPin className="size-6" />
            <p>Peta interaktif tidak didukung di browser ini (WebGL nonaktif).</p>
            <p className="text-xs">Gunakan kolom pencarian atau tombol lokasi di atas — alamat tetap terisi otomatis.</p>
          </div>
        )}

        <div className="rounded-lg border-2 border-border/60 bg-muted/40 px-3 py-2 text-xs">
          <p className="font-semibold text-muted-foreground">Alamat terpilih:</p>
          <p className="font-medium text-foreground">{resolving ? "Mencari alamat..." : resolvedAddress || "Klik peta untuk memilih lokasi"}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={!coords || resolving}
            onClick={() => {
              if (!coords) return;
              onConfirm({ address: resolvedAddress, lat: coords.lat, lng: coords.lng });
              handleOpenChange(false);
            }}
          >
            Gunakan Lokasi Ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
