import { CSSProperties, useEffect, useMemo, useState } from "react";
import { PULSES, STAGES, TICKER_GENES, PATHWAYS, totalGenes } from "./data/biology";
import { Reveal, Scramble, SectionHead, Stat, prefersReduced } from "./components/ui";
import { StageMorpher } from "./components/creatures";
import { StageExplorer } from "./components/explorer";
import { MetamorphosisLab } from "./components/lab3d";
import { PulseTimeline, CascadeDiagram, HormoneSwitch } from "./components/cascade";
import { ResearchGaps, Footer } from "./components/gaps";

/* ================= ambient backdrop ================= */
const SPECK_COLORS = ["#6ef0a3", "#ffc44f", "#5bc9ff", "#4fe0d0", "#c4a9ff", "#ff7e9e"];

function Backdrop() {
  const specks = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1.5 + Math.random() * 3,
        color: SPECK_COLORS[i % SPECK_COLORS.length],
        dur: 10 + Math.random() * 16,
        delay: Math.random() * 14,
        dx: (Math.random() - 0.5) * 90,
        dy: -(40 + Math.random() * 110),
        op: 0.25 + Math.random() * 0.5,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 18% -10%, rgba(14,58,66,0.55), transparent 60%), radial-gradient(900px 600px at 92% 12%, rgba(28,52,30,0.35), transparent 55%), radial-gradient(1000px 800px at 70% 110%, rgba(64,44,12,0.22), transparent 60%), linear-gradient(180deg, #07151c 0%, #050f14 45%, #040c10 100%)",
        }}
      />
      {/* graticule */}
      <div className="absolute inset-0 graticule" />
      {/* channel glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 380px at 12% 24%, rgba(110,240,163,0.07), transparent 70%), radial-gradient(480px 380px at 88% 70%, rgba(255,196,79,0.06), transparent 70%), radial-gradient(420px 340px at 55% 45%, rgba(91,201,255,0.045), transparent 70%)",
        }}
      />
      {/* drifting specks */}
      {specks.map((s) => {
        const style: CSSProperties = {
          left: s.left,
          top: s.top,
          width: s.size,
          height: s.size,
          background: s.color,
          boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
          opacity: 0,
          animationDelay: `${s.delay}s`,
        };
        (style as Record<string, unknown>)["--dur"] = `${s.dur}s`;
        (style as Record<string, unknown>)["--dx"] = `${s.dx}px`;
        (style as Record<string, unknown>)["--dy"] = `${s.dy}px`;
        (style as Record<string, unknown>)["--tw"] = s.op;
        return <span key={s.id} className="speck absolute rounded-full" style={style} />;
      })}
      {/* noise + vignette */}
      <div className="absolute inset-0 noise-overlay" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(2,8,11,0.55) 100%)" }}
      />
    </div>
  );
}

/* ================= header ================= */
const NAV = [
  { id: "stages", label: "Stages" },
  { id: "clock", label: "Clock" },
  { id: "cascade", label: "Cascade" },
  { id: "toggle", label: "Switch" },
  { id: "gaps", label: "Unknowns" },
];

