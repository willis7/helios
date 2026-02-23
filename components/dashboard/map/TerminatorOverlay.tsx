'use client';

import { useEffect, useState } from 'react';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';

// Calculate the solar terminator (day/night boundary)
// Returns a GeoJSON polygon representing the night area
function getTerminator(time: Date) {
  // Constants
  const RAD = Math.PI / 180;

  // Day of year
  const start = new Date(time.getFullYear(), 0, 0);
  const diff = time.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Fractional year in radians
  const gamma =
    ((2 * Math.PI) / 365) * (day - 1 + (time.getUTCHours() - 12) / 24);

  // Equation of time (in minutes)
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination (in degrees)
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const declDegrees = decl * (180 / Math.PI);

  // Time offset in minutes (using UTC, no timezone offset needed)
  const timeOffset = eqTime;

  // True solar time in minutes
  const tst =
    time.getUTCHours() * 60 +
    time.getUTCMinutes() +
    time.getUTCSeconds() / 60 +
    timeOffset;

  // Solar hour angle in degrees
  const ha = tst / 4 - 180;

  // Coordinates of the subsolar point
  const lon = -ha;
  const lat = declDegrees;

  // Create a polygon that covers the night half of the Earth
  // We approximate the circle by generating points along the terminator
  const numPoints = 100;
  const coordinates: number[][] = [];

  // Subsolar point (lon, lat)
  const ssLon = lon * RAD;
  const ssLat = lat * RAD;

  // Generate points on the great circle 90 degrees away from subsolar point
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;

    // Convert polar to Cartesian relative to subsolar point
    // We want points where angular distance is 90 deg (PI/2)
    // Formula for point on a sphere at distance d and bearing theta from (lat1, lon1)
    const d = Math.PI / 2; // 90 degrees
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

    // Normalize longitude to [-PI, PI]
    pLon = ((pLon + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    coordinates.push([pLon / RAD, pLat / RAD]);
  }

  // To cover the night area properly, we need to add points at the poles
  // If declination is positive, south pole is dark, otherwise north pole is dark
  if (lat > 0) {
    // Connect to South Pole
    coordinates.push([180, -90]);
    coordinates.push([-180, -90]);
  } else {
    // Connect to North Pole
    coordinates.push([180, 90]);
    coordinates.push([-180, 90]);
  }

  // Close the polygon
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

export function TerminatorOverlay() {
  const [path, setPath] = useState<string>('');

  useEffect(() => {
    // Function to calculate and update path
    const updateTerminator = () => {
      // Use standard geoNaturalEarth1 projection as used in react-simple-maps by default
      const projection = geoNaturalEarth1().scale(160).translate([400, 300]); // Default react-simple-maps viewBox is 800x600

      const pathGenerator = geoPath().projection(projection);

      const nightGeoJSON = getTerminator(new Date());
      // @ts-ignore - d3 geo types mismatch with custom geojson slightly but works
      const d = pathGenerator(nightGeoJSON);

      if (d) {
        setPath(d);
      }
    };

    // Initial update
    updateTerminator();

    // Update every minute
    const interval = setInterval(updateTerminator, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!path) return null;

  return (
    <path
      d={path}
      className="fill-yellow-500/10 dark:fill-yellow-400/10 transition-all duration-1000"
      style={{ pointerEvents: 'none' }}
    />
  );
}
