'use client';

import { useEffect, useState } from 'react';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';

function getDaylightPath(time: Date) {
  const RAD = Math.PI / 180;

  const start = new Date(time.getFullYear(), 0, 0);
  const diff = time.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  const gamma =
    ((2 * Math.PI) / 365) * (day - 1 + (time.getUTCHours() - 12) / 24);

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const declDegrees = decl * (180 / Math.PI);

  const timeOffset = eqTime;

  const tst =
    time.getUTCHours() * 60 +
    time.getUTCMinutes() +
    time.getUTCSeconds() / 60 +
    timeOffset;

  const ha = tst / 4 - 180;

  const lon = -ha;
  const lat = declDegrees;

  const numPoints = 100;
  const coordinates: number[][] = [];

  const ssLon = lon * RAD;
  const ssLat = lat * RAD;

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const d = Math.PI / 2;
    const theta = angle;

    const pLat = Math.asin(
      Math.sin(ssLat) * Math.cos(d) +
        Math.cos(ssLat) * Math.sin(d) * Math.cos(theta),
    );

    let pLon =
      ssLon +
      Math.atan2(
        Math.sin(theta) * Math.sin(d) * Math.cos(ssLat),
        Math.cos(d) - Math.sin(ssLat) * Math.sin(pLat),
      );

    pLon = ((pLon + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    coordinates.push([pLon / RAD, pLat / RAD]);
  }

  // CLIMATE: If declination is positive, SOUTH pole is in darkness (winter in north)
  // If declination is negative, NORTH pole is in darkness (winter in south)
  if (lat > 0) {
    // Northern summer - South pole is dark
    coordinates.push([180, -90]);
    coordinates.push([-180, -90]);
  } else {
    // Northern winter - North pole is dark
    coordinates.push([180, 90]);
    coordinates.push([-180, 90]);
  }

  coordinates.push(coordinates[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    properties: {},
  };
}

interface TerminatorOverlayProps {
  customTime?: Date;
}

export function TerminatorOverlay({ customTime }: TerminatorOverlayProps) {
  const [path, setPath] = useState<string>('');

  useEffect(() => {
    const updateTerminator = () => {
      const projection = geoNaturalEarth1().scale(160).translate([400, 300]);
      const pathGenerator = geoPath().projection(projection);

      const timeToUse = customTime ?? new Date();
      const dayGeoJSON = getDaylightPath(timeToUse);
      // @ts-ignore
      const d = pathGenerator(dayGeoJSON);

      if (d) {
        setPath(d);
      }
    };

    updateTerminator();

    // Only auto-update if no custom time is set
    if (!customTime) {
      const interval = setInterval(updateTerminator, 60000);
      return () => clearInterval(interval);
    }
  }, [customTime]);

  if (!path) {
    return (
      <defs>
        <clipPath id="daylight-clip">
          <rect x="-1000" y="-1000" width="0" height="0" />
        </clipPath>
      </defs>
    );
  }

  return (
    <defs>
      <clipPath id="daylight-clip">
        <path d={path} />
      </clipPath>
    </defs>
  );
}
