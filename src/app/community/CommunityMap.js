"use client";
// Lightweight map similar style to CampusMap.
export default function CommunityMap({ zones = [], userLocation }) {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full bg-base-200">
      <defs>
        <pattern id="grid-comm" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="hsl(var(--b3))" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="300" height="200" fill="url(#grid-comm)" />
      {zones.map((z, i) => (
        <g key={i}>
          <circle cx={z.cx} cy={z.cy} r={z.radius} fill={hexToRgba(z.color, 0.18)} stroke={z.color} strokeWidth="2" />
          <text x={z.cx} y={z.cy} fontSize="8" textAnchor="middle" dy={-z.radius - 3} className="fill-base-content/70">
            {z.label}
          </text>
        </g>
      ))}
      {userLocation && (
        <g>
          <circle cx={150} cy={100} r={5} fill="#2563eb" />
          <text x={150} y={92} fontSize="8" textAnchor="middle" className="fill-base-content/70">
            You
          </text>
        </g>
      )}
    </svg>
  );
}

function hexToRgba(hex, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
