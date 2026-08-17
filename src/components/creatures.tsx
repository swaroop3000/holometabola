import { CSSProperties } from "react";

const LINE = "#cfe9de";
const FAINT = "rgba(207,233,222,0.35)";

/* ============ EGG — chorion, dorsal appendages, micropyle, germ band ============ */
export function EggSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 290" className={className} role="img" aria-label="Drosophila egg">
      <defs>
        <pattern id="eggchor" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="4.6" fill="none" stroke="rgba(79,224,208,0.28)" strokeWidth="0.8" />
        </pattern>
        <radialGradient id="eggg" cx="42%" cy="36%" r="75%">
          <stop offset="0%" stopColor="rgba(79,224,208,0.20)" />
          <stop offset="60%" stopColor="rgba(20,60,66,0.25)" />
          <stop offset="100%" stopColor="rgba(8,26,33,0.65)" />
        </radialGradient>
      </defs>

      {/* dorsal appendages */}
      <path d="M96 62 C88 34 76 16 62 6 C84 12 96 34 102 58 Z" fill="rgba(79,224,208,0.10)" stroke={FAINT} strokeWidth="1.4" />
      <path d="M124 62 C132 34 144 16 158 6 C136 12 124 34 118 58 Z" fill="rgba(79,224,208,0.10)" stroke={FAINT} strokeWidth="1.4" />

      {/* body */}
      <ellipse cx="110" cy="168" rx="52" ry="84" fill="url(#eggg)" stroke={LINE} strokeWidth="1.6" />
      <ellipse cx="110" cy="168" rx="52" ry="84" fill="url(#eggchor)" />

      {/* micropyle */}
      <circle cx="110" cy="86" r="4.5" fill="none" stroke="#4fe0d0" strokeWidth="1.4" />
      <circle cx="110" cy="86" r="1.4" fill="#4fe0d0" />

      {/* germ band embryo */}
      <path
        d="M84 130 C78 170 84 208 106 226 C122 214 130 190 128 162 C126 140 118 122 102 114 C93 116 87 122 84 130 Z"
        fill="rgba(79,224,208,0.10)"
        stroke="rgba(79,224,208,0.55)"
        strokeWidth="1.1"
        strokeDasharray="3 4"
      />
      <path d="M88 146 C96 150 118 150 126 144" stroke="rgba(79,224,208,0.4)" strokeWidth="1" fill="none" />
      <path d="M86 168 C98 173 120 172 129 165" stroke="rgba(79,224,208,0.4)" strokeWidth="1" fill="none" />
      <path d="M89 192 C100 197 118 195 126 187" stroke="rgba(79,224,208,0.4)" strokeWidth="1" fill="none" />

      {/* highlight */}
      <ellipse cx="90" cy="130" rx="12" ry="30" fill="rgba(233,245,240,0.10)" />
    </svg>
  );
}

/* ============ LARVA — tapered maggot, creases, mouth hooks, spiracles ============ */
export function LarvaSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 330 200" className={className} role="img" aria-label="Third-instar larva">
      <defs>
        <linearGradient id="larvag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(91,201,255,0.16)" />
          <stop offset="55%" stopColor="rgba(24,66,84,0.22)" />
          <stop offset="100%" stopColor="rgba(8,26,33,0.5)" />
        </linearGradient>
      </defs>
      <g className="crawl">
        {/* body */}
        <path
          d="M52 118 C50 92 66 74 92 70 C150 58 226 60 268 74 C296 84 304 104 298 122 C290 146 258 156 216 154 C160 152 96 150 72 140 C58 134 53 128 52 118 Z"
          fill="url(#larvag)"
          stroke={LINE}
          strokeWidth="1.6"
        />
        {/* segment creases */}
        <path d="M96 72 C92 96 92 122 98 146" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M132 66 C127 94 127 124 133 150" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M168 63 C163 93 163 126 169 152" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M204 62 C200 92 200 128 206 153" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M240 66 C237 92 237 126 242 151" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M270 76 C268 96 268 122 272 144" stroke={FAINT} strokeWidth="1.2" fill="none" />

        {/* mouth hooks */}
        <path d="M58 106 C48 104 42 108 40 114 C46 114 52 116 57 112" fill="rgba(91,201,255,0.35)" stroke="#5bc9ff" strokeWidth="1.3" />
        <path d="M58 124 C48 126 43 123 41 118 C47 118 53 116 57 120" fill="rgba(91,201,255,0.35)" stroke="#5bc9ff" strokeWidth="1.3" />

        {/* cephalopharyngeal skeleton hint */}
        <path d="M60 115 C72 112 84 113 92 117" stroke="rgba(91,201,255,0.5)" strokeWidth="1.1" fill="none" strokeDasharray="2 3" />

        {/* posterior spiracles */}
        <circle cx="296" cy="104" r="2.4" fill="#5bc9ff" />
        <circle cx="300" cy="114" r="2.4" fill="#5bc9ff" />
        <circle cx="296" cy="124" r="2.4" fill="#5bc9ff" />

        {/* gut line */}
        <path d="M86 118 C140 108 220 108 276 116" stroke="rgba(91,201,255,0.35)" strokeWidth="1.2" fill="none" strokeDasharray="5 5" />

        {/* imaginal disc dots */}
        <circle cx="120" cy="86" r="3.2" fill="none" stroke="#4fe0d0" strokeWidth="1.1" />
        <circle cx="120" cy="86" r="1" fill="#4fe0d0" />
        <circle cx="158" cy="82" r="2.6" fill="none" stroke="#4fe0d0" strokeWidth="1.1" />
        <circle cx="158" cy="82" r="0.9" fill="#4fe0d0" />

        <ellipse cx="150" cy="78" rx="70" ry="8" fill="rgba(233,245,240,0.06)" />
      </g>
    </svg>
  );
}

