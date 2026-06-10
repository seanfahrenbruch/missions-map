"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MISSIONS,
  ALL_YEARS,
  STATUS_CONFIG,
  TYPE_CONFIG,
  type Mission,
  type MarkerType,
  type Status,
} from "../data/missions";

// ── helpers ──────────────────────────────────────────────────────────────────

function getSnapshot(mission: Mission, year: number) {
  // Find the most recent snapshot at or before the selected year
  const sorted = [...mission.snapshots].filter((s) => s.year <= year).sort((a, b) => b.year - a.year);
  return sorted[0] ?? null;
}

function buildGeoJSON(year: number, typeFilter: MarkerType | "all") {
  return {
    type: "FeatureCollection" as const,
    features: MISSIONS.filter((m) => (typeFilter === "all" ? true : m.type === typeFilter))
      .map((m) => {
        const snap = getSnapshot(m, year);
        if (!snap) return null;
        return {
          type: "Feature" as const,
          properties: {
            id: m.id,
            name: m.name,
            status: snap.status,
            color: STATUS_CONFIG[snap.status].color,
            glow: STATUS_CONFIG[snap.status].glow,
            type: m.type,
            category: m.category,
            metric: snap.metric ?? "",
            notes: snap.notes,
            year: snap.year,
          },
          geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null),
  };
}

// ── sub-components ────────────────────────────────────────────────────────────

function DetailPanel({ mission, year, onClose }: { mission: Mission; year: number; onClose: () => void }) {
  const snap = getSnapshot(mission, year);
  const typeInfo = TYPE_CONFIG[mission.type];
  const sorted = [...mission.snapshots].sort((a, b) => a.year - b.year);

  return (
    <div className="absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-gray-950 border-l border-gray-700 flex flex-col z-20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: snap ? `${STATUS_CONFIG[snap.status].color}33` : undefined, color: snap ? STATUS_CONFIG[snap.status].color : undefined }}>
              {snap ? STATUS_CONFIG[snap.status].label : "Not started"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white leading-snug">{mission.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{mission.country} · {mission.category}</p>
        </div>
        <button onClick={onClose} className="shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Current snapshot */}
        {snap && (
          <div className="p-5 border-b border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              {snap.year === year ? `In ${year}` : `As of ${snap.year} (latest before ${year})`}
            </div>
            {snap.metric && (
              <div className="text-2xl font-bold text-white mb-1">{snap.metric}</div>
            )}
            <p className="text-sm text-gray-300">{snap.notes}</p>
          </div>
        )}

        {/* Description */}
        <div className="p-5 border-b border-gray-800">
          <p className="text-sm text-gray-400 leading-relaxed">{mission.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {mission.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{t}</span>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <span className="text-gray-400 font-medium">{mission.team}</span> · Started {mission.started}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Full Timeline</h3>
          <div className="relative">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-700" />
            <div className="space-y-4">
              {sorted.map((s, i) => {
                const cfg = STATUS_CONFIG[s.status];
                const isActive = s.year <= year && (sorted[i + 1]?.year ?? 9999) > year;
                return (
                  <div key={s.year} className="flex gap-3 relative">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-gray-900 shrink-0 mt-0.5 z-10 transition-all"
                      style={{ background: cfg.color, boxShadow: isActive ? `0 0 0 3px ${cfg.glow}` : "none" }}
                    />
                    <div className={`pb-1 ${isActive ? "" : "opacity-60"}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white">{s.year}</span>
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                        {s.metric && <span className="text-xs text-gray-500">{s.metric}</span>}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{s.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ statusFilter, setStatusFilter }: {
  statusFilter: Status | "all";
  setStatusFilter: (s: Status | "all") => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="absolute bottom-24 left-4 z-10 rounded-xl text-xs bg-gray-950/95 border border-gray-700 shadow-xl backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 px-4 py-2.5 w-full text-left font-semibold text-gray-200 border-b border-gray-700 hover:bg-gray-900"
      >
        Legend / Filter
        <span className={`transition-transform text-gray-500 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 min-w-[200px]">
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex items-center gap-2 w-full rounded px-1.5 py-1 transition-colors ${statusFilter === "all" ? "bg-gray-800" : "hover:bg-gray-900"}`}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-gray-500 shrink-0" />
            <span className="text-gray-300">All statuses</span>
          </button>
          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={`flex items-center gap-2 w-full rounded px-1.5 py-1 transition-colors ${statusFilter === key ? "bg-gray-800" : "hover:bg-gray-900"}`}
            >
              <span className="relative inline-block w-3 h-3 shrink-0">
                <span className="absolute inset-0 rounded-full opacity-40 animate-pulse" style={{ background: cfg.color }} />
                <span className="absolute inset-[2px] rounded-full" style={{ background: cfg.color }} />
              </span>
              <span className="text-gray-300">{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsBar({ year, typeFilter }: { year: number; typeFilter: MarkerType | "all" }) {
  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map((k) => [k, 0])) as Record<Status, number>;
  let total = 0;
  MISSIONS.filter((m) => typeFilter === "all" || m.type === typeFilter).forEach((m) => {
    const snap = getSnapshot(m, year);
    if (snap) { counts[snap.status]++; total++; }
  });

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-5 py-3 rounded-xl bg-gray-950/95 border border-gray-700 text-white shadow-xl backdrop-blur-sm flex gap-5 items-center">
      <div className="text-center">
        <div className="text-2xl font-bold tabular-nums">{total}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400">Total</div>
      </div>
      <div className="w-px h-8 bg-gray-700" />
      {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
        counts[key as Status] > 0 && (
          <div key={key} className="text-center">
            <div className="text-lg font-bold tabular-nums" style={{ color: cfg.color }}>{counts[key as Status]}</div>
            <div className="text-[10px] text-gray-400">{cfg.label}</div>
          </div>
        )
      ))}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function MissionMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);

  const [year, setYear] = useState(ALL_YEARS[ALL_YEARS.length - 1]);
  const [typeFilter, setTypeFilter] = useState<MarkerType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── playback ──────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        if (playRef.current) clearInterval(playRef.current);
        return false;
      }
      setYear(ALL_YEARS[0]);
      playRef.current = setInterval(() => {
        setYear((y) => {
          const idx = ALL_YEARS.indexOf(y);
          if (idx >= ALL_YEARS.length - 1) {
            clearInterval(playRef.current!);
            setIsPlaying(false);
            return y;
          }
          return ALL_YEARS[idx + 1];
        });
      }, 900);
      return true;
    });
  }, []);

  useEffect(() => () => { if (playRef.current) clearInterval(playRef.current); }, []);

  // ── init map ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution: "© CARTO © OpenStreetMap contributors",
          },
        },
        layers: [
          { id: "carto-dark-layer", type: "raster", source: "carto-dark", minzoom: 0, maxzoom: 22 },
        ],
      },
      center: [20, 15],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 12,
    });

    map.current.on("load", () => {
      const m = map.current!;

      // Add GeoJSON source
      m.addSource("missions", {
        type: "geojson",
        data: buildGeoJSON(ALL_YEARS[ALL_YEARS.length - 1], "all"),
      });

      // Glow / halo layer
      m.addLayer({
        id: "missions-halo",
        type: "circle",
        source: "missions",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 10, 8, 22],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.18,
          "circle-blur": 1,
        },
      });

      // Main dot layer
      m.addLayer({
        id: "missions-dot",
        type: "circle",
        source: "missions",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 5, 8, 13],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#111827",
          "circle-opacity": 0.9,
        },
      });

      // Label layer
      m.addLayer({
        id: "missions-label",
        type: "symbol",
        source: "missions",
        minzoom: 4,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Regular"],
          "text-size": 11,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-max-width": 10,
        },
        paint: {
          "text-color": "#e5e7eb",
          "text-halo-color": "#111827",
          "text-halo-width": 1.5,
        },
      });

      // Hover popup
      popup.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "mission-hover-popup",
        offset: 12,
      });

      m.on("mouseenter", "missions-dot", (e) => {
        m.getCanvas().style.cursor = "pointer";
        const feat = e.features?.[0];
        if (!feat) return;
        const { name, status, metric, category, country } = feat.properties as Record<string, string>;
        const cfg = STATUS_CONFIG[status as Status];
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:system-ui,sans-serif;padding:8px 10px;min-width:160px">
              <div style="font-weight:700;color:#f9fafb;font-size:13px;margin-bottom:3px">${name}</div>
              <div style="font-size:11px;color:#9ca3af;margin-bottom:5px">${country} · ${category}</div>
              <div style="display:flex;align-items:center;gap:5px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cfg.color}"></span>
                <span style="font-size:11px;font-weight:600;color:${cfg.color}">${cfg.label}</span>
                ${metric ? `<span style="font-size:11px;color:#d1d5db;margin-left:4px">${metric}</span>` : ""}
              </div>
            </div>
          `)
          .addTo(m);
      });

      m.on("mouseleave", "missions-dot", () => {
        m.getCanvas().style.cursor = "";
        popup.current?.remove();
      });

      m.on("click", "missions-dot", (e) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const id = feat.properties?.id as string;
        const mission = MISSIONS.find((m) => m.id === id) ?? null;
        setSelectedMission(mission);
        popup.current?.remove();
      });

      setMapLoaded(true);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // ── update map data when filters/year change ──────────────────
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const src = map.current.getSource("missions") as maplibregl.GeoJSONSource;
    if (!src) return;

    const geo = buildGeoJSON(year, typeFilter);
    const filtered = statusFilter === "all"
      ? geo
      : { ...geo, features: geo.features.filter((f) => f?.properties?.status === statusFilter) };

    src.setData(filtered as Parameters<typeof src.setData>[0]);
  }, [year, typeFilter, statusFilter, mapLoaded]);

  // ── resize map when panel opens/closes ────────────────────────
  useEffect(() => {
    setTimeout(() => map.current?.resize(), 300);
  }, [selectedMission]);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-gray-950 font-sans">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="absolute inset-0 transition-all duration-300"
        style={{ right: selectedMission ? "384px" : "0" }}
      />

      {/* Top-left logo / title */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="bg-gray-950/90 border border-gray-700 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-bold text-white leading-tight">Missions Field Map</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">What's working · What's not</p>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar year={year} typeFilter={typeFilter} />

      {/* Type filter tabs */}
      <div className="absolute top-4 right-4 z-10 flex rounded-xl overflow-hidden text-xs font-semibold shadow-lg bg-gray-950/90 border border-gray-700"
        style={{ right: selectedMission ? "408px" : "16px" }}
      >
        {(["all", "site", "people_group", "program"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-2 transition-colors cursor-pointer ${typeFilter === t ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-800"}`}
          >
            {t === "all" ? "All" : TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Year slider */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-gray-950/95 border border-gray-700 rounded-xl px-6 py-4 shadow-xl backdrop-blur-sm"
        style={{ maxWidth: selectedMission ? "calc(100vw - 420px)" : "600px", width: "90vw" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-gray-400">Year</span>
          <span className="text-2xl font-bold text-white tabular-nums">{year}</span>
          <button
            onClick={togglePlay}
            className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${isPlaying ? "bg-red-700 hover:bg-red-600 text-white" : "bg-blue-700 hover:bg-blue-600 text-white"}`}
          >
            {isPlaying ? "⏹ Stop" : "▶ Replay"}
          </button>
        </div>
        <input
          type="range"
          min={ALL_YEARS[0]}
          max={ALL_YEARS[ALL_YEARS.length - 1]}
          step={1}
          value={year}
          onChange={(e) => { if (isPlaying) { setIsPlaying(false); if (playRef.current) clearInterval(playRef.current); } setYear(Number(e.target.value)); }}
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          {ALL_YEARS.filter((_, i) => i % 2 === 0 || i === ALL_YEARS.length - 1).map((y) => (
            <span key={y} className={`text-[10px] tabular-nums ${y === year ? "text-white font-bold" : "text-gray-600"}`}>{y}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <Legend statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {/* Attribution */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-[10px] text-gray-600">
        Map data © CARTO · © OpenStreetMap contributors
      </div>

      {/* Detail panel */}
      {selectedMission && (
        <DetailPanel
          mission={selectedMission}
          year={year}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  );
}
