// A hand-drawn style illustrated scene — the school on a Kodumudi hillside,
// with a kite flying and marigold-colored sun. This is the site's visual signature.
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      {/* sky glow */}
      <circle cx="260" cy="220" r="230" fill="#FFFDF8" opacity="0.5" />

      {/* sun */}
      <g style={{ transformOrigin: "410px 90px", animation: "spin-slow 24s linear infinite" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="406"
            y="34"
            width="8"
            height="20"
            rx="4"
            fill="#F5A623"
            opacity="0.75"
            transform={`rotate(${i * 45} 410 90)`}
          />
        ))}
      </g>
      <circle cx="410" cy="90" r="34" fill="#F5A623" />
      <circle cx="410" cy="90" r="34" fill="#E8604C" opacity="0.15" />

      {/* clouds */}
      <g style={{ animation: "float-y 6s ease-in-out infinite" }}>
        <ellipse cx="90" cy="80" rx="34" ry="18" fill="#FFFFFF" />
        <ellipse cx="118" cy="72" rx="24" ry="15" fill="#FFFFFF" />
        <ellipse cx="64" cy="72" rx="20" ry="13" fill="#FFFFFF" />
      </g>
      <g style={{ animation: "float-y-slow 8s ease-in-out infinite" }}>
        <ellipse cx="250" cy="46" rx="26" ry="13" fill="#FFFFFF" opacity="0.85" />
        <ellipse cx="272" cy="40" rx="18" ry="11" fill="#FFFFFF" opacity="0.85" />
      </g>

      {/* kite */}
      <g style={{ transformOrigin: "150px 150px", animation: "sway 4s ease-in-out infinite" }}>
        <path d="M150,120 L180,150 L150,180 L120,150 Z" fill="#6FB7DE" stroke="#1F2A44" strokeWidth="2" />
        <path d="M150,120 L150,180 M120,150 L180,150" stroke="#1F2A44" strokeWidth="1.5" opacity="0.4" />
        <path d="M150,180 Q145,210 155,225 Q148,235 158,248" stroke="#1F2A44" strokeWidth="1.5" fill="none" opacity="0.5" />
      </g>

      {/* back hill */}
      <path d="M0,300 Q130,255 260,295 T520,290 L520,480 L0,480 Z" fill="#6FB7DE" opacity="0.22" />
      {/* mid hill */}
      <path d="M0,340 Q140,290 280,335 T520,325 L520,480 L0,480 Z" fill="#4C9A6E" opacity="0.55" />
      {/* front hill */}
      <path d="M0,380 Q150,335 300,375 T520,365 L520,480 L0,480 Z" fill="#357A52" />

      {/* small tree */}
      <g transform="translate(70,330)">
        <rect x="-4" y="20" width="8" height="34" rx="3" fill="#8a5a2b" />
        <circle cx="0" cy="10" r="26" fill="#4C9A6E" />
        <circle cx="-16" cy="18" r="18" fill="#4C9A6E" />
        <circle cx="16" cy="20" r="19" fill="#357A52" />
      </g>

      {/* school building */}
      <g transform="translate(230,250)">
        {/* building shadow */}
        <ellipse cx="90" cy="200" rx="140" ry="14" fill="#1F2A44" opacity="0.08" />

        {/* main block */}
        <rect x="10" y="70" width="160" height="120" rx="10" fill="#FFFFFF" />
        {/* roof */}
        <path d="M-10,80 L90,10 L190,80 Z" fill="#F5A623" />
        <rect x="-10" y="72" width="200" height="12" rx="6" fill="#DC8A0F" />

        {/* flag */}
        <rect x="88" y="-30" width="3" height="42" fill="#1F2A44" />
        <path d="M91,-30 L120,-22 L91,-14 Z" fill="#E8604C" style={{ transformOrigin: "91px -22px", animation: "sway 2.4s ease-in-out infinite" }} />

        {/* door */}
        <rect x="75" y="130" width="34" height="60" rx="6" fill="#E8604C" />
        <circle cx="102" cy="160" r="2.5" fill="#FFF8EC" />

        {/* windows */}
        <rect x="24" y="100" width="34" height="30" rx="6" fill="#6FB7DE" />
        <rect x="126" y="100" width="34" height="30" rx="6" fill="#6FB7DE" />
        <line x1="41" y1="100" x2="41" y2="130" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="24" y1="115" x2="58" y2="115" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="143" y1="100" x2="143" y2="130" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="126" y1="115" x2="160" y2="115" stroke="#FFFFFF" strokeWidth="2" />

        {/* side wing */}
        <rect x="170" y="100" width="60" height="90" rx="8" fill="#FCEFD8" />
        <path d="M160,100 L200,60 L240,100 Z" fill="#E8604C" opacity="0.9" />
        <rect x="192" y="140" width="26" height="24" rx="5" fill="#4C9A6E" />
      </g>

      {/* swing set silhouette */}
      <g transform="translate(370,330)" opacity="0.9">
        <line x1="0" y1="0" x2="0" y2="60" stroke="#1F2A44" strokeWidth="3" />
        <line x1="70" y1="0" x2="70" y2="60" stroke="#1F2A44" strokeWidth="3" />
        <line x1="-6" y1="0" x2="76" y2="0" stroke="#1F2A44" strokeWidth="3" />
        <line x1="35" y1="4" x2="35" y2="38" stroke="#1F2A44" strokeWidth="2" style={{ transformOrigin: "35px 4px", animation: "sway 2.8s ease-in-out infinite" }} />
        <rect x="27" y="36" width="16" height="4" rx="2" fill="#E8604C" style={{ transformOrigin: "35px 4px", animation: "sway 2.8s ease-in-out infinite" }} />
      </g>
    </svg>
  );
}
