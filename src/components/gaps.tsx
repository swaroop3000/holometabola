import { useState } from "react";
import { GAPS } from "../data/biology";
import { Reveal } from "./ui";

export function ResearchGaps() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {/* dossier intro bar */}
      <Reveal className="mb-12 border border-dashed rounded-xl p-6 md:p-8 relative overflow-hidden" >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(600px 200px at 15% 0%, rgba(255,196,79,0.08), transparent 70%)" }}
        />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <div className="font-display font-bold text-2xl md:text-3xl">
              <span className="text-jh">10</span> open files
            </div>
            <p className="text-dim text-[13.5px] mt-1.5 max-w-xl leading-relaxed">
              The cascade is mapped, but the programme is far from solved. These are the questions current
              literature — as of 2026 — leaves explicitly unanswered.
            </p>
          </div>
          <div className="flex gap-6 ml-auto">
            {[
              { n: "01–03", l: "regulatory grammar" },
              { n: "04–05", l: "resolution & timing" },
              { n: "06–09", l: "evolution & systems" },
              { n: "10", l: "translation" },
            ].map((x) => (
              <div key={x.n}>
                <div className="font-mono font-bold text-[15px] text-jh">{x.n}</div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint mt-0.5">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="md:grid md:grid-cols-2 gap-5">
        {GAPS.map((g, i) => {
          const isOpen = open === g.id;
          return (
            <Reveal key={g.id} delay={(i % 2) * 80} className={i % 2 === 1 ? "md:mt-12" : ""}>
              <article
                className="border rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  borderColor: isOpen ? "rgba(255,196,79,0.5)" : "rgba(28,59,70,0.8)",
                  background: isOpen ? "rgba(14,42,52,0.55)" : "rgba(11,34,43,0.4)",
                  boxShadow: isOpen ? "0 0 40px rgba(255,196,79,0.07)" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : g.id)}
                  className="w-full text-left p-5 md:p-6 cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-5">
                    <span className="font-display font-extrabold text-[40px] leading-none text-jh/25 group-hover:text-jh/60 transition-colors shrink-0 w-[56px]">
                      {String(g.id).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-jh border border-jh/40 border-dashed rounded px-2 py-0.5 inline-block mb-2.5">
                        {g.tag} · open question
                      </span>
                      <span className="block font-display font-semibold text-[16.5px] md:text-lg leading-snug group-hover:text-jh transition-colors">
                        {g.title}
                      </span>
                    </span>
                    <span
                      className="mt-1 w-8 h-8 rounded-full border border-line grid place-items-center shrink-0 transition-all duration-300"
                      style={{
                        transform: isOpen ? "rotate(45deg)" : "none",
                        borderColor: isOpen ? "rgba(255,196,79,0.6)" : undefined,
                        color: isOpen ? "#ffc44f" : "#93aeb1",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                </button>

                <div className={`acc-body ${isOpen ? "open" : ""}`}>
                  <div className="acc-inner">
                    <div className="px-5 md:px-6 pb-6 md:pb-7 md:pl-[101px] space-y-4">
                      <div className="border-l-2 pl-4" style={{ borderColor: "#6ef0a3" }}>
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-ecd mb-1.5">
                          ✓ established
                        </div>
                        <p className="text-[13px] text-dim leading-relaxed">{g.known}</p>
                      </div>
                      <div className="border-l-2 border-dashed pl-4" style={{ borderColor: "#ffc44f" }}>
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-jh mb-1.5">
                          ? unknown — not yet researched
                        </div>
                        <p className="text-[13px] text-ink/85 leading-relaxed">{g.unknown}</p>
                      </div>
                      <p className="text-[12.5px] italic text-faint leading-relaxed pt-1 border-t border-line/50">
                        Why it matters — {g.why}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ================= FOOTER / REFERENCES ================= */
export function Footer() {
  const refs = [
    "Thummel, C.S. (1996). Flies on steroids — the genetics of ecdysone signaling. BioEssays.",
    "Karim, F.D. et al. (1993). The Ecdysone Regulatory Cascade: E74, E75, BR-C. Genes & Dev.",
    "Bai, J., Zhou, Y. & Riddiford, L.M. (2000). E93 determines adult development. Genes & Dev.",
    "Zhou, X. & Riddiford, L.M. (2002). Broad specifies pupal development and mediates the prepupal–pupal transition. Development.",
    "Riddiford, L.M. (2012). How does juvenile hormone control insect metamorphosis? Annu. Rev. Entomol.",
    "Yamanaka, N., Rewitz, K.F. & O'Connor, M.B. (2013). Ecdysone control of developmental transitions. Annu. Rev. Entomol.",
    "Truman, J.W. & Riddiford, L.M. (2019). The morphostatic vs. morphogenetic actions of JH. EvoDevo.",
    "Rewitz, K. et al. — PTTH/Torso & Halloween-gene regulation of the prothoracic gland.",
    "Drosophila modERN & whole-organism single-cell atlases (2022–2025) — metamorphosis time courses.",
    "Drosophila hemibrain connectome & larval CNS connectome — circuit remodeling references.",
  ];
  return (
    <footer className="border-t border-line/70 mt-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-14">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
          <div>
            <div className="font-display font-bold text-lg">
              METAMORPHOSIS<span className="text-ecd">.</span>
            </div>
            <p className="text-dim text-[13px] leading-relaxed mt-3 max-w-sm">
              An interactive genetic atlas of complete metamorphosis (holometaboly) in{" "}
              <em>Drosophila melanogaster</em>. Gene symbols follow FlyBase conventions; functions summarized
              from the literature cited. This is an educational synthesis — consult FlyBase for authoritative
              annotations.
            </p>
            <div className="flex gap-2.5 mt-5">
              {["4 stages", "8 pathways", "10 open files", "~10 days"].map((t) => (
                <span key={t} className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint border border-line rounded px-2 py-1">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-faint mb-4">Key literature</div>
            <ol className="space-y-2.5">
              {refs.map((r, i) => (
                <li key={i} className="flex gap-3 text-[12.5px] text-dim leading-relaxed">
                  <span className="font-mono text-[10.5px] text-ecd shrink-0 pt-0.5">[{String(i + 1).padStart(2, "0")}]</span>
                  {r}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-12 pt-6 border-t border-line/50">
          <span className="font-mono text-[10.5px] text-faint">
            Every gene listed is real — the mysteries are real too.
          </span>
          <span className="font-mono text-[10.5px] text-faint">
            25 °C · 60% RH · 12:12 LD · <span className="text-ecd">built with React</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
