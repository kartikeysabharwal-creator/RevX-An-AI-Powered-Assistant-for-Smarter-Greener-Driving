'use client';

import React, { useState } from 'react';
import { DrivingEvent } from '@revx/shared';
import { AlertTriangle, Zap, CornerUpRight, Gauge, MapPin, CheckCircle2 } from 'lucide-react';

interface RoutePoint {
  lat: number;
  lng: number;
  speedKmh?: number;
}

interface RouteMapViewerProps {
  routePoints?: RoutePoint[];
  events?: DrivingEvent[];
  height?: number | string;
  routeName?: string;
}

export function RouteMapViewer({
  routePoints = [],
  events = [],
  height = 360,
  routeName = 'Indiranagar ➔ Electronic City Highway Corridor',
}: RouteMapViewerProps) {
  const [activeEvent, setActiveEvent] = useState<DrivingEvent | null>(null);

  // Default coordinates if empty
  const defaultRoute: RoutePoint[] = [
    { lat: 12.9716, lng: 77.5946, speedKmh: 0 },
    { lat: 12.958, lng: 77.608, speedKmh: 42 },
    { lat: 12.935, lng: 77.625, speedKmh: 58 },
    { lat: 12.91, lng: 77.64, speedKmh: 65 },
    { lat: 12.875, lng: 77.652, speedKmh: 68 },
    { lat: 12.845, lng: 77.668, speedKmh: 0 },
  ];

  const points = routePoints.length > 0 ? routePoints : defaultRoute;

  // Normalized SVG mapping
  const minLat = Math.min(...points.map((p) => p.lat));
  const maxLat = Math.max(...points.map((p) => p.lat));
  const minLng = Math.min(...points.map((p) => p.lng));
  const maxLng = Math.max(...points.map((p) => p.lng));

  const pad = 0.005;
  const latSpan = Math.max(0.01, maxLat - minLat + pad * 2);
  const lngSpan = Math.max(0.01, maxLng - minLng + pad * 2);

  const mapToCanvas = (lat: number, lng: number) => {
    const x = ((lng - (minLng - pad)) / lngSpan) * 700 + 50;
    const y = 300 - ((lat - (minLat - pad)) / latSpan) * 220;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const svgPath = points
    .map((p, idx) => {
      const { x, y } = mapToCanvas(p.lat, p.lng);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const startCoord = mapToCanvas(points[0].lat, points[0].lng);
  const endCoord = mapToCanvas(points[points.length - 1].lat, points[points.length - 1].lng);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden glass-panel border border-revx-border flex flex-col"
      style={{ height }}
    >
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-4 z-10 flex items-center justify-between w-[calc(100%-2rem)]">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">{routeName}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px] text-slate-400 font-mono">
          <span>{points.length} GPS Waypoints</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{events.length} Events Pinpointed</span>
        </div>
      </div>

      {/* Futuristic Dark Automotive SVG Map Canvas */}
      <div className="w-full h-full relative carbon-grid bg-gradient-to-b from-[#0b1016] to-[#070a0d] flex items-center justify-center p-4">
        <svg viewBox="0 0 800 350" className="w-full h-full">
          <defs>
            {/* Emerald glow filter for path */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background grid lines */}
          <path d="M 50 100 L 750 100 M 50 200 L 750 200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 200 50 L 200 300 M 400 50 L 400 300 M 600 50 L 600 300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Underglow route track */}
          <path
            d={svgPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeOpacity="0.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neon-glow)"
          />

          {/* Core route line */}
          <path
            d={svgPath}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Start Marker */}
          <circle cx={startCoord.x} cy={startCoord.y} r="8" fill="#10b981" />
          <circle cx={startCoord.x} cy={startCoord.y} r="14" fill="#10b981" fillOpacity="0.3" />
          <text x={startCoord.x + 12} y={startCoord.y + 4} fill="#a7f3d0" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            START
          </text>

          {/* End Marker */}
          <circle cx={endCoord.x} cy={endCoord.y} r="8" fill="#f8fafc" />
          <circle cx={endCoord.x} cy={endCoord.y} r="14" fill="#f8fafc" fillOpacity="0.3" />
          <text x={endCoord.x + 12} y={endCoord.y + 4} fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            END
          </text>

          {/* Event Pins */}
          {events.map((evt, idx) => {
            const lat = evt.latitude || points[Math.min(points.length - 1, (idx + 1) * 2)].lat;
            const lng = evt.longitude || points[Math.min(points.length - 1, (idx + 1) * 2)].lng;
            const pos = mapToCanvas(lat, lng);

            let pinColor = '#f59e0b';
            if (evt.eventType === 'HARSH_BRAKING') pinColor = '#ef4444';
            if (evt.eventType === 'SHARP_TURN') pinColor = '#06b6d4';
            if (evt.eventType === 'OVERSPEED') pinColor = '#a855f7';

            return (
              <g
                key={evt.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setActiveEvent(evt)}
              >
                <circle cx={pos.x} cy={pos.y} r="7" fill={pinColor} stroke="#080b0f" strokeWidth="2" />
                <circle cx={pos.x} cy={pos.y} r="12" fill={pinColor} fillOpacity="0.3" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Event Detail Overlay Drawer */}
      {activeEvent && (
        <div className="absolute bottom-3 left-4 right-4 z-20 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-3 rounded-xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              {activeEvent.eventType === 'HARSH_BRAKING' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : activeEvent.eventType === 'HARSH_ACCELERATION' ? (
                <Zap className="w-5 h-5 text-amber-400" />
              ) : activeEvent.eventType === 'SHARP_TURN' ? (
                <CornerUpRight className="w-5 h-5 text-cyan-400" />
              ) : (
                <Gauge className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeEvent.eventType.replace('_', ' ')}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {activeEvent.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{activeEvent.description}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveEvent(null)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
