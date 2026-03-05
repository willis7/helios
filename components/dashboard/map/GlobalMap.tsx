'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
} from 'react-simple-maps';
import { Engineer } from '@/models/engineer';
import { engineers as allEngineers } from '@/data/dashboard/engineers';
import { EngineerMarker } from './EngineerMarker';
import { EngineerTooltip } from './EngineerTooltip';
import { TerminatorOverlay } from './TerminatorOverlay';
import { ClientOnly } from '@/lib/hooks/client-only';
import geographyData from '@/data/world/countries-110m.json';

interface GlobalMapProps {
  activeEngineerId: string | null;
  onSelectEngineer: (id: string) => void;
}

export function GlobalMap({
  activeEngineerId,
  onSelectEngineer,
}: GlobalMapProps) {
  const [hoveredEngineer, setHoveredEngineer] = useState<Engineer | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activeEngineer = allEngineers.find((e) => e.id === activeEngineerId);

  // Sort engineers so active and hovered are drawn last (on top)
  const sortedEngineers = [...allEngineers].sort((a, b) => {
    if (a.id === hoveredEngineer?.id) return 1;
    if (b.id === hoveredEngineer?.id) return -1;
    if (a.id === activeEngineerId) return 1;
    if (b.id === activeEngineerId) return -1;
    return 0;
  });

  return (
    <div className="relative w-full h-full bg-[#09090b] overflow-hidden">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160, center: [0, 0] }}
        width={800}
        height={600}
        style={{ width: '100%', height: '100%' }}
      >
        <Sphere
          stroke="transparent"
          strokeWidth={0.5}
          fill="transparent"
          id="sphere"
        />
        <ClientOnly>
          <Graticule stroke="rgba(255, 255, 255, 0.05)" strokeWidth={0.5} />
        </ClientOnly>

        <TerminatorOverlay />

        {/* Dark base layer - always visible (night areas) */}
        <Geographies geography={geographyData}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#3f3f46"
                stroke="#52525b"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none', fill: '#3f3f46' },
                  hover: { outline: 'none', fill: '#52525b' },
                  pressed: { outline: 'none', fill: '#52525b' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Natural earth image - clipped to daylight areas only */}
        <image
          href="/static/images/earth-natural-projected.webp"
          x="0"
          y="0"
          width="800"
          height="600"
          clipPath="url(#daylight-clip)"
          style={{ pointerEvents: 'none' }}
        />

        {/* Engineer Markers */}
        {sortedEngineers.map((eng) => (
          <EngineerMarker
            key={eng.id}
            engineer={eng}
            isActive={eng.id === activeEngineerId}
            onMouseEnter={(e, eng) => {
              // Calculate tooltip position relative to the container
              // react-simple-maps handles SVG well, but we need screen coordinates for HTML tooltips
              // Alternatively, we could put the tooltip inside a <foreignObject> but HTML pos is better.
              const container = document.getElementById('map-container');
              if (container) {
                const rect = container.getBoundingClientRect();
                setTooltipPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }
              setHoveredEngineer(eng);
            }}
            onMouseLeave={() => setHoveredEngineer(null)}
            onClick={() => onSelectEngineer(eng.id)}
          />
        ))}
      </ComposableMap>

      {/* Tooltip rendered outside SVG for better HTML rendering */}
      <div id="map-container" className="absolute inset-0 pointer-events-none">
        <EngineerTooltip
          engineer={hoveredEngineer!}
          x={tooltipPos.x}
          y={tooltipPos.y}
          visible={!!hoveredEngineer}
        />
      </div>
    </div>
  );
}