function Header({ view, setView }: { view: "atlas" | "lab"; setView: (v: "atlas" | "lab") => void }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-abyss/80 backdrop-blur-md border-b border-line/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[58px] flex items-center gap-4 md:gap-6">
        <a href="#plate" onClick={() => setView("atlas")} className="flex items-center gap-2.5 group shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-ecd relative">
            <span className="absolute inset-0 rounded-full bg-ecd animate-ping opacity-40" />
          </span>
          <span className="font-display font-bold text-[13px] tracking-[0.08em] group-hover:text-ecd transition-colors">
            HOLOMETABOLA
          </span>
        </a>

        {/* view switcher */}
        <div className="flex items-center gap-1 border border-line rounded-lg p-1 bg-deep/60">
          <button
            type="button"
            onClick={() => setView("atlas")}
            className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] px-2.5 md:px-3.5 py-1.5 rounded-md transition-all cursor-pointer"
            style={{
              background: view === "atlas" ? "rgba(110,240,163,0.14)" : "transparent",
              color: view === "atlas" ? "#6ef0a3" : "#93aeb1",
              boxShadow: view === "atlas" ? "0 0 14px rgba(110,240,163,0.2)" : "none",
            }}
          >
            Genome atlas
          </button>
          <button
            type="button"
            onClick={() => setView("lab")}
            className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.14em] px-2.5 md:px-3.5 py-1.5 rounded-md transition-all cursor-pointer"
            style={{
              background: view === "lab" ? "rgba(196,169,255,0.14)" : "transparent",
              color: view === "lab" ? "#c4a9ff" : "#93aeb1",
              boxShadow: view === "lab" ? "0 0 14px rgba(196,169,255,0.2)" : "none",
            }}
          >
            ⬡ 3D lab
          </button>
        </div>

        <nav className="ml-auto hidden lg:flex items-center gap-1">
          {view === "atlas" &&
            NAV.map((n, i) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim hover:text-ecd px-3 py-1.5 rounded transition-colors"
              >
                <span className="text-faint mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                {n.label}
              </a>
            ))}
        </nav>
        <span className="ml-auto lg:ml-0 font-mono text-[10.5px] text-faint hidden md:block">
          D. melanogaster · 25 °C
        </span>
      </div>
      <div className="h-[2px] bg-line/40">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4fe0d0, #6ef0a3, #ffc44f)", boxShadow: "0 0 8px rgba(110,240,163,0.7)" }}
        />
      </div>
    </header>
  );
}

/* ================= mini titer sparkline ================= */
function Sparkline() {
  const path = useMemo(() => {
    const base = 96;
    let d = `M0 ${base}`;
    PULSES.forEach((p) => {
      const y = base - p.h * 0.5;
      d += ` L${p.x - 64} ${base} C${p.x - 30} ${base} ${p.x - 20} ${y} ${p.x} ${y} C${p.x + 20} ${y} ${p.x + 30} ${base} ${p.x + 64} ${base}`;
    });
    return d + ` L1000 ${base}`;
  }, []);

  return (
    <svg viewBox="0 0 1000 110" className="w-full" aria-hidden="true" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="rgba(110,240,163,0.55)" strokeWidth="1.8" className="dashflow" />
      {PULSES.map((p) => (
        <circle key={p.id} cx={p.x} cy={96 - p.h * 0.5} r="3" fill="#6ef0a3" />
      ))}
      <line x1="0" y1="96" x2="1000" y2="96" stroke="rgba(93,122,128,0.4)" strokeWidth="1" />
    </svg>
  );
}

