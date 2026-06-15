"use client";

import { useEffect, useRef, useState } from "react";
import {
  MISSIONS,
  STATUS_CONFIG,
  TYPE_CONFIG,
  type Mission,
  type MarkerType,
  type Status,
} from "../data/missions";

function totalBeneficiaries(missions: Mission[]) {
  return missions.reduce(
    (acc, m) => ({ orphans: acc.orphans + m.orphans, widows: acc.widows + m.widows }),
    { orphans: 0, widows: 0 }
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ mission, onClose }: { mission: Mission; onClose: () => void }) {
  const cfg = STATUS_CONFIG[mission.status];
  const typeInfo = TYPE_CONFIG[mission.type];
  const total = mission.orphans + mission.widows;

  return (
    <div className="absolute right-0 top-0 h-full w-[340px] max-w-[90vw] bg-gray-950 border-l border-gray-800 flex flex-col z-[1000] shadow-2xl">
      <div className="p-5 border-b border-gray-800" style={{ borderTopColor: cfg.color, borderTopWidth: 3 }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                style={{ background: `${cfg.color}22`, color: cfg.color }}>
                {cfg.label}
              </span>
              <span className="text-xs text-gray-500">{typeInfo.icon} {typeInfo.label}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{mission.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{mission.country} · {mission.category}</p>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-500 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>
      </div>

      {mission.status === "active" ? (
        <div className="p-5 border-b border-gray-800">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Currently Cared For</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white tabular-nums">{mission.orphans.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Orphans</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white tabular-nums">{mission.widows.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Widows</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: `${cfg.color}18` }}>
              <div className="text-2xl font-bold tabular-nums" style={{ color: cfg.color }}>{total.toLocaleString()}</div>
              <div className="text-[10px] mt-0.5 uppercase tracking-wide" style={{ color: cfg.color }}>Total</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 border-b border-gray-800">
          <div className="rounded-xl p-4 text-center" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}40` }}>
            <div className="text-2xl mb-1">🌟</div>
            <p className="text-sm font-semibold" style={{ color: cfg.color }}>Coming Soon</p>
            <p className="text-xs text-gray-400 mt-1">This site is in development.</p>
          </div>
        </div>
      )}

      <div className="p-5 flex-1 overflow-y-auto">
        <p className="text-sm text-gray-400 leading-relaxed">{mission.description}</p>
      </div>
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ typeFilter }: { typeFilter: MarkerType | "all" }) {
  const visible = MISSIONS.filter((m) => typeFilter === "all" || m.type === typeFilter);
  const active = visible.filter((m) => m.status === "active");
  const { orphans, widows } = totalBeneficiaries(active);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-xl bg-gray-950/90 border border-gray-800 text-white shadow-xl backdrop-blur-sm flex gap-5 items-center whitespace-nowrap">
      <div className="text-center">
        <div className="text-xl font-bold tabular-nums" style={{ color: "#e5472a" }}>{orphans.toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400">Orphans</div>
      </div>
      <div className="w-px h-8 bg-gray-700" />
      <div className="text-center">
        <div className="text-xl font-bold tabular-nums" style={{ color: "#fcb21c" }}>{widows.toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400">Widows</div>
      </div>
      <div className="w-px h-8 bg-gray-700" />
      <div className="text-center">
        <div className="text-xl font-bold text-white tabular-nums">{(orphans + widows).toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400">Total Cared For</div>
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend({ statusFilter, setStatusFilter }: {
  statusFilter: Status | "all";
  setStatusFilter: (s: Status | "all") => void;
}) {
  return (
    <div className="absolute bottom-8 left-4 z-[500] rounded-xl bg-gray-950/90 border border-gray-800 shadow-xl backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 space-y-2 min-w-[170px]">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Filter</p>
        {(["all", "active", "upcoming"] as const).map((key) => {
          const isAll = key === "all";
          const cfg = isAll ? null : STATUS_CONFIG[key];
          return (
            <button key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-2.5 w-full rounded-lg px-2.5 py-1.5 text-xs transition-colors ${statusFilter === key ? "bg-gray-800" : "hover:bg-gray-900/60"}`}>
              {isAll ? (
                <span className="w-3 h-3 rounded-full bg-gray-500 shrink-0" />
              ) : (
                <span className="relative inline-block w-3 h-3 shrink-0">
                  <span className="absolute inset-0 rounded-full opacity-40 animate-pulse" style={{ background: cfg!.color }} />
                  <span className="absolute inset-[2px] rounded-full" style={{ background: cfg!.color }} />
                </span>
              )}
              <span className="text-gray-300 font-medium">{isAll ? "All Sites" : cfg!.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MissionMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MarkerType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // ── init MapLibre ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    let cancelled = false;

    import("maplibre-gl").then((mod) => {
      if (cancelled || !mapContainer.current) return;
      const maplibregl = mod.default;

      // Inject MapLibre CSS once
      if (!document.getElementById("maplibre-css")) {
        const link = document.createElement("link");
        link.id = "maplibre-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }

      let m: import("maplibre-gl").Map;
      try {
        m = new maplibregl.Map({
          container: mapContainer.current!,
          style: {
            version: 8,
            sources: {
              "carto": {
                type: "raster",
                tiles: [
                  "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                  "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                  "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                  "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                ],
                tileSize: 256,
                attribution: "© CARTO · © OpenStreetMap contributors",
              },
              "terrain": {
                type: "raster-dem",
                tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
                tileSize: 256,
                encoding: "terrarium" as "terrarium",
                maxzoom: 12,
              },
            },
            layers: [
              {
                id: "carto-layer",
                type: "raster",
                source: "carto",
                paint: { "raster-fade-duration": 200 },
              },
              {
                id: "hillshade-layer",
                type: "hillshade",
                source: "terrain",
                paint: {
                  "hillshade-exaggeration": 0.28,
                  "hillshade-shadow-color": "#0a0516",
                  "hillshade-highlight-color": "#e0e8ff",
                  "hillshade-accent-color": "#111827",
                  "hillshade-illumination-direction": 315,
                },
              },
            ],
          },
          center: [20, 15],
          zoom: 3,
          pitch: 35,
          bearing: 0,
          minZoom: 2,
          maxZoom: 14,
          renderWorldCopies: true,
          attributionControl: { compact: true },
        });
      } catch {
        setWebglError(true);
        return;
      }

      m.on("error", (e) => {
        if (e.error?.message?.toLowerCase().includes("webgl")) setWebglError(true);
      });

      m.on("load", () => {
        if (cancelled) { m.remove(); return; }
        // Activate 3D terrain
        m.setTerrain({ source: "terrain", exaggeration: 1.8 });
        mapRef.current = m;
        setMapReady(true);
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── place / refresh markers ───────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    import("maplibre-gl").then((mod) => {
      const maplibregl = mod.default;
      if (!mapRef.current) return;

      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];

      MISSIONS
        .filter((m) => typeFilter === "all" || m.type === typeFilter)
        .filter((m) => statusFilter === "all" || m.status === statusFilter)
        .forEach((mission) => {
          const cfg = STATUS_CONFIG[mission.status];

          const el = document.createElement("div");
          el.className = "wc-marker";
          el.style.setProperty("--clr", cfg.color);
          el.innerHTML = `<div class="wc-glow"></div><div class="wc-dot"></div>`;
          el.addEventListener("click", () => setSelectedMission(mission));

          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([mission.lng, mission.lat])
            .addTo(mapRef.current!);

          markersRef.current.push(marker);
        });
    });
  }, [mapReady, typeFilter, statusFilter]);

  // ── resize map when detail panel opens/closes ─────────────────
  useEffect(() => {
    setTimeout(() => mapRef.current?.resize(), 310);
  }, [selectedMission]);

  const rightOffset = selectedMission ? 340 : 0;

  if (webglError) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-950 text-center p-8">
        <div>
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-white font-bold text-xl mb-2">WebGL Required</h2>
          <p className="text-gray-400 text-sm max-w-sm">This map requires WebGL, which is disabled in this browser or environment. Try opening it in Chrome or Safari on a standard device.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-gray-950">

      {/* Map canvas */}
      <div
        ref={mapContainer}
        className="absolute inset-0 transition-[right] duration-300"
        style={{ right: rightOffset }}
      />

      {/* UI overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ right: rightOffset }}>

        {/* Title */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="bg-gray-950/90 border border-gray-800 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
            <p className="text-sm font-bold text-white leading-tight">World Challenge</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Global Missions Map</p>
          </div>
        </div>

        {/* Stats */}
        <StatsBar typeFilter={typeFilter} />

        {/* Type filter */}
        <div className="absolute top-4 right-4 pointer-events-auto flex rounded-xl overflow-hidden text-xs font-semibold shadow-lg bg-gray-950/90 border border-gray-800">
          {(["all", "site", "people_group", "program"] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 transition-colors cursor-pointer ${typeFilter === t ? "text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              style={typeFilter === t ? { background: "#e5472a" } : {}}>
              {t === "all" ? "All" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto">
          <Legend statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-8 right-4 pointer-events-auto flex flex-col gap-2">
          <button onClick={() => mapRef.current?.zoomIn()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gray-900/90 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 backdrop-blur-sm">+</button>
          <button onClick={() => mapRef.current?.zoomOut()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gray-900/90 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 backdrop-blur-sm">−</button>
          <button
            onClick={() => mapRef.current?.easeTo({ center: [20, 15], zoom: 3, pitch: 35, bearing: 0, duration: 800 })}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900/90 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 backdrop-blur-sm"
            title="Reset view">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Detail panel */}
      {selectedMission && (
        <DetailPanel mission={selectedMission} onClose={() => setSelectedMission(null)} />
      )}
    </div>
  );
}
