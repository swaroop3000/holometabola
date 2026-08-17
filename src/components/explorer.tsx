import { useEffect, useRef, useState } from "react";
import { PATHWAYS, PathwayKey, STAGES, totalGenes } from "../data/biology";
import { GeneChip, PathwayTag, Reveal } from "./ui";
import { StageMorpher } from "./creatures";

export function StageExplorer() {
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState<Set<PathwayKey>>(new Set(Object.keys(PATHWAYS) as PathwayKey[]));
  const [selected, setSelected] = useState<string | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActive(idx);
          }
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
    );
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const togglePathway = (k: PathwayKey) => {
    setSelected(null);
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(k);
      } else next.add(k);
      return next;
    });
  };

  const stage = STAGES[active];

  return (
    <div>
      {/* channel legend / filters */}
      <Reveal className="sticky top-[58px] z-30 -mx-4 px-4 md:mx-0 md:px-0 py-3 mb-10 backdrop-blur-md" >
        <div className="border border-line/80 rounded-lg bg-abyss/85 px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint mr-2">
            Fluorescence channels
          </span>
          {(Object.keys(PATHWAYS) as PathwayKey[]).map((k) => {
            const p = PATHWAYS[k];
            const on = enabled.has(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => togglePathway(k)}
                className="gene-chip font-mono text-[10.5px] uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-md border cursor-pointer flex items-center gap-1.5"
                style={{
                  borderColor: on ? `${p.color}77` : "rgba(28,59,70,0.7)",
                  color: on ? p.color : "#5d7a80",
                  background: on ? `${p.color}12` : "transparent",
                  opacity: on ? 1 : 0.55,
                }}
                title={p.name}
                aria-pressed={on}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: on ? p.color : "#5d7a80", boxShadow: on ? `0 0 6px ${p.color}` : "none" }}
                />
                {k}
              </button>
            );
          })}
          <span className="ml-auto hidden lg:block font-mono text-[10px] text-faint">
            click a channel to isolate · click a gene to read
          </span>
        </div>
      </Reveal>

      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-14 xl:grid-cols-[420px_1fr]">
        {/* sticky specimen column */}
        <div className="hidden lg:block">
          <div className="sticky top-[130px]">
            <div className="relative border border-line rounded-xl bg-panel/60 p-6 overflow-hidden">
              <span
                className="absolute -top-7 -right-3 font-display font-extrabold text-[130px] leading-none select-none pointer-events-none"
                style={{ color: `${stage.accent}0f` }}
              >
                {stage.num}
              </span>

              <StageMorpher active={active} className="aspect-square w-full max-w-[320px] mx-auto" />

              <div className="mt-4 text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: stage.accent }}>
                  Stage {stage.num} — {stage.latin}
                </div>
                <div className="font-display font-bold text-2xl mt-1.5">{stage.name}</div>
                <div className="font-mono text-[11px] text-dim mt-1">
                  {stage.window} · {stage.duration}
                </div>
              </div>

              {/* hormone bars */}
              <div className="mt-5 space-y-3">
                {[
                  { label: "20-ecdysone titer", val: stage.ecd, color: "#6ef0a3" },
                  { label: "juvenile hormone", val: stage.jh, color: "#ffc44f" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-dim mb-1">
                      <span>{b.label}</span>
                      <span style={{ color: b.color }}>{b.val}%</span>
                    </div>
                    <div className="h-[5px] rounded-full bg-abyss border border-line/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${b.val}%`,
                          background: `linear-gradient(90deg, ${b.color}55, ${b.color})`,
                          boxShadow: `0 0 10px ${b.color}88`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* stage jump dots */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {STAGES.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-label={`Go to ${s.name}`}
                    onClick={() =>
                      sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="cursor-pointer rounded-full transition-all duration-300"
                    style={{
                      width: i === active ? 26 : 9,
                      height: 9,
                      background: i === active ? s.accent : "rgba(28,59,70,0.9)",
                      boxShadow: i === active ? `0 0 12px ${s.accent}99` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* scrolling gene modules */}
        <div className="space-y-20">
          {STAGES.map((s, si) => {
            const count = s.groups.reduce((n, g) => n + g.genes.length, 0);
            return (
              <section
                key={s.key}
                data-idx={si}
                ref={(el) => {
                  sectionRefs.current[si] = el;
                }}
                className="scroll-mt-[150px]"
              >
                {/* mobile stage header with creature */}
                <Reveal className="lg:hidden mb-8 border border-line rounded-xl bg-panel/60 p-5 flex items-center gap-5">
                  <div className="w-24 h-24 shrink-0">
                    <StageMorpher active={si} className="w-full h-full" />
                  </div>
                  <div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.26em]" style={{ color: s.accent }}>
                      Stage {s.num} — {s.latin}
                    </div>
                    <div className="font-display font-bold text-xl mt-1">{s.name}</div>
                    <div className="font-mono text-[10.5px] text-dim mt-0.5">{s.window}</div>
                  </div>
                </Reveal>

                <Reveal>
                  <div className="flex items-baseline gap-5 mb-3">
                    <span className="font-display font-extrabold text-5xl md:text-6xl leading-none" style={{ color: `${s.accent}2e` }}>
                      {s.num}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-2xl md:text-[1.9rem] leading-tight">{s.name}</h3>
                      <div className="font-mono text-[11px] text-dim mt-1">
                        {s.latin} · {s.window} · {s.duration}
                      </div>
                    </div>
                  </div>
                  <p className="text-dim text-[14.5px] leading-relaxed max-w-2xl mb-2">{s.summary}</p>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint mb-8">
                    <span style={{ color: s.accent }}>{count} genes mapped</span> at this stage · of {totalGenes} annotations
                  </div>
                </Reveal>

                <div className="space-y-9">
                  {s.groups.map((g, gi) => (
                    <Reveal key={g.title} delay={gi * 60}>
                      <div className="border border-line/70 rounded-lg bg-panel/40 p-5 md:p-6 transition-colors duration-300 hover:border-line hover:bg-panel/70">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1.5">
                          <h4 className="font-display font-semibold text-[15px] md:text-base tracking-tight">{g.title}</h4>
                          <span className="font-mono text-[10px] text-faint uppercase tracking-[0.18em]">
                            {g.genes.length} genes
                          </span>
                        </div>
                        <p className="text-dim text-[13px] leading-relaxed mb-4 max-w-2xl">{g.blurb}</p>
                        <div className="flex flex-wrap gap-2">
                          {g.genes.map((gene) => (
                            <GeneChip
                              key={`${s.key}-${gene.symbol}`}
                              gene={gene}
                              selected={selected === `${s.key}:${gene.symbol}`}
                              onSelect={(sym) => setSelected(sym ? `${s.key}:${sym}` : null)}
                              dimmed={!enabled.has(gene.pathway)}
                            />
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* pathway footnote */}
      <Reveal className="mt-16 grid sm:grid-cols-2 gap-3">
        {(Object.keys(PATHWAYS) as PathwayKey[]).map((k) => {
          const p = PATHWAYS[k];
          return (
            <div key={k} className="flex items-start gap-3 border border-line/60 rounded-lg p-4 bg-panel/30">
              <PathwayTag k={k} />
              <p className="text-[12.5px] text-dim leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