/* ================= ticker ================= */
function Ticker() {
  const items = [...TICKER_GENES, ...TICKER_GENES];
  return (
    <div className="border-y border-line/70 bg-deep/60 overflow-hidden py-3" aria-hidden="true">
      <div className="ticker-track flex w-max items-center gap-7 pr-7">
        {items.map((g, i) => {
          const p = PATHWAYS[g.pathway];
          return (
            <span key={i} className="flex items-center gap-2 font-mono text-[12px] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
              <span style={{ color: `${p.color}cc` }}>{g.symbol}</span>
              <span className="text-faint">→</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ================= opening specimen plate ================= */
function SpecimenPlate() {
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (prefersReduced() || paused) return;
    const t = setInterval(() => setStage((s) => (s + 1) % 4), 3000);
    return () => clearInterval(t);
  }, [paused]);

  const s = STAGES[stage];

  return (
    <section id="plate" className="relative min-h-screen flex flex-col justify-end lg:justify-center pt-28 pb-10">
      {/* vertical side label */}
      <div className="hidden xl:flex flex-col items-center gap-4 absolute left-6 top-1/2 -translate-y-1/2 rotate-180" style={{ writingMode: "vertical-rl" }}>
        <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-faint">
          egg → larva → pupa → adult
        </span>
        <span className="h-24 w-px bg-line" />
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-faint">one genome · four bodies</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full grid lg:grid-cols-[1.12fr_0.88fr] gap-14 lg:gap-10 items-center flex-1">
        {/* left: title block */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-seg border border-seg/40 bg-seg/5 px-3 py-1.5 rounded">
                Holometabola · complete metamorphosis
              </span>
            </div>
          </Reveal>

          <h1 className="font-display font-extrabold leading-[0.98] tracking-tight text-[clamp(2.3rem,6.4vw,4.9rem)]">
            <Scramble text="META-" />
            <br />
            <span className="text-ecd">
              <Scramble text="MORPHOSIS" speed={34} />
            </span>
          </h1>

          <Reveal delay={200}>
            <p className="mt-7 text-dim text-[15.5px] md:text-[17px] leading-relaxed max-w-xl">
              One genome builds <span className="text-ink font-semibold">four different animals</span>. This atlas walks
              the entire programme of <em>Drosophila melanogaster</em> — every mapped gene at every stage,
              the ecdysone pulses that conduct them, and the questions science still cannot answer.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-xl">
              <Stat value="4" label="life stages" accent="#4fe0d0" />
              <Stat value={`${totalGenes}+`} label="gene annotations" accent="#6ef0a3" />
              <Stat value="6" label="20E pulses" accent="#ffc44f" />
              <Stat value="10" label="open research gaps" accent="#ff7e9e" />
            </div>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#stages"
                className="font-mono text-[12px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-lg bg-ecd text-abyss font-bold hover:brightness-110 transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "0 0 30px rgba(110,240,163,0.35)" }}
              >
                Read the programme ↓
              </a>
              <a
                href="#gaps"
                className="font-mono text-[12px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-lg border border-jh/50 text-jh hover:bg-jh/10 transition-all hover:-translate-y-0.5"
              >
                Jump to the unknowns
              </a>
            </div>
          </Reveal>
        </div>

        {/* right: specimen dish */}
        <Reveal delay={150}>
          <div
            className="relative mx-auto w-[min(88vw,430px)]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* dish ring */}
            <div
              className="relative aspect-square rounded-full border transition-colors duration-700 overflow-hidden"
              style={{
                borderColor: `${s.accent}55`,
                background: "radial-gradient(circle at 40% 32%, rgba(14,42,52,0.85), rgba(5,15,20,0.95) 78%)",
                boxShadow: `0 0 80px ${s.accent}1e, inset 0 0 60px rgba(5,15,20,0.9)`,
              }}
            >
              {/* inner graticule */}
              <div
                className="absolute inset-6 rounded-full border border-line/60"
                style={{ backgroundImage: "radial-gradient(circle, transparent 62%, rgba(28,59,70,0.5) 63%, transparent 64%)" }}
              />
              <div className="absolute inset-12 rounded-full border border-line/40" />
              <div className="absolute left-1/2 top-6 bottom-6 w-px bg-line/30" />
              <div className="absolute top-1/2 left-6 right-6 h-px bg-line/30" />

              <StageMorpher active={stage} className="absolute inset-[13%]" />

              {/* measurement ticks */}
              <span className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] text-faint tracking-[0.3em]">SPECIMEN {s.num}</span>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] text-faint tracking-[0.2em]">{s.window}</span>
            </div>

            {/* stage tabs */}
            <div className="mt-6 grid grid-cols-4 gap-2">
              {STAGES.map((st, i) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setStage(i)}
                  className="gene-chip cursor-pointer border rounded-lg px-2 py-2.5 text-center"
                  style={{
                    borderColor: i === stage ? st.accent : "rgba(28,59,70,0.8)",
                    background: i === stage ? `${st.accent}14` : "rgba(11,34,43,0.5)",
                    boxShadow: i === stage ? `0 0 18px ${st.accent}2e` : "none",
                  }}
                >
                  <span className="block font-mono text-[9px] tracking-[0.18em] text-faint">{st.num}</span>
                  <span className="block font-display font-semibold text-[11.5px] mt-0.5" style={{ color: i === stage ? st.accent : "#93aeb1" }}>
                    {st.name.split(" · ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* bottom titer strip */}
      <Reveal delay={250} className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-14">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-faint shrink-0 hidden sm:block">
            20E titer · full life
          </span>
          <div className="flex-1">
            <Sparkline />
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ecd shrink-0 hidden sm:block">6 pulses</span>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= app ================= */
export default function App() {
  const [view, setViewRaw] = useState<"atlas" | "lab">("atlas");
  const setView = (v: "atlas" | "lab") => {
    setViewRaw(v);
    window.scrollTo(0, 0);
  };

  if (view === "lab") {
    return (
      <div className="relative">
        <Header view={view} setView={setView} />
        <MetamorphosisLab onOpenAtlas={() => setView("atlas")} />
      </div>
    );
  }

  return (
    <div className="relative">
      <Backdrop />
      <Header view={view} setView={setView} />

      <main className="relative z-10">
        <SpecimenPlate />
        <Ticker />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <section id="stages" className="scroll-mt-[90px] pt-24 md:pt-32">
            <SectionHead
              index="01"
              kicker="Stage-by-stage genome"
              accent="#4fe0d0"
              title={
                <>
                  Every gene, <span className="text-seg">at every stage</span>
                </>
              }
              desc={`Four bodies, one instruction manual. Scroll through the complete programme — ${totalGenes} gene annotations across 8 molecular pathways — and click any gene to read its molecular function and its stage-specific role.`}
            />
            <StageExplorer />
          </section>

          <section id="clock" className="scroll-mt-[90px] pt-28 md:pt-36">
            <SectionHead
              index="02"
              kicker="The ecdysone clock"
              accent="#6ef0a3"
              title={
                <>
                  Six pulses <span className="text-ecd">run the entire show</span>
                </>
              }
              desc="Development is conducted by steroid pulses in the hemolymph. The same hormone, at different times and with different company, makes a larva molt — or makes it stop being a larva forever. Select a pulse to see which genes it fires."
            />
            <PulseTimeline />
          </section>

          <section id="cascade" className="scroll-mt-[90px] pt-28 md:pt-36">
            <SectionHead
              index="03"
              kicker="Pupal transcriptional cascade"
              accent="#c4a9ff"
              title={
                <>
                  From hormone to fate, <span className="text-ecl">in six layers</span>
                </>
              }
              desc="The metamorphic pulse is transduced through a nuclear-receptor cascade: early genes within an hour, a competence window, late timers, and finally the E93/Kr-h1 selector toggle that makes the decision irreversible. Click any node."
            />
            <CascadeDiagram />
          </section>

          <section id="toggle" className="scroll-mt-[90px] pt-28 md:pt-36">
            <SectionHead
              index="04"
              kicker="The decision"
              accent="#ffc44f"
              title={
                <>
                  Two hormones, <span className="text-jh">one irreversible decision</span>
                </>
              }
              desc="Juvenile hormone is the status-quo signal: while it flows, every pulse makes another larva. Metamorphosis begins not with something new, but with an absence — the withdrawal of JH. Step through the three states."
            />
            <HormoneSwitch />
          </section>

          <section id="gaps" className="scroll-mt-[90px] pt-28 md:pt-36">
            <SectionHead
              index="05"
              kicker="Terra incognita"
              accent="#ffc44f"
              title={
                <>
                  What science has <span className="text-jh">not yet answered</span>
                </>
              }
              desc="A century after the hormones were discovered, the programme still holds genuine unknowns — from the unread enhancer grammar of a pulse to the evolutionary origin of the pupa itself. Ten open files, each split into what is established and what is not."
            />
            <ResearchGaps />
          </section>
        </div>

        <Footer />
      </main>
    </div>
  );
}
