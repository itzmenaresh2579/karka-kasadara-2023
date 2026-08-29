// A hand-drawn style marigold garland (thoranam) divider — the site's signature motif,
// referencing the flower garlands strung across doorways in Tamil Nadu for celebrations.
export default function GarlandDivider({ flip = false, bg = "var(--cream)" }) {
  return (
    <div style={{ lineHeight: 0, transform: flip ? "scaleY(-1)" : "none" }}>
      <svg viewBox="0 0 1200 60" width="100%" height="60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,10 Q50,55 100,10 T200,10 T300,10 T400,10 T500,10 T600,10 T700,10 T800,10 T900,10 T1000,10 T1100,10 T1200,10 L1200,60 L0,60 Z" fill={bg} />
        {Array.from({ length: 24 }).map((_, i) => {
          const x = 25 + i * 50;
          const colors = ["#F5A623", "#E8604C", "#4C9A6E"];
          const color = colors[i % 3];
          return (
            <g key={i} transform={`translate(${x}, ${i % 2 === 0 ? 28 : 20})`}>
              <circle r="7" fill={color} opacity="0.9" />
              <circle r="2.6" fill="#FFF8EC" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
