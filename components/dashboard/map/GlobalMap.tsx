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
import { HandoffRoute } from './HandoffRoute';
import { TerminatorOverlay } from './TerminatorOverlay';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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

  // Find a secondary engineer for the handoff route demo
  // In a real app, this would be computed based on on-call schedules
  const escalationEngineer = activeEngineer
    ? allEngineers.find(
        (e) => e.id !== activeEngineer.id && e.role !== 'Primary',
      )
    : null;

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
        <Graticule stroke="rgba(255, 255, 255, 0.05)" strokeWidth={0.5} />

        {/* Terminator (Day/Night) Overlay */}
        {/* We place it below geographies to darken the oceans as well, or above to darken everything.
            The design says "shadow cast over map", so we put it over the geographies.
            However, doing this with D3 directly in the SVG path means we need to ensure the projection matches.
            Wait, I'll put it here to overlay on everything. */}
        <TerminatorOverlay />

        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="var(--map-landmass)"
                stroke="var(--map-border)"
                strokeWidth={0.5}
                style={{
                  default: {
                    outline: 'none',
                    fill: '#18181b',
                    stroke: '#27272a',
                  },
                  hover: {
                    outline: 'none',
                    fill: '#27272a',
                    stroke: '#3f3f46',
                  },
                  pressed: {
                    outline: 'none',
                    fill: '#27272a',
                    stroke: '#3f3f46',
                  },
                }}
              />
            ))
          }
        </Geographies>

        {/* Handoff Route Line */}
        {activeEngineer && escalationEngineer && (
          <HandoffRoute
            primary={activeEngineer}
            secondary={escalationEngineer}
          />
        )}

        {/* Engineer Markers */}
        {allEngineers.map((eng) => (
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
