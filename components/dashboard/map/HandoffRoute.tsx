'use client';

import { Line } from 'react-simple-maps';
import { Engineer } from '@/models/engineer';

interface HandoffRouteProps {
  primary: Engineer;
  secondary: Engineer;
}

export function HandoffRoute({ primary, secondary }: HandoffRouteProps) {
  if (!primary || !secondary) return null;

  return (
    <>
      <defs>
        <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background glow line */}
      <Line
        from={primary.location.coordinates}
        to={secondary.location.coordinates}
        stroke="#4ade80"
        strokeWidth={4}
        strokeLinecap="round"
        strokeOpacity={0.3}
        filter="url(#glow)"
        className="pointer-events-none"
      />

      {/* Animated dashed line */}
      <Line
        from={primary.location.coordinates}
        to={secondary.location.coordinates}
        stroke="url(#route-gradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="6 6"
        className="pointer-events-none"
        style={{
          animation: 'dash 20s linear infinite',
        }}
      />

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </>
  );
}
