"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const sorted = [...mission.snapshots]
    .filter((s) => s.year <= year)
    .sort((a, b) => b.year - a.year);
  return sorted[0] ?? null;
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ mission, year, onClose }: { mission: Mission; year: number; onClose: () => void }) {
  const snap = getSnapshot(mission, year);
  const typeInfo = TYPE_CONFIG[mission.type];
  const sorted = [...mission.snapshots].sort((a, b) => a.year - b.year);

  return (
    <div className="absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-gray-950 border-l border-gray-700 flex flex-col z-[1000] shadow-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: snap ? `${STATUS_CONFIG[snap.status].color}33` : undefined,
                color: snap ? STATUS_CONFIG[snap.status].color : undefined,
              }}
            >
              {snap ? STATUS_CONFIG[snap.status].label : "Not started"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white leading-snug">{mission.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{mission.country} · {mission.category}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >✕</button>
      </div>

      <div className="overflow-y-auto flex-1">
        {snap && (
          <div className="p-5 border-b border-gray-800">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              {snap.year === year ? `In ${year}` : `As of ${snap.year}`}
            </div>
            {snap.metric && <div className="text-2xl font-bold text-white mb-1">{snap.metric}</div>}
            <p className="text-sm text-gray-300">{snap.notes}</p>
          </div>
        )}

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

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend({ statusFilter, setStatusFilter }: {
  statusFilter: Status | "all";
  setStatusFilter: (s: Status | "all") => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="absolute bottom-24 left-4 z-[500] rounded-xl text-xs bg-gray-950/95 border border-gray-700 shadow-xl backdrop-blur-sm overflow-hidden">
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
                <span className="absolute inset-0 rounded-full opacity-40" style={{ background: cfg.color }} />
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

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ year, typeFilter }: { year: number; typeFilter: MarkerType | "all" }) {
  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map((k) => [k, 0])) as Record<Status, number>;
  let total = 0;
  MISSIONS.filter((m) => typeFilter === "all" || m.type === typeFilter).forEach((m) => {
    const snap = getSnapshot(m, year);
    if (snap) { counts[snap.status]++; total++; }
  });

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-xl bg-gray-950/95 border border-gray-700 text-white shadow-xl backdrop-blur-sm flex gap-5 items-center">
      <div className="text-center">
        <div className="text-2xl font-bold tabular-nums">{total}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400">Total</div>
      </div>
      <div className="w-px h-8 bg-gray-700" />
      {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) =>
        counts[key as Status] > 0 ? (
          <div key={key} className="text-center">
            <div className="text-lg font-bold tabular-nums" style={{ color: cfg.color }}>{counts[key as Status]}</div>
            <div className="text-[10px] text-gray-400">{cfg.label}</div>
          </div>
        ) : null
      )}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ mission, year, pos }: { mission: Mission; year: number; pos: { x: number; y: number } }) {
  const snap = getSnapshot(mission, year);
  if (!snap) return null;
  const cfg = STATUS_CONFIG[snap.status];
  return (
    <div
      className="absolute z-[600] pointer-events-none bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 min-w-[180px]"
      style={{ left: pos.x + 12, top: pos.y - 10 }}
    >
      <div className="font-bold text-white text-sm mb-1">{mission.name}</div>
      <div className="text-xs text-gray-400 mb-2">{mission.country} · {mission.category}</div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
        {snap.metric && <span className="text-xs text-gray-400">{snap.metric}</span>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MissionMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").CircleMarker[]>([]);

  const [year, setYear] = useState(ALL_YEARS[ALL_YEARS.length - 1]);
  const [typeFilter, setTypeFilter] = useState<MarkerType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [tooltip, setTooltip] = useState<{ mission: Mission; pos: { x: number; y: number } } | null>(null);
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

  // ── init Leaflet map ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    let L: typeof import("leaflet");
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled) return;
      L = mod.default;

      // Fix Leaflet default icon path in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl: "", shadowUrl: "" });

      const map = L.map(mapRef.current!, {
        center: [15, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: true,
      });

      // Dark tile layer from CARTO
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© CARTO · © OpenStreetMap contributors",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;
    });

    return () => {
      cancelled = true;
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // ── update markers ────────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current) return;

    let L: typeof import("leaflet");
    import("leaflet").then((mod) => {
      L = mod.default;
      if (!leafletMap.current) return;

      // Remove existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const filtered = MISSIONS.filter((m) => typeFilter === "all" || m.type === typeFilter);

      filtered.forEach((mission) => {
        const snap = getSnapshot(mission, year);
        if (!snap) return;
        if (statusFilter !== "all" && snap.status !== statusFilter) return;

        const cfg = STATUS_CONFIG[snap.status];

        const marker = L.circleMarker([mission.lat, mission.lng], {
          radius: 7,
          fillColor: cfg.color,
          color: "#111827",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.on("mouseover", (e) => {
          marker.setStyle({ radius: 10, fillOpacity: 1 });
          const containerPoint = leafletMap.current!.latLngToContainerPoint(marker.getLatLng());
          setTooltip({ mission, pos: { x: containerPoint.x, y: containerPoint.y } });
        });

        marker.on("mouseout", () => {
          marker.setStyle({ radius: 7, fillOpacity: 0.9 });
          setTooltip(null);
        });

        marker.on("click", () => {
          setSelectedMission(mission);
          setTooltip(null);
        });

        marker.addTo(leafletMap.current!);
        markersRef.current.push(marker);
      });
    });
  }, [year, typeFilter, statusFilter, leafletMap.current]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── resize map when panel opens/closes ────────────────────────
  useEffect(() => {
    setTimeout(() => leafletMap.current?.invalidateSize(), 310);
  }, [selectedMission]);

  const rightOffset = selectedMission ? 384 : 0;

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-gray-950 font-sans select-none">

      {/* Map container */}
      <div
        ref={mapRef}
        className="absolute top-0 left-0 bottom-0 transition-all duration-300"
        style={{ right: rightOffset }}
      />

      {/* Tooltip */}
      {tooltip && <Tooltip mission={tooltip.mission} year={year} pos={tooltip.pos} />}

      {/* Top-left title */}
      <div className="absolute top-4 left-4 z-[500] flex items-center gap-3">
        <div className="bg-gray-950/90 border border-gray-700 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-bold text-white leading-tight">Missions Field Map</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">What&apos;s working · What&apos;s not</p>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar year={year} typeFilter={typeFilter} />

      {/* Type filter tabs */}
      <div
        className="absolute top-4 z-[500] flex rounded-xl overflow-hidden text-xs font-semibold shadow-lg bg-gray-950/90 border border-gray-700"
        style={{ right: rightOffset + 16 }}
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
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-gray-950/95 border border-gray-700 rounded-xl px-6 py-4 shadow-xl backdrop-blur-sm"
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
          onChange={(e) => {
            if (isPlaying) { setIsPlaying(false); if (playRef.current) clearInterval(playRef.current); }
            setYear(Number(e.target.value));
          }}
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

      {/* Zoom controls */}
      <div className="absolute bottom-24 right-4 z-[500] flex flex-col gap-2" style={{ right: rightOffset + 16 }}>
        <button
          onClick={() => leafletMap.current?.zoomIn()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
        >+</button>
        <button
          onClick={() => leafletMap.current?.zoomOut()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
        >−</button>
        <button
          onClick={() => leafletMap.current?.setView([15, 20], 2)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600"
          title="Reset view"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
          </svg>
        </button>
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
