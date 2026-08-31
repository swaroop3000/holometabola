import { ReactNode, useEffect, useRef, useState, CSSProperties } from "react";
import { Gene, PathwayKey, PATHWAYS } from "../data/biology";

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${on ? "on" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------------- scramble-decode text ---------------- */
const GLYPHS = "ACGTU··E93KRB—/\\<>*";

export function Scramble({ text, className = "", speed = 26 }: { text: string; className?: string; speed?: number }) {
  const [out, setOut] = useState(prefersReduced() ? text : "");
  const frame = useRef(0);

  useEffect(() => {
    if (prefersReduced()) {
      setOut(text);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (now - last >= speed) {
        last = now;
        frame.current += 1;
        const fixed = Math.floor(frame.current / 2.2);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " " || text[i] === "·") s += text[i];
          else if (i < fixed) s += text[i];
          else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(s);
        if (fixed >= text.length) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, speed]);

  return (
    <span className={className} aria-label={text}>
      {out}
      {out.length < text.length && <span className="caret text-ecd">▌</span>}
    </span>
  );
}

/* ---------------- section header ---------------- */
export function SectionHead({
  index,
  kicker,
  title,
  desc,
  accent = "#6ef0a3",
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  desc?: string;
  accent?: string;
}) {
  return (
    <Reveal className="mb-12 md:mb-16 max-w-4xl">
      <div className="flex items-center gap-4 mb-5">
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase px-2.5 py-1 border"
          style={{ color: accent, borderColor: `${accent}55`, background: `${accent}0d` }}>
          {index} / {kicker}
        </span>
        <span className="h-px flex-1 max-w-[180px]" style={{ background: `linear-gradient(90deg, ${accent}66, transparent)` }} />
      </div>
      <h2 className="font-display font-bold text-[clamp(1.6rem,4.2vw,3.1rem)] leading-[1.06] tracking-tight">
        {title}
      </h2>
      {desc && <p className="mt-5 text-dim text-[15px] md:text-base leading-relaxed max-w-2xl">{desc}</p>}
    </Reveal>
  );
}

/* ---------------- pathway tag ---------------- */
export function PathwayTag({ k, small = false }: { k: PathwayKey; small?: boolean }) {
  const p = PATHWAYS[k];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase ${small ? "text-[9px]" : "text-[10px]"} tracking-[0.14em]`}
      style={{ color: p.color }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
      {k}
    </span>
  );
}

/* ---------------- gene chip + expanded detail ---------------- */
export function GeneChip({
  gene,
  selected,
  onSelect,
  dimmed,
}: {
  gene: Gene;
  selected: boolean;
  onSelect: (symbol: string | null) => void;
  dimmed: boolean;
}) {
  const p = PATHWAYS[gene.pathway];
  const style: CSSProperties = {
    borderColor: selected ? p.color : "rgba(28,59,70,0.9)",
    background: selected ? `${p.color}14` : "rgba(11,34,43,0.72)",
    opacity: dimmed ? 0.22 : 1,
    filter: dimmed ? "saturate(0.3)" : "none",
    boxShadow: selected ? `0 0 22px ${p.color}33, inset 0 0 14px ${p.color}0f` : "none",
  };

  return (
    <span className={selected ? "w-full" : ""}>
      <button
        type="button"
        className="gene-chip font-mono text-[12.5px] font-medium px-3 py-[7px] rounded-md border cursor-pointer select-none text-left"
        style={{ ...style, color: selected ? p.color : "#d8ebe4" }}
        onMouseEnter={(e) => {
          if (!dimmed) (e.currentTarget as HTMLButtonElement).style.borderColor = `${p.color}88`;
        }}
        onMouseLeave={(e) => {
          if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(28,59,70,0.9)";
        }}
        onClick={() => onSelect(selected ? null : gene.symbol)}
        aria-expanded={selected}
      >
        <span style={{ color: p.color }} className="mr-1.5">▸</span>
        <em className="not-italic">{gene.symbol}</em>
      </button>

      {selected && (
        <span
          className="block mt-2 mb-3 p-4 rounded-lg border-l-2 border"
          style={{ background: "rgba(8,26,33,0.9)", borderColor: `${p.color}44`, borderLeftColor: p.color }}
        >
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <em className="font-mono font-bold text-[15px]" style={{ color: p.color }}>
              {gene.symbol}
            </em>
            <span className="text-dim text-[13px] italic">{gene.alias}</span>
            {gene.klass && (
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-faint border border-line rounded px-1.5 py-0.5">
                {gene.klass}
              </span>
            )}
            <PathwayTag k={gene.pathway} small />
          </span>
          <span className="block mt-2 text-[13.5px] text-ink/90 leading-relaxed">{gene.fn}</span>
          <span className="block mt-2 text-[12.5px] leading-relaxed pl-3 border-l" style={{ borderColor: `${p.color}55`, color: "#a9c6c2" }}>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] mr-2" style={{ color: p.color }}>
              stage role
            </span>
            {gene.note}
          </span>
        </span>
      )}
    </span>
  );
}

/* ---------------- stat ---------------- */
export function Stat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="border-l-2 pl-4" style={{ borderColor: accent }}>
      <div className="font-display font-bold text-xl md:text-2xl" style={{ color: accent }}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint mt-1">{label}</div>
    </div>
  );
}