/* ============ PUPA — puparium barrel, horns, operculum, pharate fly inside ============ */
export function PupaSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 300" className={className} role="img" aria-label="Puparium with developing adult inside">
      <defs>
        <linearGradient id="pupag" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(110,240,163,0.06)" />
          <stop offset="45%" stopColor="rgba(28,70,62,0.30)" />
          <stop offset="100%" stopColor="rgba(8,26,33,0.55)" />
        </linearGradient>
      </defs>
      <g className="breathe">
        {/* anterior horns */}
        <path d="M86 52 C82 40 84 30 92 22 C92 34 94 42 98 50 Z" fill="rgba(110,240,163,0.14)" stroke={FAINT} strokeWidth="1.2" />
        <path d="M154 52 C158 40 156 30 148 22 C148 34 146 42 142 50 Z" fill="rgba(110,240,163,0.14)" stroke={FAINT} strokeWidth="1.2" />

        {/* puparium barrel */}
        <path
          d="M74 78 C74 58 92 48 120 48 C148 48 166 58 166 78 L166 226 C166 254 148 268 120 268 C92 268 74 254 74 226 Z"
          fill="url(#pupag)"
          stroke={LINE}
          strokeWidth="1.6"
        />
        {/* operculum */}
        <path d="M76 84 C96 74 144 74 164 84" stroke="rgba(110,240,163,0.55)" strokeWidth="1.2" fill="none" />

        {/* segment ridges */}
        <path d="M75 118 C100 126 140 126 165 118" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M74 152 C100 160 140 160 166 152" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M74 186 C100 194 140 194 166 186" stroke={FAINT} strokeWidth="1.2" fill="none" />
        <path d="M76 220 C100 228 140 228 164 220" stroke={FAINT} strokeWidth="1.2" fill="none" />

        {/* PHARATE ADULT silhouette inside */}
        <g className="innerglow" style={{ color: "#6ef0a3" }}>
          {/* head + eye */}
          <circle cx="120" cy="108" r="13" fill="none" stroke="#6ef0a3" strokeWidth="1.2" />
          <circle cx="113" cy="106" r="5.5" fill="rgba(110,240,163,0.30)" stroke="none" />
          {/* thorax */}
          <ellipse cx="120" cy="132" rx="15" ry="12" fill="rgba(110,240,163,0.10)" stroke="#6ef0a3" strokeWidth="1.1" />
          {/* abdomen */}
          <ellipse cx="120" cy="168" rx="13" ry="24" fill="rgba(110,240,163,0.08)" stroke="#6ef0a3" strokeWidth="1.1" />
          <path d="M108 160 h24 M107 170 h26 M109 180 h22" stroke="rgba(110,240,163,0.5)" strokeWidth="0.9" />
          {/* folded wings */}
          <path d="M106 126 C92 140 88 164 96 186 C102 170 105 148 109 132 Z" fill="rgba(196,169,255,0.10)" stroke="rgba(196,169,255,0.55)" strokeWidth="1" />
          <path d="M134 126 C148 140 152 164 144 186 C138 170 135 148 131 132 Z" fill="rgba(196,169,255,0.10)" stroke="rgba(196,169,255,0.55)" strokeWidth="1" />
          {/* legs */}
          <path d="M109 140 L98 152 M131 140 L142 152 M111 152 L102 166 M129 152 L138 166" stroke="rgba(110,240,163,0.45)" strokeWidth="1" />
        </g>

        {/* sheen */}
        <ellipse cx="95" cy="140" rx="8" ry="66" fill="rgba(233,245,240,0.06)" />
      </g>
    </svg>
  );
}

