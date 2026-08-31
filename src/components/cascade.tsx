import { useMemo, useState } from "react";
import { CASCADE_LAYERS, PATHWAYS, PULSES, SWITCH_STATES } from "../data/biology";
import { PathwayTag, Reveal } from "./ui";

/* ================= 20E PULSE TIMELINE ================= */
const BASE = 236;
const HOURS = [
  { h: 0, label: "0h" },
  { h: 24, label: "24h hatch" },
  { h: 48, label: "48h" },
  { h: 72, label: "72h" },
  { h: 96, label: "96h wandering" },
  { h: 120, label: "120h pupariation" },
  { h: 144, label: "144h" },
  { h: 168, label: "168h" },
  { h: 192, label: "192h" },
  { h: 216, label: "~216h eclosion" },
];

export function PulseTimeline() {
  const [sel, setSel] = useState(3); // prepupal by default

  const path = useMemo(() => {
    let d = `M0 ${BASE}`;
    PULSES.forEach((p) => {
      const y = BASE - p.h;
      d += ` L${p.x - 64} ${BASE}`;
      d += ` C${p.x - 30} ${BASE} ${p.x - 20} ${y} ${p.x} ${y}`;
      d += ` C${p.x + 20} ${y} ${p.x + 30} ${BASE} ${p.x + 64} ${BASE}`;
    });
    d += ` L1000 ${BASE}`;
    return d;
  }, []);

  const area = `${path} L1000 ${BASE} L0 ${BASE} Z`;
  const pulse = PULSES[sel];

  return (
    <div>
      <div className="border border-line rounded-xl bg-panel/50 p-4 md:p-7 overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
              Hemolymph 20-hydroxyecdysone titer · D. melanogaster · 25 °C
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "#6ef0a3" }}>
              ● click a pulse
            </span>
          </div>

          <svg viewBox="0 0 1000 300" className="w-full" role="img" aria-label="Ecdysone titer curve with six pulses">
            <defs>
              <linearGradient id="pulsefill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(110,240,163,0.34)" />
                <stop offset="100%" stopColor="rgba(110,240,163,0.02)" />
              </linearGradient>
            </defs>

            {/* hour ticks */}
            {HOURS.map((t) => {
              const x = (t.h / 216) * 1000;
              return (
                <g key={t.h}>
                  <line x1={x} y1={BASE} x2={x} y2={BASE + 8} stroke="rgba(93,122,128,0.7)" strokeWidth="1" />
                  <text x={x} y={BASE + 24} textAnchor="middle" fill="#5d7a80" fontSize="10.5" fontFamily="JetBrains Mono, monospace">
                    {t.label}
                  </text>
                </g>
              );
            })}
            <line x1="0" y1={BASE} x2="1000" y2={BASE} stroke="rgba(93,122,128,0.5)" strokeWidth="1" />

            {/* stage spans */}
            {[
              { x0: 0, x1: 111, label: "EGG", c: "#4fe0d0" },
              { x0: 111, x1: 555, label: "LARVA", c: "#5bc9ff" },
              { x0: 555, x1: 1000, label: "PUPA → ADULT", c: "#6ef0a3" },
            ].map((s) => (
              <g key={s.label}>
                <rect x={s.x0} y={18} width={s.x1 - s.x0} height={22} fill={`${s.c}0d`} stroke={`${s.c}44`} strokeWidth="1" />
                <text x={(s.x0 + s.x1) / 2} y={33} textAnchor="middle" fill={s.c} fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="2.5">
                  {s.label}
                </text>
              </g>
            ))}

            {/* curve */}
            <path d={area} fill="url(#pulsefill)" />
            <path d={path} fill="none" stroke="#6ef0a3" strokeWidth="2.2" style={{ filter: "drop-shadow(0 0 6px rgba(110,240,163,0.6))" }} />

            {/* pulse markers */}
            {PULSES.map((p, i) => {
              const on = i === sel;
              return (
                <g key={p.id} onClick={() => setSel(i)} className="cursor-pointer">
                  <line x1={p.x} y1={BASE - p.h} x2={p.x} y2={BASE} stroke={on ? "#6ef0a3" : "rgba(110,240,163,0.25)"} strokeWidth="1" strokeDasharray="3 4" />
                  {on && <circle cx={p.x} cy={BASE - p.h} r="7" fill="none" stroke="#6ef0a3" strokeWidth="1.4" className="pulsedot" />}
                  <circle
                    cx={p.x}
                    cy={BASE - p.h}
                    r={on ? 8 : 5.5}
                    fill={on ? "#6ef0a3" : "#0b222b"}
                    stroke="#6ef0a3"
                    strokeWidth="1.8"
                    style={{ filter: on ? "drop-shadow(0 0 8px rgba(110,240,163,0.9))" : "none", transition: "all .3s" }}
                  />
                  <text
                    x={p.x}
                    y={BASE - p.h - 16}
                    textAnchor="middle"
                    fill={on ? "#e9f5f0" : "#93aeb1"}
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                    style={{ transition: "fill .3s" }}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* pulse detail */}
      <Reveal className="mt-6 border border-line rounded-xl p-6 md:p-7 bg-panel/40" key={pulse.id}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h4 className="font-display font-bold text-xl md:text-2xl" style={{ color: "#6ef0a3" }}>
            {pulse.name}
          </h4>
          <span className="font-mono text-[11px] text-dim uppercase tracking-[0.18em]">{pulse.time}</span>
        </div>
        <p className="text-dim text-[14px] leading-relaxed mt-3 max-w-3xl">{pulse.blurb}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {pulse.genes.map((g) => {
            const p = PATHWAYS[g.pathway];
            return (
              <span
                key={g.symbol}
                className="font-mono text-[12px] px-2.5 py-1 rounded-md border"
                style={{ borderColor: `${p.color}55`, color: p.color, background: `${p.color}0d` }}
              >
                {g.symbol}
              </span>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}

/* ================= PUPAL TRANSCRIPTIONAL CASCADE ================= */
export function CascadeDiagram() {
  const [sel, setSel] = useState("e93");
  const node = CASCADE_LAYERS.flatMap((l) => l.nodes).find((n) => n.id === sel)!;
  const nodePath = PATHWAYS[node.pathway];

  return (
    <div className="md:grid md:grid-cols-[1fr_340px] gap-8 items-start">
      <div>
        {CASCADE_LAYERS.map((layer, li) => (
          <div key={layer.title}>
            {/* connector */}
            {li > 0 && (
              <div className="flex justify-center py-1">
                <svg width="24" height="44" viewBox="0 0 24 44" aria-hidden="true">
                  <line x1="12" y1="0" x2="12" y2="34" stroke="#6ef0a3" strokeWidth="1.6" className="dashflow" />
                  <path d="M6 32 L12 42 L18 32" fill="none" stroke="#6ef0a3" strokeWidth="1.6" />
                </svg>
              </div>
            )}
            <Reveal delay={li * 70}>
              <div className="flex items-baseline gap-3 mb-2.5">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-faint">{layer.title}</span>
                <span className="text-[11px] text-faint italic">{layer.note}</span>
              </div>
              <div className={`grid gap-3 ${layer.nodes.length === 1 ? "grid-cols-1 max-w-xl" : layer.nodes.length === 2 ? "sm:grid-cols-2 max-w-2xl" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
                {layer.nodes.map((n) => {
                  const p = PATHWAYS[n.pathway];
                  const on = sel === n.id;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setSel(n.id)}
                      className="gene-chip text-left border rounded-lg p-4 cursor-pointer"
                      style={{
                        borderColor: on ? p.color : "rgba(28,59,70,0.9)",
                        background: on ? `${p.color}12` : "rgba(11,34,43,0.6)",
                        boxShadow: on ? `0 0 24px ${p.color}2e` : "none",
                      }}
                    >
                      <div className="font-mono font-bold text-[15px]" style={{ color: on ? p.color : "#d8ebe4" }}>
                        {n.label}
                      </div>
                      {n.sub && <div className="text-[11px] text-dim mt-0.5">{n.sub}</div>}
                      <div className="mt-2">
                        <PathwayTag k={n.pathway} small />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Reveal>
          </div>
        ))}

        {/* repression notes */}
        <Reveal className="mt-8 flex flex-wrap gap-3">
          {[
            { txt: "HR4 ⊣ HR3", c: "#c4a9ff" },
            { txt: "HR3 ⊣ βFTZ-F1", c: "#ffc44f" },
            { txt: "Kr-h1 ⊣ E93 (while JH present)", c: "#ff6157" },
            { txt: "E93 → adult programme + histolysis", c: "#6ef0a3" },
          ].map((r) => (
            <span key={r.txt} className="font-mono text-[11px] px-3 py-1.5 rounded-md border border-dashed" style={{ borderColor: `${r.c}66`, color: r.c }}>
              {r.txt}
            </span>
          ))}
          <span className="font-mono text-[10px] text-faint self-center">⊣ = represses</span>
        </Reveal>
      </div>

      {/* node detail */}
      <div className="md:sticky md:top-[130px] mt-6 md:mt-0">
        <div
          className="border rounded-xl p-6 bg-panel/60 transition-colors duration-500"
          style={{ borderColor: `${nodePath.color}55`, boxShadow: `0 0 40px ${nodePath.color}14` }}
        >
          <div className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-faint mb-3">
            Node readout · {node.role}
          </div>
          <div className="font-display font-bold text-2xl" style={{ color: nodePath.color }}>
            {node.label}
          </div>
          {node.sub && <div className="text-dim text-[13px] italic mt-1">{node.sub}</div>}
          <p className="text-[13.5px] leading-relaxed mt-4 text-ink/90">{node.desc}</p>
          <div className="mt-4 pt-4 border-t border-line/70">
            <PathwayTag k={node.pathway} />
            <p className="text-[12px] text-dim mt-2 leading-relaxed">{nodePath.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HORMONE SWITCH ================= */
const STATE_COLORS: Record<string, string> = {
  ON: "#6ef0a3",
  OFF: "#ff6157",
  RISING: "#ffc44f",
  FALLING: "#c4a9ff",
};

export function HormoneSwitch() {
  const [sel, setSel] = useState(0);
  const s = SWITCH_STATES[sel];

  return (
    <div className="md:grid md:grid-cols-[300px_1fr] gap-8 items-start">
      <Reveal>
        <div className="flex md:flex-col gap-2">
          {SWITCH_STATES.map((st, i) => {
            const on = i === sel;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSel(i)}
                className="gene-chip flex-1 md:flex-none text-left border rounded-lg p-4 cursor-pointer"
                style={{
                  borderColor: on ? "#6ef0a3" : "rgba(28,59,70,0.9)",
                  background: on ? "rgba(110,240,163,0.09)" : "rgba(11,34,43,0.5)",
                  boxShadow: on ? "0 0 26px rgba(110,240,163,0.18)" : "none",
                }}
              >
                <div className="font-display font-semibold text-[15px]" style={{ color: on ? "#6ef0a3" : "#d8ebe4" }}>
                  {st.name}
                </div>
                <div className="font-mono text-[10.5px] text-dim mt-0.5">{st.time}</div>
              </button>
            );
          })}
        </div>

        {/* hormone balance bars */}
        <div className="mt-6 border border-line rounded-xl p-5 bg-panel/50">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-faint mb-4">Hormone balance</div>
          {[
            { label: "Juvenile hormone", val: s.jh, color: "#ffc44f" },
            { label: "20-ecdysone", val: s.ecd, color: "#6ef0a3" },
          ].map((b) => (
            <div key={b.label} className="mb-3.5 last:mb-0">
              <div className="flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] mb-1">
                <span className="text-dim">{b.label}</span>
                <span style={{ color: b.color }}>{b.val}%</span>
              </div>
              <div className="h-2 rounded-full bg-abyss border border-line/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${b.val}%`,
                    background: `linear-gradient(90deg, ${b.color}44, ${b.color})`,
                    boxShadow: `0 0 12px ${b.color}77`,
                  }}
                />
              </div>
            </div>
          ))}
          <p className="text-[12px] text-dim italic mt-4 leading-relaxed">{s.headline}</p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="border border-line rounded-xl bg-panel/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.24em] text-faint">
            Gene state readout — {s.name}
          </div>
          <div key={s.id}>
            {s.rows.map((r) => {
              const c = STATE_COLORS[r.state];
              return (
                <div
                  key={r.gene}
                  className="px-5 py-4 border-b border-line/40 last:border-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 hover:bg-panel/70 transition-colors"
                >
                  <em className="font-mono font-semibold text-[13.5px] text-ink sm:w-[190px] shrink-0">{r.gene}</em>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded border sm:w-[110px] text-center shrink-0"
                    style={{ color: c, borderColor: `${c}66`, background: `${c}10` }}
                  >
                    {r.state}
                  </span>
                  <span className="text-[12.5px] text-dim leading-relaxed">
                    {r.note}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