/* ============ ADULT FLY — eye, arista, striped abdomen, wings, legs ============ */
export function AdultSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 260" className={className} role="img" aria-label="Adult Drosophila">
      <defs>
        <pattern id="ommat" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="3" fill="none" stroke="rgba(196,169,255,0.4)" strokeWidth="0.7" />
        </pattern>
        <linearGradient id="abg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(240,169,94,0.16)" />
          <stop offset="100%" stopColor="rgba(20,50,58,0.35)" />
        </linearGradient>
      </defs>

      {/* legs */}
      <g stroke={FAINT} strokeWidth="1.6" fill="none">
        <path d="M150 158 L136 184 L122 196 L116 214" />
        <path d="M172 162 L166 190 L158 208 L160 224" />
        <path d="M196 158 L202 186 L198 206 L206 222" />
        <path d="M160 156 L152 176 L144 186" opacity="0.5" />
        <path d="M184 160 L186 184 L182 198" opacity="0.5" />
      </g>

      {/* abdomen */}
      <ellipse cx="224" cy="140" rx="74" ry="42" fill="url(#abg)" stroke={LINE} strokeWidth="1.6" transform="rotate(-8 224 140)" />
      <g stroke="rgba(240,169,94,0.5)" strokeWidth="1.1" fill="none" transform="rotate(-8 224 140)">
        <path d="M188 106 C186 130 186 152 190 174" />
        <path d="M214 101 C212 128 212 154 216 178" />
        <path d="M240 101 C239 128 239 154 242 177" />
        <path d="M264 106 C264 128 264 150 266 170" />
      </g>

      {/* thorax */}
      <ellipse cx="150" cy="128" rx="46" ry="38" fill="rgba(24,60,70,0.4)" stroke={LINE} strokeWidth="1.6" />
      <path d="M128 98 C144 92 162 92 174 100" stroke={FAINT} strokeWidth="1.1" fill="none" />

      {/* wing (far, dim) */}
      <path
        d="M158 110 C196 70 258 46 306 52 C312 66 300 84 272 98 C240 114 200 122 168 122 Z"
        fill="rgba(196,169,255,0.06)"
        stroke="rgba(196,169,255,0.35)"
        strokeWidth="1.1"
      />
      {/* wing (near, animated) */}
      <g className="wingbeat">
        <path
          d="M154 116 C186 66 252 34 310 40 C318 56 306 78 274 96 C238 116 194 126 160 124 Z"
          fill="rgba(196,169,255,0.12)"
          stroke="#c4a9ff"
          strokeWidth="1.4"
        />
        <path d="M170 116 C204 84 252 62 296 54" stroke="rgba(196,169,255,0.4)" strokeWidth="0.9" fill="none" />
        <path d="M172 120 C210 100 256 84 292 74" stroke="rgba(196,169,255,0.3)" strokeWidth="0.9" fill="none" />
        <path className="shimmerline" d="M162 118 C198 76 254 48 306 44" stroke="rgba(233,245,240,0.35)" strokeWidth="0.9" fill="none" />
      </g>
      {/* haltere */}
      <path d="M188 140 C196 142 200 146 202 152" stroke={FAINT} strokeWidth="1.3" fill="none" />
      <circle cx="203" cy="154" r="2.6" fill="rgba(240,169,94,0.6)" />

      {/* head */}
      <circle cx="98" cy="118" r="30" fill="rgba(24,60,70,0.45)" stroke={LINE} strokeWidth="1.6" />
      {/* eye */}
      <ellipse cx="92" cy="114" rx="17" ry="20" fill="rgba(196,169,255,0.14)" stroke="#c4a9ff" strokeWidth="1.3" />
      <ellipse cx="92" cy="114" rx="17" ry="20" fill="url(#ommat)" />
      <circle cx="86" cy="106" r="2" fill="rgba(233,245,240,0.5)" />
      {/* antenna + arista */}
      <path d="M76 100 C70 94 68 88 70 82" stroke={FAINT} strokeWidth="1.4" fill="none" />
      <path d="M70 82 C62 78 56 70 54 62 M62 76 L56 74 M66 82 L58 82 M69 88 L62 90" stroke="rgba(240,169,94,0.6)" strokeWidth="1" fill="none" />
      {/* proboscis */}
      <path d="M92 148 C90 158 92 164 98 168 C104 164 104 156 102 148" fill="rgba(240,169,94,0.15)" stroke={FAINT} strokeWidth="1.2" />

      {/* ocelli */}
      <circle cx="108" cy="92" r="1.6" fill="#f0a95e" />
      <circle cx="114" cy="97" r="1.6" fill="#f0a95e" />
    </svg>
  );
}

/* ============ stage morpher ============ */
const CREATURES = [
  { key: "egg", C: EggSVG },
  { key: "larva", C: LarvaSVG },
  { key: "pupa", C: PupaSVG },
  { key: "adult", C: AdultSVG },
] as const;

export function StageMorpher({ active, className = "" }: { active: number; className?: string }) {
  return (
    <div className={className}>
      <div className="relative w-full h-full">
        {CREATURES.map(({ key, C }, i) => {
          const isActive = i === active;
          const style: CSSProperties = isActive
            ? { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }
            : { opacity: 0, transform: "scale(0.82) translateY(10px)", filter: "blur(7px)", pointerEvents: "none" };
          return (
            <div key={key} className="morph-layer absolute inset-0 grid place-items-center" style={style}>
              <C className="w-full h-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
