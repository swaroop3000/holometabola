export type PathwayKey = "ECD" | "JH" | "GRW" | "SEG" | "HOX" | "LYS" | "ECL" | "DIF";

export interface Pathway {
  key: PathwayKey;
  name: string;
  short: string;
  color: string;
  desc: string;
}

export const PATHWAYS: Record<PathwayKey, Pathway> = {
  ECD: { key: "ECD", name: "Ecdysone signaling & transcription cascade", short: "Ecdysone cascade", color: "#6ef0a3", desc: "20-hydroxyecdysone (20E) pulses, the EcR/USP receptor and the nuclear-receptor gene cascade it triggers." },
  JH:  { key: "JH",  name: "Juvenile hormone & status-quo", short: "Juvenile hormone", color: "#ffc44f", desc: "JH keeps the larva a larva: Met/Tai receptor complex and Kr-h1 repress the adult programme." },
  GRW: { key: "GRW", name: "Growth · insulin/TOR nutrition axis", short: "Growth & nutrition", color: "#5bc9ff", desc: "Insulin-like peptides, InR/PI3K/Akt/FOXO and TOR measure nutrition and set critical weight." },
  SEG: { key: "SEG", name: "Axes, segmentation & disc patterning", short: "Patterning & axes", color: "#4fe0d0", desc: "Morphogens and segmentation genes that lay out the body plan and pattern the imaginal discs." },
  HOX: { key: "HOX", name: "Hox genes & segment identity", short: "Hox identity", color: "#ff7e9e", desc: "Homeotic selector genes and their epigenetic keepers (Polycomb/Trithorax) that assign identity to every segment." },
  LYS: { key: "LYS", name: "Histolysis · apoptosis & autophagy", short: "Tissue demolition", color: "#ff6157", desc: "The controlled demolition of larval tissues: RHG apoptotic genes, caspases and autophagy machinery." },
  ECL: { key: "ECL", name: "Eclosion, neural remodeling & clock", short: "Eclosion & neural", color: "#c4a9ff", desc: "Peptide hormones driving ecdysis, circadian gating, and neuronal pruning / rewiring." },
  DIF: { key: "DIF", name: "Differentiation · cuticle, pigment & reproduction", short: "Cuticle & reproduction", color: "#f0a95e", desc: "Cuticle sclerotization, pigmentation enzymes and the reproductive maturation programme." },
};

export interface Gene {
  symbol: string;      // FlyBase symbol
  alias: string;       // full name / alias
  pathway: PathwayKey;
  fn: string;          // molecular function
  note: string;        // role at THIS stage
  klass?: string;      // gene class label
}

export interface GeneGroup {
  title: string;
  blurb: string;
  genes: Gene[];
}

export interface Stage {
  key: "egg" | "larva" | "pupa" | "adult";
  num: string;
  name: string;
  latin: string;
  window: string;
  duration: string;
  summary: string;
  ecd: number;   // 20E level 0-100
  jh: number;    // JH level 0-100
  accent: string;
  groups: GeneGroup[];
}

/* ================================================================
   STAGE 01 — EGG / EMBRYO  (0 – ~24 h after egg laying, 25 °C)
   ================================================================ */
const egg: Stage = {
  key: "egg",
  num: "01",
  name: "Egg · Embryo",
  latin: "Embryogenesis",
  window: "0 – 24 h AEL",
  duration: "≈ 1 day",
  summary:
    "A single fertilized cell is carved into 14 segments in under a day. Maternal gradients deploy gap, pair-rule and segment-polarity genes in sequence; Hox genes are switched on and epigenetically locked; the Halloween genes light the first ecdysone pulse that will drive cuticle synthesis and hatching.",
  ecd: 38,
  jh: 30,
  accent: "#4fe0d0",
  groups: [
    {
      title: "Maternal coordinate system",
      blurb: "mRNAs deposited by the mother define anterior–posterior and terminal axes before the zygote even speaks.",
      genes: [
        { symbol: "bcd", alias: "bicoid", pathway: "SEG", klass: "maternal morphogen", fn: "Anterior morphogen; homeodomain TF that activates hunchback and head/thorax fates.", note: "Forms the anterior-to-posterior concentration gradient that orients the whole embryo." },
        { symbol: "nos", alias: "nanos", pathway: "SEG", klass: "maternal morphogen", fn: "Posterior morphogen; translational repressor of hunchback mRNA.", note: "Protects the germ plasm and permits abdomen formation at the posterior pole." },
        { symbol: "osk", alias: "oskar", pathway: "SEG", klass: "germ-plasm organizer", fn: "Nucleates pole plasm assembly; recruits germ-cell determinants.", note: "Without osk there are no pole cells — and no germ line." },
        { symbol: "tsl", alias: "torso-like", pathway: "SEG", klass: "protease-cofactor", fn: "Processes the torso ligand at both egg poles.", note: "Confines terminal signaling to the very tips of the embryo." },
        { symbol: "tor", alias: "torso", pathway: "SEG", klass: "RTK (moonlighting)", fn: "Receptor tyrosine kinase for terminal patterning.", note: "Famous double agent: the SAME receptor becomes the PTTH receptor that times pupariation later." },
        { symbol: "fs(1)h", alias: "female sterile (1) homeotic", pathway: "SEG", klass: "Trithorax-group", fn: "BET-family chromatin reader; activates zygotic genome at blastoderm.", note: "Required to turn the embryo's own genome on for segmentation." },
      ],
    },
    {
      title: "Gap → pair-rule grid",
      blurb: "Gradients are read into stripes: gap genes carve broad domains, pair-rule genes double the resolution, segment-polarity genes draw the final borders.",
      genes: [
        { symbol: "hb", alias: "hunchback", pathway: "SEG", klass: "gap gene", fn: "Zinc-finger TF; anterior gap gene activated by Bicoid.", note: "First zygotic readout of the bcd gradient." },
        { symbol: "Kr", alias: "Krüppel", pathway: "SEG", klass: "gap gene", fn: "Zinc-finger TF defining the central thoracic domain.", note: "Expressed where Hb concentration falls to intermediate levels." },
        { symbol: "kni", alias: "knirps", pathway: "SEG", klass: "gap gene", fn: "Nuclear-receptor-like TF for posterior gap domain.", note: "Patterns abdominal segments 1–6." },
        { symbol: "gt", alias: "giant", pathway: "SEG", klass: "gap gene", fn: "bZIP TF; anterior and posterior gap domains.", note: "Sharpens boundaries of Kr and kni." },
        { symbol: "tll", alias: "tailless", pathway: "SEG", klass: "orphan nuclear receptor", fn: "Terminal gap gene activated by Torso signaling.", note: "Specifies the acron and telson (terminal structures)." },
        { symbol: "hkb", alias: "huckebein", pathway: "SEG", klass: "zinc-finger TF", fn: "Terminal gap gene downstream of Torso.", note: "Required for gut and terminal cuticle." },
        { symbol: "eve", alias: "even-skipped", pathway: "SEG", klass: "pair-rule gene", fn: "Homeodomain TF; 7-stripe pair-rule pattern.", note: "Its stripe enhancers are the textbook of cis-regulatory logic." },
        { symbol: "ftz", alias: "fushi tarazu", pathway: "SEG", klass: "pair-rule gene", fn: "Homeodomain TF; complementary 7 stripes to eve.", note: "ftz mutants delete alternating segments — 'lacking segments'." },
        { symbol: "h", alias: "hairy", pathway: "SEG", klass: "pair-rule (bHLH)", fn: "bHLH repressor; primary pair-rule stripes.", note: "Also a gap gene-like repressor — dual early role." },
        { symbol: "run", alias: "runt", pathway: "SEG", klass: "pair-rule gene", fn: "Runt-domain TF; pair-rule stripes and sex-lethal activation.", note: "Also feeds into the sex-determination cascade." },
        { symbol: "odd", alias: "odd-skipped", pathway: "SEG", klass: "pair-rule gene", fn: "Zinc-finger TF of odd-numbered parasegments.", note: "Secondary pair-rule gene refining eve/ftz borders." },
        { symbol: "prd", alias: "paired", pathway: "SEG", klass: "pair-rule gene", fn: "Paired-box TF; secondary pair-rule.", note: "Helps set up segment-polarity gene stripes." },
        { symbol: "slp", alias: "sloppy-paired", pathway: "SEG", klass: "pair-rule (Forkhead)", fn: "Forkhead TF; maintains wg stripes.", note: "Keeps segment-polarity expression stable after cellularization." },
      ],
    },
    {
      title: "Segment polarity & Hox identity",
      blurb: "Every parasegment gets an En/Wg/Hh boundary circuit, then Hox genes assign identity — and Polycomb/Trithorax lock the decision in for life.",
      genes: [
        { symbol: "en", alias: "engrailed", pathway: "SEG", klass: "segment polarity", fn: "Homeodomain TF marking posterior compartment of each segment.", note: "Activates hedgehog in every parasegment." },
        { symbol: "wg", alias: "wingless", pathway: "SEG", klass: "segment polarity · Wnt", fn: "Secreted Wnt ligand; maintains en and cell fates.", note: "Part of the self-sustaining en↔wg feedback loop." },
        { symbol: "hh", alias: "hedgehog", pathway: "SEG", klass: "secreted ligand", fn: "Secreted morphogen from en-expressing cells.", note: "Short-range signal maintaining wg stripes." },
        { symbol: "ptc", alias: "patched", pathway: "SEG", klass: "Hh receptor", fn: "12-pass receptor that inhibits Smoothened without Hh.", note: "Hh target and receptor — classic negative-feedback receptor." },
        { symbol: "smo", alias: "smoothened", pathway: "SEG", klass: "GPCR-like", fn: "Signal transducer of the Hh pathway.", note: "Relieves Ptc inhibition when Hh binds." },
        { symbol: "gsb", alias: "gooseberry", pathway: "SEG", klass: "segment polarity", fn: "Paired-box TF; neuroblast and epidermal fates.", note: "Expressed in stripes adjacent to wg domains." },
        { symbol: "arm", alias: "armadillo / β-catenin", pathway: "SEG", klass: "Wnt effector", fn: "β-catenin; Wg transducer and adherens-junction protein.", note: "Dual role in signaling and cell adhesion from day one." },
        { symbol: "lab", alias: "labial", pathway: "HOX", klass: "Hox (ANT-C)", fn: "Homeotic TF for intercalary segment identity.", note: "Most anterior Hox gene; head specification." },
        { symbol: "pb", alias: "proboscipedia", pathway: "HOX", klass: "Hox (ANT-C)", fn: "Homeotic TF for labial/maxillary identity.", note: "Required for proboscis development." },
        { symbol: "Dfd", alias: "Deformed", pathway: "HOX", klass: "Hox (ANT-C)", fn: "Homeotic TF for mandibular/maxillary segments.", note: "Loss transforms head segments toward thorax." },
        { symbol: "Scr", alias: "Sex combs reduced", pathway: "HOX", klass: "Hox (ANT-C)", fn: "Homeotic TF for labial + prothoracic identity.", note: "Specifies the T1 segment (sex comb position later)." },
        { symbol: "Antp", alias: "Antennapedia", pathway: "HOX", klass: "Hox (ANT-C)", fn: "Homeotic TF for T2 (second thoracic) identity.", note: "Misexpression famously grows legs where antennae belong." },
        { symbol: "Ubx", alias: "Ultrabithorax", pathway: "HOX", klass: "Hox (BX-C)", fn: "Homeotic TF for T3 identity; represses wing programme.", note: "T3 makes halteres, not wings — thanks to Ubx." },
        { symbol: "abd-A", alias: "abdominal-A", pathway: "HOX", klass: "Hox (BX-C)", fn: "Homeotic TF for anterior abdominal identity (A1–A4).", note: "Represses limb programmes in the abdomen." },
        { symbol: "Abd-B", alias: "Abdominal-B", pathway: "HOX", klass: "Hox (BX-C)", fn: "Homeotic TF for posterior abdomen (A5–A9) + genitalia.", note: "Most posterior Hox gene; two protein isoforms." },
        { symbol: "trx", alias: "trithorax", pathway: "HOX", klass: "Trithorax-group", fn: "H3K4 methyltransferase; keeps Hox genes ON.", note: "Epigenetic memory of active Hox states." },
        { symbol: "Pc", alias: "Polycomb", pathway: "HOX", klass: "Polycomb-group", fn: "PRC1 chromatin compactor; keeps Hox genes OFF.", note: "Epigenetic memory of silenced Hox states — a lock set in the embryo." },
      ],
    },
    {
      title: "The first ecdysone pulse",
      blurb: "The Halloween genes build the steroid hormone in the embryonic prothoracic gland; a first 20E pulse drives cuticle deposition and prepares hatching.",
      genes: [
        { symbol: "nev", alias: "neverland", pathway: "ECD", klass: "Rieske oxygenase", fn: "First step: cholesterol → 7-dehydrocholesterol.", note: "Gateway enzyme of all ecdysteroid synthesis; flies cannot make cholesterol de novo." },
        { symbol: "spk", alias: "spook", pathway: "ECD", klass: "Halloween · Cyp307a1", fn: "C7/C8-desaturase ('black box' step) of ecdysone biosynthesis.", note: "Embryonic Halloween gene; spookier covers larval stages." },
        { symbol: "spok", alias: "spookier", pathway: "ECD", klass: "Halloween · Cyp307a2", fn: "Redundant C7-desaturase with spook.", note: "Tissue-specific backup ensuring the embryonic pulse." },
        { symbol: "phm", alias: "phantom", pathway: "ECD", klass: "Halloween · Cyp306a1", fn: "C25-hydroxylase converting ketodiol → ecdysone precursor.", note: "Prothoracic-gland enzyme; mutants arrest embryogenesis." },
        { symbol: "dib", alias: "disembodied", pathway: "ECD", klass: "Halloween · Cyp302a1", fn: "C22-hydroxylase in the ecdysone pathway.", note: "Mutant embryos have no ventral cuticle — 'disembodied'." },
        { symbol: "sad", alias: "shadow", pathway: "ECD", klass: "Halloween · Cyp315a1", fn: "C2-hydroxylase completing ecdysone synthesis.", note: "Final step making ecdysone in the prothoracic gland." },
        { symbol: "shd", alias: "shade", pathway: "ECD", klass: "Cyp314a1", fn: "Ecdysone 20-monooxygenase: ecdysone → active 20E.", note: "Expressed in embryonic peripheral tissues — local hormone activation." },
        { symbol: "EcR", alias: "Ecdysone receptor", pathway: "ECD", klass: "nuclear receptor", fn: "Ligand-binding receptor; isoforms EcR-A, EcR-B1, EcR-B2.", note: "Embryonic EcR-B mediates the first pulse response." },
        { symbol: "usp", alias: "ultraspiracle", pathway: "ECD", klass: "RXR partner", fn: "Obligate heterodimer partner of EcR (RXR ortholog).", note: "The receptor only binds DNA as EcR/USP." },
        { symbol: "E74", alias: "Ecdysone-induced protein 74", pathway: "ECD", klass: "early gene · ETS", fn: "ETS-domain TF; early-response transcription factor.", note: "First zygotic targets turned on by the embryonic pulse." },
        { symbol: "E75", alias: "Ecdysone-induced protein 75", pathway: "ECD", klass: "early gene · NR", fn: "Nuclear receptor; early gene with heme-binding.", note: "Also senses gas/heme — metabolic link to the pulse." },
        { symbol: "Br-C", alias: "Broad-Complex", pathway: "ECD", klass: "early gene · Zn-finger", fn: "Zinc-finger TF with 4 isoforms (Z1–Z4).", note: "First appearance — will be reused at every subsequent pulse." },
        { symbol: "ftz-f1", alias: "fushi tarazu factor 1", pathway: "ECD", klass: "orphan nuclear receptor", fn: "βFTZ-F1: 'competence factor' priming the next pulse response.", note: "Embryonic ftz-f1 mutants fail to hatch — it already gates pulses." },
      ],
    },
    {
      title: "Juvenile-hormone competence primed",
      blurb: "The JH receptor machinery is transcribed in the embryonic CNS before any hormone arrives — the status-quo system is pre-wired.",
      genes: [
        { symbol: "Met", alias: "Methoprene-tolerant", pathway: "JH", klass: "bHLH-PAS receptor", fn: "JH receptor; bHLH-PAS TF activated by juvenile hormone.", note: "bHLH-PAS receptor expressed in embryonic CNS, ready for larval life." },
        { symbol: "tai", alias: "taiman / SRC", pathway: "JH", klass: "coactivator", fn: "Steroid receptor coactivator; Met's partner.", note: "Forms the functional Met/Tai complex with JH." },
        { symbol: "Kr-h1", alias: "Krüppel-homolog 1", pathway: "JH", klass: "zinc-finger TF", fn: "JH-response gene; represses metamorphosis genes (incl. E93).", note: "Embryonic expression primes the larval 'stay a larva' programme." },
      ],
    },
  ],
};

/* ================================================================
   STAGE 02 — LARVA  (three instars, ~24 h – 120 h AEL)
   ================================================================ */
const larva: Stage = {
  key: "larva",
  num: "02",
  name: "Larva",
  latin: "L1 → L2 → L3 instars",
  window: "24 – 120 h AEL",
  duration: "≈ 4 days",
  summary:
    "An eating machine. Two small ecdysone pulses trigger the L1→L2 and L2→L3 molts; between pulses, insulin/TOR signaling converts yeast into a 200-fold mass increase. High juvenile hormone keeps Kr-h1 on and metamorphosis off, while imaginal discs — the adult organs in waiting — are patterned by the same morphogens the embryo used.",
  ecd: 55,
  jh: 92,
  accent: "#5bc9ff",
  groups: [
    {
      title: "Growth engine · insulin & TOR",
      blurb: "Nutrition is transduced into growth: brain IPCs secrete insulin-like peptides; the fat body reports amino acids; FOXO and Dilp8 audit progress.",
      genes: [
        { symbol: "Ilp2/3/5", alias: "insulin-like peptides", pathway: "GRW", klass: "peptide hormone", fn: "Drosophila insulins secreted by brain IPCs.", note: "Nutrition-dependent release drives systemic growth of every tissue." },
        { symbol: "InR", alias: "Insulin receptor", pathway: "GRW", klass: "RTK", fn: "Single Drosophila insulin receptor tyrosine kinase.", note: "Sets final body size; hypomorphs are tiny, hyperactive InR → giants." },
        { symbol: "chico", alias: "chico (IRS)", pathway: "GRW", klass: "IRS adaptor", fn: "Insulin-receptor substrate; links InR to PI3K.", note: "chico mutants are small but long-lived — growth/longevity trade-off." },
        { symbol: "Pi3K92E", alias: "PI3-kinase", pathway: "GRW", klass: "lipid kinase", fn: "Produces PIP3 at the membrane downstream of InR/chico.", note: "PIP3 recruits Akt — the growth signal amplifier." },
        { symbol: "Dp110", alias: "PI3K catalytic subunit", pathway: "GRW", klass: "kinase", fn: "Catalytic p110 subunit of PI3K.", note: "Oncogenic when overactive; sizes organs cell-autonomously." },
        { symbol: "Pten", alias: "PTEN phosphatase", pathway: "GRW", klass: "phosphatase", fn: "Dephosphorylates PIP3; brakes PI3K signaling.", note: "Tumor suppressor balancing growth." },
        { symbol: "Akt1", alias: "PKB / Akt", pathway: "GRW", klass: "ser/thr kinase", fn: "Phosphorylates FOXO and Tsc2 to promote growth.", note: "Central node: inactivates the growth brake FOXO." },
        { symbol: "FOXO", alias: "forkhead box O", pathway: "GRW", klass: "forkhead TF", fn: "Starvation TF; nuclear when insulin is low.", note: "Senses under-nutrition; gates the decision to pupariate at small size." },
        { symbol: "TOR", alias: "Target of Rapamycin", pathway: "GRW", klass: "ser/thr kinase", fn: "Nutrient-sensing kinase complex (TORC1) driving translation.", note: "Amino-acid sensor; couples diet to cell growth." },
        { symbol: "Rheb", alias: "Ras homolog enriched in brain", pathway: "GRW", klass: "small GTPase", fn: "Direct activator of TORC1.", note: "Relieves Tsc1/2 inhibition when nutrients abound." },
        { symbol: "S6K", alias: "S6 kinase", pathway: "GRW", klass: "kinase", fn: "TORC1 target boosting ribosome biogenesis.", note: "Executes growth at the translation level." },
        { symbol: "slif", alias: "slimfast", pathway: "GRW", klass: "AA transporter", fn: "Amino-acid transporter in the fat body.", note: "Fat-body nutrient sensor that signals systemic growth." },
        { symbol: "Myc", alias: "dMyc", pathway: "GRW", klass: "bHLH TF", fn: "Global amplifier of ribosome & protein synthesis.", note: "Reads TOR activity into biosynthetic output." },
        { symbol: "Dilp8", alias: "relaxin-like peptide", pathway: "GRW", klass: "checkpoint hormone", fn: "Imaginal-disc damage signal; delays pupariation.", note: "The quality-control siren: injured discs buy time before metamorphosis." },
        { symbol: "Lgr3", alias: "leucine-rich GPCR 3", pathway: "GRW", klass: "GPCR", fn: "Receptor for Dilp8 in the CNS.", note: "Relays the disc-damage checkpoint to ecdysone timing." },
      ],
    },
    {
      title: "The molting pulses & their cascade",
      blurb: "Each molt is a dress rehearsal for metamorphosis: a 20E pulse fires the same early→late nuclear-receptor cascade that will run the pupal show.",
      genes: [
        { symbol: "EcR-B1", alias: "EcR isoform B1", pathway: "ECD", klass: "nuclear receptor", fn: "Dominant larval receptor isoform.", note: "EcR-B1 drives proliferative/pulse responses in larval tissues." },
        { symbol: "usp", alias: "ultraspiracle", pathway: "ECD", klass: "RXR partner", fn: "EcR heterodimer partner.", note: "Permissive partner at every pulse of life." },
        { symbol: "E74", alias: "E74A / E74B", pathway: "ECD", klass: "early · ETS", fn: "Early-response ETS factors.", note: "Fired at each larval molt; isoform switch B→A marks pulse amplitude." },
        { symbol: "E75", alias: "E75A/B/C", pathway: "ECD", klass: "early · NR", fn: "Early nuclear-receptor gene; feedback modulator.", note: "Three isoforms fine-tune each larval pulse." },
        { symbol: "Br-C", alias: "Broad-Complex Z1–Z4", pathway: "ECD", klass: "early · Zn-finger", fn: "Specifies 'molt' vs 'metamorphosis' outcomes.", note: "Broad is REQUIRED for larval molts — status quo between pulses." },
        { symbol: "E78", alias: "Ecdysone-induced 78", pathway: "ECD", klass: "orphan NR", fn: "Early-late nuclear receptor.", note: "Represses Distal-less in discs; prefigures pupal remodeling." },
        { symbol: "HR3", alias: "DHR3", pathway: "ECD", klass: "late · NR", fn: "Late gene; represses βFTZ-F1.", note: "Pulse-timer repressor — turns the competence window OFF." },
        { symbol: "HR4", alias: "DHR4", pathway: "ECD", klass: "late-late · NR", fn: "Orphan NR; represses HR3.", note: "De-represses competence: HR4 ⊣ HR3 ⊣ βFTZ-F1 timer loop." },
        { symbol: "ftz-f1", alias: "βFTZ-F1", pathway: "ECD", klass: "competence factor", fn: "Orphan NR priming the next pulse response.", note: "Expressed only in the inter-pulse window — the 'competence factor'." },
        { symbol: "Cyp18a1", alias: "ecdysone oxidase", pathway: "ECD", klass: "CYP450", fn: "Inactivates 20E by 26-hydroxylation.", note: "Terminates each pulse; mutants die with hormone overload." },
        { symbol: "Imp-L1", alias: "Ecdysone-induced 1", pathway: "ECD", klass: "IGFBP-like", fn: "Secreted insulin antagonist; ecdysone-induced.", note: "Pulses transiently brake growth — hormone crosstalk." },
      ],
    },
    {
      title: "Brain → prothoracic gland timing axis",
      blurb: "The brain decides WHEN: PTTH neurons fire onto the prothoracic gland through the Torso RTK (the embryo's terminal receptor, reused), and the Halloween genes manufacture each pulse.",
      genes: [
        { symbol: "ptth", alias: "prothoracicotropic hormone", pathway: "ECD", klass: "peptide hormone", fn: "Brain neuropeptide triggering ecdysone synthesis.", note: "Two PTTH neurons gate every pulse; light and size feed in here." },
        { symbol: "tor", alias: "torso (PTTH receptor)", pathway: "ECD", klass: "RTK", fn: "PTTH receptor on prothoracic gland cells.", note: "The embryo's patterning receptor reborn as a hormone receptor." },
        { symbol: "Ras85D", alias: "Ras", pathway: "ECD", klass: "small GTPase", fn: "Ras/MAPK cascade downstream of Torso.", note: "Transduces PTTH into a phosphorylation wave." },
        { symbol: "rl", alias: "rolled / ERK", pathway: "ECD", klass: "MAPK", fn: "MAP kinase executing PTTH signal.", note: "Activates Halloween-gene transcription in the gland." },
        { symbol: "spk / spok", alias: "spook / spookier", pathway: "ECD", klass: "Halloween", fn: "C7-desaturase of ecdysone biosynthesis.", note: "Rate-limiting 'black box' step; larval expression in the gland." },
        { symbol: "dib", alias: "disembodied", pathway: "ECD", klass: "Halloween", fn: "C22-hydroxylase.", note: "Gland enzyme of each larval pulse." },
        { symbol: "phm", alias: "phantom", pathway: "ECD", klass: "Halloween", fn: "C25-hydroxylase.", note: "PTTH rapidly induces phm transcription." },
        { symbol: "sad", alias: "shadow", pathway: "ECD", klass: "Halloween", fn: "C2-hydroxylase finishing ecdysone.", note: "Completes hormone synthesis in the gland." },
        { symbol: "shd", alias: "shade", pathway: "ECD", klass: "Cyp314a1", fn: "Peripheral ecdysone → 20E conversion.", note: "Target tissues activate their own hormone locally." },
      ],
    },
    {
      title: "Status-quo guardians · juvenile hormone",
      blurb: "As long as JH flows, Met/Tai keep Kr-h1 high and Chinmo up — the adult programme is silenced. Metamorphosis is, first of all, the ABSENCE of this signal.",
      genes: [
        { symbol: "Met", alias: "Methoprene-tolerant", pathway: "JH", klass: "bHLH-PAS receptor", fn: "JH receptor.", note: "Binds JH, enters nucleus with Tai." },
        { symbol: "tai", alias: "taiman / SRC", pathway: "JH", klass: "coactivator", fn: "Met coactivator.", note: "Met/Tai directly activate Kr-h1." },
        { symbol: "Kr-h1", alias: "Krüppel-homolog 1", pathway: "JH", klass: "zinc-finger TF", fn: "Represses E93 and adult genes.", note: "The gatekeeper: while Kr-h1 is on, metamorphosis cannot start." },
        { symbol: "Jhamt", alias: "JH acid O-methyltransferase", pathway: "JH", klass: "biosynthetic enzyme", fn: "Final step of JH III synthesis in corpus allatum.", note: "Gland enzyme that keeps larval JH titers high." },
        { symbol: "Jheh1", alias: "JH epoxide hydrolase 1", pathway: "JH", klass: "degradative enzyme", fn: "Degrades JH.", note: "Upregulated at wandering — one of the knives that cuts JH." },
        { symbol: "chinmo", alias: "chronologically inappropriate morphogenesis", pathway: "JH", klass: "BTB-zinc-finger", fn: "Maintains larval identity in tissues & neuroblasts.", note: "Kept high by JH→Kr-h1; must fall for adult fates." },
      ],
    },
    {
      title: "Imaginal discs · adult organs in waiting",
      blurb: "Sac-like primordia of wing, leg, eye and antenna pattern themselves with Dpp, Wg, Hh and Notch — the embryo's toolkit, redeployed at miniature scale.",
      genes: [
        { symbol: "dpp", alias: "decapentaplegic (BMP)", pathway: "SEG", klass: "TGFβ ligand", fn: "BMP morphogen organizing the wing disc.", note: "Forms the D/V organizer gradient in every disc." },
        { symbol: "tkv", alias: "thick veins", pathway: "SEG", klass: "BMP receptor", fn: "Type-I Dpp receptor.", note: "Reads the Dpp gradient in disc cells." },
        { symbol: "Mad", alias: "Mothers against dpp", pathway: "SEG", klass: "Smad", fn: "Signal transducer for Dpp.", note: "Phospho-Mad gradient = morphogen readout." },
        { symbol: "brk", alias: "brinker", pathway: "SEG", klass: "Dpp antagonist", fn: "Dpp-repressed repressor; defines low-Dpp zones.", note: "Double-negative logic sharpening Dpp responses." },
        { symbol: "wg", alias: "wingless", pathway: "SEG", klass: "Wnt ligand", fn: "D/V boundary signal in the wing disc.", note: "With Dpp, defines where the wing blade forms." },
        { symbol: "hh", alias: "hedgehog", pathway: "SEG", klass: "secreted ligand", fn: "A/P compartment signal.", note: "Posterior cells signal anterior via Hh." },
        { symbol: "ptc", alias: "patched", pathway: "SEG", klass: "Hh receptor", fn: "Hh receptor marking the A/P border.", note: "Expressed in a stripe at the compartment boundary." },
        { symbol: "N", alias: "Notch", pathway: "SEG", klass: "receptor", fn: "Notch receptor; lateral inhibition & boundary formation.", note: "DV boundary cells require Notch for wg activation." },
        { symbol: "Dl", alias: "Delta", pathway: "SEG", klass: "Notch ligand", fn: "Notch ligand.", note: "Proneural clusters use Dl for sensory-bristle spacing." },
        { symbol: "vg", alias: "vestigial", pathway: "SEG", klass: "selector co-factor", fn: "Wing selector gene (with Scalloped).", note: "vg = 'make wing tissue'; null → wingless flies." },
        { symbol: "sd", alias: "scalloped", pathway: "SEG", klass: "TEA-domain TF", fn: "Vg's DNA-binding partner.", note: "Vg/Sd complex turns on the entire wing programme." },
        { symbol: "Dll", alias: "Distal-less", pathway: "SEG", klass: "homeodomain TF", fn: "Distal limb selector.", note: "Specifies the far ends of legs and antennae." },
        { symbol: "hth", alias: "homothorax", pathway: "SEG", klass: "Meis cofactor", fn: "Proximal limb identity (with Exd).", note: "Proximal cells: hth ON, Dll OFF — a mutually exclusive code." },
        { symbol: "exd", alias: "extradenticle", pathway: "SEG", klass: "Pbx cofactor", fn: "Nuclear import partner for Hox & Hth.", note: "Shuttles Hox proteins into nuclei where needed." },
        { symbol: "ey", alias: "eyeless / Pax6", pathway: "SEG", klass: "master regulator", fn: "Pax6 eye selector gene.", note: "Ectopic ey grows eyes on legs — the 'master control' classic." },
        { symbol: "apt", alias: "apterous", pathway: "SEG", klass: "LIM-homeodomain", fn: "Dorsal compartment selector of the wing.", note: "apt defines dorsal wing identity and the D/V organizer." },
        { symbol: "nub", alias: "nubbin", pathway: "SEG", klass: "POU-domain TF", fn: "Wing-blade specification.", note: "Required for wing pouch growth." },
        { symbol: "sal", alias: "spalt", pathway: "SEG", klass: "zinc-finger TF", fn: "Dpp target defining central wing territory.", note: "Marks the high-Dpp wing field." },
        { symbol: "omb", alias: "optomotor-blind", pathway: "SEG", klass: "T-box TF", fn: "Broad Dpp-response domain gene.", note: "Intermediate Dpp zone selector." },
        { symbol: "Egfr", alias: "EGF receptor", pathway: "SEG", klass: "RTK", fn: "EGFR pathway; vein patterning.", note: "Ras/MAPK via EGFR decides wing-vein vs intervein." },
        { symbol: "spi", alias: "spitz", pathway: "SEG", klass: "TGFα ligand", fn: "Main EGFR ligand.", note: "Processed by Rhomboid for vein induction." },
        { symbol: "rho", alias: "rhomboid", pathway: "SEG", klass: "intramembrane protease", fn: "Cleaves/activates Spitz.", note: "Rate-limits EGFR signaling in veins." },
      ],
    },
    {
      title: "Identity maintenance",
      blurb: "Polycomb and Trithorax keep the embryonic Hox decisions stable through thousands of larval cell divisions.",
      genes: [
        { symbol: "Pc", alias: "Polycomb", pathway: "HOX", klass: "Polycomb-group", fn: "PRC1-mediated Hox silencing.", note: "Keeps wing discs Antp-ON / Abd-B-OFF through growth." },
        { symbol: "trx", alias: "trithorax", pathway: "HOX", klass: "Trithorax-group", fn: "H3K4me3 Hox activation.", note: "Counterweight to Pc in every dividing cell." },
        { symbol: "E(z)", alias: "Enhancer of zeste", pathway: "HOX", klass: "PRC2 catalytic", fn: "H3K27 methyltransferase of PRC2.", note: "Writes the repressive mark Pc reads." },
        { symbol: "Ubx", alias: "Ultrabithorax", pathway: "HOX", klass: "Hox", fn: "Haltere vs wing decision in T3 disc.", note: "Ubx in the haltere disc suppresses wing-growth genes." },
        { symbol: "Abd-B", alias: "Abdominal-B", pathway: "HOX", klass: "Hox", fn: "Genital disc identity.", note: "Abd-B patterns the genital imaginal disc." },
      ],
    },
  ],
};

/* ================================================================
   STAGE 03 — PUPA  (~120 h AEL – eclosion)
   ================================================================ */
const pupa: Stage = {
  key: "pupa",
  num: "03",
  name: "Pupa",
  latin: "Prepupa → pupa",
  window: "120 – 216 h AEL",
  duration: "≈ 4 days",
  summary:
    "The great demolition and rebuild. Juvenile hormone crashes; a huge prepupal pulse fires the early genes and βFTZ-F1; a second, bigger pupal pulse — with no Kr-h1 to stop it — switches on E93, the master of the adult programme. Larval tissues are dismantled by apoptosis and autophagy while imaginal discs evert, fold and fuse into a fly.",
  ecd: 100,
  jh: 6,
  accent: "#6ef0a3",
  groups: [
    {
      title: "Prepupal pulse · ~0–12 h APF",
      blurb: "Wandering larvae pupariate as 20E floods. The receptor switches isoform (EcR-B1 → EcR-A) and the early genes fire exactly as they did at larval molts — but the absence of JH changes everything.",
      genes: [
        { symbol: "EcR-A", alias: "EcR isoform A", pathway: "ECD", klass: "nuclear receptor", fn: "Receptor isoform rising in imaginal tissues.", note: "The B1→A switch reprograms tissues for metamorphic responses." },
        { symbol: "usp", alias: "ultraspiracle", pathway: "ECD", klass: "RXR partner", fn: "EcR heterodimer partner.", note: "Constant partner through both pupal pulses." },
        { symbol: "E74A", alias: "E74 isoform A", pathway: "ECD", klass: "early · ETS", fn: "Early gene; required for pupariation.", note: "The prepupal pulse signature: E74B falls, E74A rises." },
        { symbol: "E75A", alias: "E75 isoform A", pathway: "ECD", klass: "early · NR", fn: "Early nuclear receptor.", note: "Peaks within 1–2 h of the prepupal pulse." },
        { symbol: "Br-C", alias: "Broad-Complex Z1/Z2", pathway: "ECD", klass: "early · Zn-finger", fn: "Isoform switch Z3/Z4 → Z1/Z2 marks pupal commitment.", note: "Broad is now running a METAMORPHIC, not larval, programme." },
        { symbol: "E78", alias: "Ecdysone-induced 78", pathway: "ECD", klass: "orphan NR", fn: "Early-late NR; represses Dll in discs.", note: "Prepares discs for eversion by cutting larval programs." },
        { symbol: "ftz-f1", alias: "βFTZ-F1", pathway: "ECD", klass: "competence factor", fn: "Mid-prepupal competence factor.", note: "THE key interval gene: without βFTZ-F1 the pupal pulse cannot fire its late targets." },
        { symbol: "Imp-L1 / Imp-L2", alias: "Ecdysone-induced 1 & 2", pathway: "ECD", klass: "IGFBP-like", fn: "Insulin antagonists induced by the pulse.", note: "Collapse larval growth signaling during remodeling." },
        { symbol: "shd", alias: "shade", pathway: "ECD", klass: "Cyp314a1", fn: "Local ecdysone → 20E in discs.", note: "Discs locally activate hormone for eversion." },
        { symbol: "Cyp18a1", alias: "ecdysone oxidase", pathway: "ECD", klass: "CYP450", fn: "Pulse termination.", note: "Sharpens the prepupal pulse; sets the βFTZ-F1 window." },
      ],
    },
    {
      title: "Pupal pulse & the timer loop · ~12–48 h APF",
      blurb: "12 h after puparium formation a second 20E peak arrives. Through the βFTZ-F1 window it fires the late genes — and with Kr-h1 gone, E93 finally switches on the adult programme.",
      genes: [
        { symbol: "E93", alias: "Ecdysone-induced 93", pathway: "ECD", klass: "master selector · HTH", fn: "THE master regulator of adult metamorphosis.", note: "E93 ON = adult programme + larval tissue death. Misexpress it in a larva and it pupates its tissues precociously." },
        { symbol: "HR3", alias: "DHR3", pathway: "ECD", klass: "late · NR", fn: "Late gene; represses βFTZ-F1 to close the window.", note: "Timer: HR3 turns competence OFF after the pulse." },
        { symbol: "HR4", alias: "DHR4", pathway: "ECD", klass: "late-late · NR", fn: "Represses HR3, delaying window closure.", note: "HR4 ⊣ HR3 ⊣ βFTZ-F1 — a three-gene hourglass timing the pulse." },
        { symbol: "E74", alias: "E74", pathway: "ECD", klass: "early · ETS", fn: "Fired again by the pupal pulse.", note: "Required for correct disc morphogenesis." },
        { symbol: "E75", alias: "E75", pathway: "ECD", klass: "early · NR", fn: "Pupal-pulse early gene.", note: "Modulates pulse amplitude responses." },
        { symbol: "let-7", alias: "lethal-7 microRNA", pathway: "ECD", klass: "microRNA", fn: "Developmental timer miRNA, rises at pupal stages.", note: "Represses chinmo and Abrupt — post-transcriptional metamorphosis timer." },
        { symbol: "mir-125", alias: "microRNA-125", pathway: "ECD", klass: "microRNA", fn: "let-7-cluster partner miRNA.", note: "Co-expressed timer tuning target thresholds." },
        { symbol: "Abrupt", alias: "ab / BTB-ZF", pathway: "ECD", klass: "BTB zinc-finger", fn: "let-7 target; larval wing fate repressor.", note: "let-7-mediated Abrupt fall reshapes the wing margin." },
      ],
    },
    {
      title: "The hormone withdrawal",
      blurb: "Corpus allatum JH output collapses; JH-esterases/hydrolases mop up the rest. Kr-h1 — the lock on E93 — is the last gene to fall silent.",
      genes: [
        { symbol: "Jheh1-3", alias: "JH epoxide hydrolases", pathway: "JH", klass: "degradative enzymes", fn: "Degrade circulating JH.", note: "Enzymatic demolition of the status-quo signal." },
        { symbol: "Jhamt", alias: "JH methyltransferase", pathway: "JH", klass: "biosynthetic enzyme", fn: "JH synthesis — now shut down.", note: "Corpus allatum switches from making to stopping JH." },
        { symbol: "Met", alias: "Methoprene-tolerant", pathway: "JH", klass: "bHLH-PAS receptor", fn: "Receptor without ligand.", note: "Without JH, Met/Tai cannot activate Kr-h1." },
        { symbol: "tai", alias: "taiman", pathway: "JH", klass: "coactivator", fn: "Idle coactivator.", note: "The complex falls apart." },
        { symbol: "Kr-h1", alias: "Krüppel-homolog 1", pathway: "JH", klass: "zinc-finger TF", fn: "The silenced gatekeeper.", note: "Its disappearance is the single permission E93 needs." },
        { symbol: "chinmo", alias: "chronologically inappropriate morphogenesis", pathway: "JH", klass: "BTB zinc-finger", fn: "Larval identity factor — falling now.", note: "let-7 and the JH crash strip chinmo from tissues & neuroblasts." },
      ],
    },
    {
      title: "Histolysis · the demolition crew",
      blurb: "Larval midgut, salivary glands, muscles and fat body are dismantled by E93-licensed apoptosis and autophagy — building blocks are recycled for adult construction.",
      genes: [
        { symbol: "rpr", alias: "reaper", pathway: "LYS", klass: "RHG pro-apoptotic", fn: "Antagonizes DIAP1 to unleash caspases.", note: "E93 activates rpr to doom salivary glands." },
        { symbol: "hid", alias: "head involution defective", pathway: "LYS", klass: "RHG pro-apoptotic", fn: "DIAP1 antagonist.", note: "Co-activator of the death programme in larval tissues." },
        { symbol: "grim", alias: "grim", pathway: "LYS", klass: "RHG pro-apoptotic", fn: "Third RHG death gene.", note: "Completes the rpr/hid/grim death locus on 3R." },
        { symbol: "Dronc", alias: "caspase-9 ortholog", pathway: "LYS", klass: "initiator caspase", fn: "Initiator caspase of the apoptosome.", note: "Activated by Ark; executes tissue death." },
        { symbol: "Drice", alias: "caspase-3 ortholog", pathway: "LYS", klass: "effector caspase", fn: "Effector caspase.", note: "Cleaves substrates during histolysis." },
        { symbol: "Dcp-1", alias: "caspase-7 ortholog", pathway: "LYS", klass: "effector caspase", fn: "Effector caspase with autophagy links.", note: "Bridges apoptosis and autophagic clearance." },
        { symbol: "Ark", alias: "Apaf-1-related killer", pathway: "LYS", klass: "apoptosome", fn: "Apoptosome scaffold activating Dronc.", note: "Mitochondrial death pathway hub." },
        { symbol: "Atg1", alias: "ULK1 kinase", pathway: "LYS", klass: "autophagy kinase", fn: "Autophagy-initiating kinase.", note: "E93/20E induce Atg1 for salivary-gland autophagic death." },
        { symbol: "Atg5", alias: "autophagy-related 5", pathway: "LYS", klass: "autophagy", fn: "Autophagosome elongation (with Atg12).", note: "Required for larval midgut removal." },
        { symbol: "Atg8a", alias: "LC3 ortholog", pathway: "LYS", klass: "autophagy marker", fn: "Autophagosome membrane protein.", note: "The visible readout of pupal autophagy." },
        { symbol: "Atg18a", alias: "WIPI ortholog", pathway: "LYS", klass: "autophagy", fn: "PI3P-binding autophagy factor.", note: "Fat-body remodeling requires Atg18a." },
        { symbol: "Mmp1 / Mmp2", alias: "matrix metalloproteinases", pathway: "LYS", klass: "protease", fn: "Degrade extracellular matrix.", note: "Let the fat body disperse and discs invade new territories." },
      ],
    },
    {
      title: "Disc eversion & construction",
      blurb: "Within hours the discs evert — wing pouches inflate, legs telescope out, eyes roll into place — then adhesion molecules and chitin sculpt the adult cuticle scaffold.",
      genes: [
        { symbol: "vg / sd", alias: "vestigial / scalloped", pathway: "SEG", klass: "selector pair", fn: "Wing blade selector.", note: "Vg/Sd drive wing expansion after eversion." },
        { symbol: "Dll", alias: "Distal-less", pathway: "SEG", klass: "homeodomain TF", fn: "Distal leg/antenna selector.", note: "E78 first repressed Dll — now Dll rebuilds distal legs." },
        { symbol: "hth / exd", alias: "homothorax / extradenticle", pathway: "SEG", klass: "proximal code", fn: "Proximal limb identity.", note: "Proximal-distal axis re-established in the everted leg." },
        { symbol: "ey", alias: "eyeless", pathway: "SEG", klass: "Pax6", fn: "Eye selector.", note: "Retinal differentiation races to finish before eclosion." },
        { symbol: "Antp", alias: "Antennapedia", pathway: "SEG", klass: "Hox", fn: "T2 leg identity.", note: "Maintained through disc morphogenesis." },
        { symbol: "dpp / wg", alias: "decapentaplegic / wingless", pathway: "SEG", klass: "morphogens", fn: "Final vein & margin patterning.", note: "Morphogens re-deployed at adult scale." },
        { symbol: "Egfr / spi", alias: "EGFR / spitz", pathway: "SEG", klass: "RTK pathway", fn: "Adult vein specification.", note: "Vein vs intervein fates locked in." },
        { symbol: "shg", alias: "shotgun / E-cadherin", pathway: "SEG", klass: "adhesion", fn: "Adherens junctions.", note: "Everts and seals the new epithelia." },
        { symbol: "arm", alias: "armadillo", pathway: "SEG", klass: "catenin", fn: "Junction + Wnt effector.", note: "Structural glue of the new cuticle epithelium." },
        { symbol: "mys", alias: "myospheroid / βPS integrin", pathway: "SEG", klass: "integrin", fn: "Basal adhesion; muscle attachment.", note: "Links epidermis to the rebuilding muscle scaffold." },
        { symbol: "kkv", alias: "krotzkopf verkehrt", pathway: "SEG", klass: "chitin synthase", fn: "Chitin synthase of the epidermis.", note: "Lays chitin into the new adult cuticle." },
        { symbol: "Serp / verm", alias: "serpentine / vermid", pathway: "SEG", klass: "chitin deacetylase", fn: "Modify chitin for cuticle organization.", note: "Shape the chitin scaffold into organized procuticle." },
        { symbol: "dp", alias: "dumpy", pathway: "SEG", klass: "apical ECM", fn: "Giant apical ECM anchor.", note: "Anchors the cuticle to shape wings and trachea." },
      ],
    },
    {
      title: "Neuronal remodeling",
      blurb: "The CNS is rebuilt while the animal lives: larval neurons prune their axons, adult-specific neurons are born from reactivated neuroblasts, circuits rewire.",
      genes: [
        { symbol: "EcR-B1", alias: "EcR isoform B1", pathway: "ECL", klass: "nuclear receptor", fn: "Neuronal receptor required for axon pruning.", note: "EcR-B1 in mushroom-body γ neurons licenses pruning." },
        { symbol: "Sox14", alias: "Sox14 TF", pathway: "ECL", klass: "HMG-box TF", fn: "E93/EcR target driving pruning.", note: "Turns the pruning programme on in γ neurons." },
        { symbol: "Mical", alias: "Mical monooxygenase", pathway: "ECL", klass: "cytoskeleton oxidase", fn: "Oxidizes actin to dismantle cytoskeleton.", note: "Severs the axon cytoskeleton for pruning." },
        { symbol: "Imp / Syp", alias: "IGF-II mRNA-binding / Syncrip", pathway: "ECL", klass: "RNA-binding timer", fn: "Neuroblast temporal identity switch (Imp → Syp).", note: "Times larval vs adult neuron production in each neuroblast lineage." },
        { symbol: "chinmo", alias: "chronologically inappropriate morphogenesis", pathway: "ECL", klass: "BTB zinc-finger", fn: "Larval neuronal identity; silenced by let-7.", note: "Persisting chinmo in adults = 'inappropriate morphogenesis' — the namesake." },
      ],
    },
  ],
};

/* ================================================================
   STAGE 04 — ADULT  (pharate adult → eclosion → maturation)
   ================================================================ */
const adult: Stage = {
  key: "adult",
  num: "04",
  name: "Adult",
  latin: "Pharate adult → imago",
  window: "≈ 216 h AEL → eclosion",
  duration: "eclosion at dawn, ~day 10",
  summary:
    "Inside the puparium a fully formed 'pharate' fly waits. A peptide-hormone relay — corazonin, ETH, EH, CCAP — executes the hatching choreography under circadian control at dawn. Cuticle is tanned, wings are inflated by bursicon, and within hours the reproductive programme (Sxl→dsx, yolk proteins, ecdysone from the ovary) opens the next generation's story.",
  ecd: 24,
  jh: 18,
  accent: "#c4a9ff",
  groups: [
    {
      title: "The eclosion relay · peptide choreography",
      blurb: "Four peptides fire in sequence to hatch the fly: corazonin primes, ETH triggers, EH commands, CCAP cleans up — all gated by the circadian clock to dawn.",
      genes: [
        { symbol: "ETH", alias: "ecdysis-triggering hormone", pathway: "ECL", klass: "peptide hormone", fn: "From Inka cells; triggers ecdysis behavior.", note: "20E induces ETH in Inka cells; ETH fires the behavioral cascade." },
        { symbol: "InR / ETHR", alias: "ETH receptor (Inokinin)", pathway: "ECL", klass: "GPCR", fn: "Receptor for ETH on CNS neurons.", note: "Confusingly named 'InR' at FlyBase — NOT the insulin receptor." },
        { symbol: "Eh", alias: "eclosion hormone", pathway: "ECL", klass: "peptide hormone", fn: "Brain peptide initiating the eclosion cascade.", note: "EH neurons also time the ETH release — a two-way relay." },
        { symbol: "Crz", alias: "corazonin", pathway: "ECL", klass: "peptide hormone", fn: "Initiates pre-ecdysis motor program.", note: "First peptide of the sequence; ~1 h before ecdysis." },
        { symbol: "CrzR", alias: "corazonin receptor", pathway: "ECL", klass: "GPCR", fn: "Corazonin receptor in the CNS.", note: "Crz→CrzR activates ETH release." },
        { symbol: "Ccap", alias: "crustacean cardioactive peptide", pathway: "ECL", klass: "peptide hormone", fn: "Post-ecdysis consolidation; wing expansion.", note: "Fires after the adult emerges to stabilize behavior." },
        { symbol: "CcapR", alias: "CCAP receptor", pathway: "ECL", klass: "GPCR", fn: "CCAP receptor.", note: "Mutants ecdyse but stall mid-behavior." },
        { symbol: "per", alias: "period", pathway: "ECL", klass: "clock gene", fn: "Core circadian oscillator.", note: "Gates eclosion to the pre-dawn window." },
        { symbol: "tim", alias: "timeless", pathway: "ECL", klass: "clock gene", fn: "PER's partner; light-sensitive.", note: "Light resets the clock through TIM degradation." },
        { symbol: "Clk", alias: "Clock", pathway: "ECL", klass: "bHLH-PAS TF", fn: "Activates per/tim transcription.", note: "Half of the oscillator's positive limb." },
        { symbol: "cyc", alias: "cycle", pathway: "ECL", klass: "bHLH-PAS TF", fn: "CLK's dimer partner.", note: "CLK/CYC drive the daily transcription wave." },
        { symbol: "cry", alias: "cryptochrome", pathway: "ECL", klass: "photoreceptor", fn: "Blue-light photoreceptor of clock cells.", note: "Synchronizes eclosion timing to light cycles." },
      ],
    },
    {
      title: "Cuticle tanning & wing expansion",
      blurb: "A soft, pale new adult hardens and darkens within hours: dopamine chemistry tans the cuticle while bursicon inflates and fixes the wings.",
      genes: [
        { symbol: "Ple", alias: "Pleiopteric · tyrosine hydroxylase", pathway: "DIF", klass: "enzyme", fn: "Tyrosine → DOPA; first tanning step.", note: "ple mutants die unable to tan their cuticle." },
        { symbol: "Ddc", alias: "DOPA decarboxylase", pathway: "DIF", klass: "enzyme", fn: "DOPA → dopamine.", note: "Shared by neural and cuticular dopamine pools." },
        { symbol: "ebony", alias: "ebony", pathway: "DIF", klass: "NBAD synthase", fn: "Dopamine → NBAD (light pigment).", note: "ebony mutants are dark — NBAD makes pale cuticle." },
        { symbol: "tan", alias: "tan", pathway: "DIF", klass: "NBAD hydrolase", fn: "NBAD → dopamine (dark pigment).", note: "Counterweight to ebony; sets pigment balance." },
        { symbol: "yellow", alias: "yellow", pathway: "DIF", klass: "melanin enzyme", fn: "Required for black melanin deposition.", note: "The classic sex-comb/pigmentation locus — also a behavior gene." },
        { symbol: "Lac2", alias: "laccase 2", pathway: "DIF", klass: "phenoloxidase", fn: "Quinone cross-linking = sclerotization.", note: "Hardens the cuticle chemically; Lac2 mutants stay soft." },
        { symbol: "kkv", alias: "krotzkopf verkehrt", pathway: "DIF", klass: "chitin synthase", fn: "Chitin synthesis in adult cuticle.", note: "Continues laying chitin into the adult exoskeleton." },
        { symbol: "burs", alias: "bursicon α", pathway: "DIF", klass: "glycoprotein hormone", fn: "Wing-expansion & tanning hormone (with pburs).", note: "Released after eclosion to inflate wings." },
        { symbol: "pburs", alias: "bursicon β", pathway: "DIF", klass: "glycoprotein hormone", fn: "Heterodimer partner of bursicon.", note: "burs/pburs form the active cystine-knot hormone." },
        { symbol: "rk", alias: "rickets", pathway: "DIF", klass: "LRR GPCR", fn: "Bursicon receptor.", note: "rk mutants emerge with wrinkled, unexpanded wings." },
      ],
    },
    {
      title: "Reproductive maturation",
      blurb: "Hours after eclosion the sex-determination cascade (Sxl→tra→dsx/fru) finishes building dimorphic circuits, the fat body starts yolk proteins, and the ovary becomes a new ecdysone factory for oogenesis.",
      genes: [
        { symbol: "Sxl", alias: "Sex-lethal", pathway: "DIF", klass: "RNA-binding master", fn: "Top of the sex-determination cascade.", note: "ON in females, OFF in males — set from the embryo, executed now." },
        { symbol: "tra / tra-2", alias: "transformer", pathway: "DIF", klass: "splicing factor", fn: "Female-specific splicing regulators.", note: "Route dsx pre-mRNA to the female isoform." },
        { symbol: "dsx", alias: "doublesex", pathway: "DIF", klass: "DM-domain TF", fn: "Terminal somatic sex selector (dsxF/dsxM).", note: "Scultps every sexually dimorphic tissue." },
        { symbol: "fru", alias: "fruitless", pathway: "DIF", klass: "BTB zinc-finger", fn: "Neural sex selector; courtship circuitry.", note: "fruM isoform builds the male courtship circuit." },
        { symbol: "Yp1/2/3", alias: "yolk proteins 1–3", pathway: "DIF", klass: "vitellogenins", fn: "Yolk protein precursors from fat body & follicle.", note: "Estrogen-like regulation; nutrition-gated vitellogenesis." },
        { symbol: "EcR", alias: "Ecdysone receptor", pathway: "DIF", klass: "nuclear receptor", fn: "Ovarian ecdysone signaling.", note: "Follicle cells now MAKE ecdysone (via shd/phm) for oogenesis." },
        { symbol: "usp", alias: "ultraspiracle", pathway: "DIF", klass: "RXR partner", fn: "EcR partner in follicle cells.", note: "Required for chorion gene amplification." },
        { symbol: "shd", alias: "shade", pathway: "DIF", klass: "Cyp314a1", fn: "Ovarian ecdysone activation.", note: "The ovary replaces the larval prothoracic gland." },
        { symbol: "Dilp6", alias: "insulin-like peptide 6", pathway: "GRW", klass: "peptide hormone", fn: "Glia-derived insulin for adult maturation.", note: "Drives post-eclosion growth of reproductive tissues." },
        { symbol: "Akh", alias: "adipokinetic hormone", pathway: "GRW", klass: "peptide hormone", fn: "Glucagon-like metabolic hormone.", note: "Mobilizes lipids for flight and reproduction." },
        { symbol: "Cyp18a1", alias: "ecdysone oxidase", pathway: "GRW", klass: "CYP450", fn: "Keeps adult 20E low outside the ovary.", note: "Prevents a stray metamorphic pulse in the imago." },
      ],
    },
  ],
};

export const STAGES: Stage[] = [egg, larva, pupa, adult];

/* ================================================================
   20E PULSE TIMELINE
   ================================================================ */
export interface Pulse {
  id: string;
  name: string;
  time: string;
  x: number;          // 0-1000 svg x
  h: number;          // curve peak height
  blurb: string;
  genes: { symbol: string; pathway: PathwayKey }[];
}

export const PULSES: Pulse[] = [
  {
    id: "embryo",
    name: "Embryonic pulse",
    time: "~6–10 h AEL",
    x: 95, h: 62,
    blurb: "The Halloween genes fire the first pulse. It drives embryonic cuticle deposition and, through EcR/early genes, prepares hatching. βFTZ-F1 already gates the response.",
    genes: [
      { symbol: "EcR/usp", pathway: "ECD" }, { symbol: "E74", pathway: "ECD" }, { symbol: "E75", pathway: "ECD" },
      { symbol: "Br-C", pathway: "ECD" }, { symbol: "βFTZ-F1", pathway: "ECD" }, { symbol: "shd", pathway: "ECD" },
      { symbol: "Halloween genes", pathway: "ECD" },
    ],
  },
  {
    id: "l1",
    name: "L1 → L2 molt",
    time: "~32 h AEL",
    x: 265, h: 46,
    blurb: "First larval molt. JH is high, so the same early genes (E74, E75, Br-C) produce another LARVAL cuticle — a status-quo molt. PTTH→Torso→MAPK times the gland.",
    genes: [
      { symbol: "ptth → tor", pathway: "ECD" }, { symbol: "E74B", pathway: "ECD" }, { symbol: "E75", pathway: "ECD" },
      { symbol: "Br-C", pathway: "ECD" }, { symbol: "Kr-h1 (high)", pathway: "JH" }, { symbol: "Cyp18a1", pathway: "ECD" },
    ],
  },
  {
    id: "l2",
    name: "L2 → L3 molt",
    time: "~56 h AEL",
    x: 360, h: 50,
    blurb: "Second status-quo molt. Identical cascade, identical outcome — because juvenile hormone is still high. These molts are dry runs for the metamorphic programme.",
    genes: [
      { symbol: "EcR-B1", pathway: "ECD" }, { symbol: "E74", pathway: "ECD" }, { symbol: "E75", pathway: "ECD" },
      { symbol: "Br-C", pathway: "ECD" }, { symbol: "HR3/HR4", pathway: "ECD" }, { symbol: "Kr-h1 (high)", pathway: "JH" },
    ],
  },
  {
    id: "prepupal",
    name: "Prepupal pulse",
    time: "~118–120 h AEL",
    x: 610, h: 150,
    blurb: "Critical weight reached, JH collapsing. A huge pulse triggers wandering → pupariation. Early genes fire (E74A, E75A, Br-C Z1/Z2, E78), then βFTZ-F1 opens the competence window mid-prepupa.",
    genes: [
      { symbol: "EcR-A switch", pathway: "ECD" }, { symbol: "E74A", pathway: "ECD" }, { symbol: "E75A", pathway: "ECD" },
      { symbol: "Br-C Z1/Z2", pathway: "ECD" }, { symbol: "E78", pathway: "ECD" }, { symbol: "βFTZ-F1", pathway: "ECD" },
      { symbol: "Imp-L1/2", pathway: "ECD" }, { symbol: "Jheh (JH↓)", pathway: "JH" },
    ],
  },
  {
    id: "pupal",
    name: "Pupal pulse",
    time: "~12 h APF",
    x: 735, h: 172,
    blurb: "THE metamorphic pulse. Through the βFTZ-F1 window, late genes fire (HR3, HR4) and — with Kr-h1 gone — E93 switches on. Adult programme begins; larval tissues are sentenced.",
    genes: [
      { symbol: "E93", pathway: "ECD" }, { symbol: "HR3", pathway: "ECD" }, { symbol: "HR4", pathway: "ECD" },
      { symbol: "E74/E75", pathway: "ECD" }, { symbol: "let-7/mir-125", pathway: "ECD" }, { symbol: "Kr-h1 (SILENT)", pathway: "JH" },
      { symbol: "rpr/hid/grim", pathway: "LYS" }, { symbol: "Atg1/8a", pathway: "LYS" },
    ],
  },
  {
    id: "adultp",
    name: "Adult pulses",
    time: "post-eclosion",
    x: 915, h: 38,
    blurb: "Small ecdysone pulses now come from the OVARY (follicle cells express shd/phm) and drive oogenesis & chorion formation. Cyp18a1 keeps systemic 20E low.",
    genes: [
      { symbol: "EcR/usp", pathway: "DIF" }, { symbol: "shd (ovary)", pathway: "DIF" }, { symbol: "Yp1-3", pathway: "DIF" },
      { symbol: "Cyp18a1", pathway: "GRW" }, { symbol: "ETH/EEH eclosion", pathway: "ECL" },
    ],
  },
];

/* ================================================================
   PUPAL TRANSCRIPTIONAL CASCADE
   ================================================================ */
export interface CascadeNode {
  id: string;
  label: string;
  sub?: string;
  pathway: PathwayKey;
  role: "signal" | "early" | "competence" | "late" | "selector" | "effector";
  desc: string;
}

export const CASCADE_LAYERS: { title: string; note: string; nodes: CascadeNode[] }[] = [
  {
    title: "SIGNAL",
    note: "20-hydroxyecdysone floods the hemolymph",
    nodes: [
      { id: "ecd", label: "20E pulse", sub: "prothoracic gland → PTTH/torso", pathway: "ECD", role: "signal", desc: "PTTH neurons fire onto the prothoracic gland's Torso RTK; Halloween genes manufacture the pulse; Shade converts it to active 20E in target tissues." },
      { id: "ecrusp", label: "EcR / USP", sub: "nuclear receptor dimer", pathway: "ECD", role: "signal", desc: "20E binding switches EcR/USP from repressor to activator at EcRE motifs (AGGTCA). Isoform switch EcR-B1 → EcR-A reprograms imaginal tissues." },
    ],
  },
  {
    title: "EARLY GENES",
    note: "direct targets, fired within 1–2 h, no protein synthesis needed",
    nodes: [
      { id: "e74a", label: "E74A", sub: "ETS factor", pathway: "ECD", role: "early", desc: "Early ETS transcription factor; E74B falls and E74A rises — an isoform switch encoding pulse amplitude." },
      { id: "e75a", label: "E75A", sub: "nuclear receptor", pathway: "ECD", role: "early", desc: "Early nuclear receptor; also binds heme and NO, coupling the pulse to metabolic state." },
      { id: "brc", label: "Br-C", sub: "Z1/Z2 isoforms", pathway: "ECD", role: "early", desc: "Broad-Complex isoform switch (Z3/Z4 → Z1/Z2) converts the pulse into a METAMORPHIC rather than larval response." },
      { id: "e78", label: "E78", sub: "orphan NR", pathway: "ECD", role: "early", desc: "Early-late orphan receptor; represses Distal-less in discs, pre-cutting larval limb programmes." },
    ],
  },
  {
    title: "COMPETENCE WINDOW",
    note: "the mid-prepupal interval that licenses the next response",
    nodes: [
      { id: "ftzf1", label: "βFTZ-F1", sub: "the competence factor", pathway: "JH", role: "competence", desc: "Orphan nuclear receptor expressed ONLY in the hormone-free interval. It poises late genes: without βFTZ-F1 the pupal pulse cannot activate HR3/HR4/E93 correctly. This is how one hormone produces stage-specific responses." },
    ],
  },
  {
    title: "LATE GENES",
    note: "require the βFTZ-F1 window; build the pulse timer",
    nodes: [
      { id: "hr3", label: "HR3 / DHR3", sub: "repressor", pathway: "ECD", role: "late", desc: "Late gene that represses βFTZ-F1 — closing the competence window and ending the pulse response." },
      { id: "hr4", label: "HR4 / DHR4", sub: "repressor of HR3", pathway: "ECD", role: "late", desc: "Late-late gene that represses HR3. HR4 ⊣ HR3 ⊣ βFTZ-F1 forms a three-gene hourglass measuring pulse timing." },
    ],
  },
  {
    title: "THE SELECTOR TOGGLE",
    note: "JH withdrawal meets the pupal pulse — the irreversible decision",
    nodes: [
      { id: "krh1", label: "Kr-h1", sub: "OFF — JH is gone", pathway: "JH", role: "selector", desc: "Throughout larval life JH→Met/Tai→Kr-h1 repressed E93. At the prepupal stage JH collapses, Jheh enzymes degrade the remainder, and Kr-h1 — the lock on metamorphosis — is silenced." },
      { id: "e93", label: "E93", sub: "ON — master of the adult", pathway: "ECD", role: "selector", desc: "Released from Kr-h1, the pupal pulse switches on E93. E93 is necessary AND sufficient for adult development: it activates adult genes, licenses histolysis, and defines 'metamorphosis' itself. Its discovery resolved the century-old question of what makes a larva become an adult." },
    ],
  },
  {
    title: "EFFECTORS",
    note: "demolition and construction run in parallel",
    nodes: [
      { id: "death", label: "rpr · hid · grim · Atg", sub: "histolysis", pathway: "LYS", role: "effector", desc: "E93 licenses larval tissue death: RHG genes activate Dronc/Drice caspases (salivary glands), while Atg1/Atg8a autophagy removes the midgut and remodels fat body." },
      { id: "adult", label: "Br-C targets · vg · Dll", sub: "adult construction", pathway: "ECD", role: "effector", desc: "The same pulse drives construction: discs evert, wing/leg selectors build adult organs, kkv lays adult cuticle, and neurons prune/re-wire under EcR-B1/Sox14." },
    ],
  },
];

/* ================================================================
   HORMONE SWITCH STATES
   ================================================================ */
export interface SwitchState {
  id: string;
  name: string;
  time: string;
  jh: number;
  ecd: number;
  headline: string;
  rows: { gene: string; state: "ON" | "OFF" | "FALLING" | "RISING"; note: string }[];
}

export const SWITCH_STATES: SwitchState[] = [
  {
    id: "larva",
    name: "Growing larva",
    time: "instars L1–L3",
    jh: 92, ecd: 45,
    headline: "JH dominates — every 20E pulse makes ANOTHER larva.",
    rows: [
      { gene: "JH (corpus allatum)", state: "ON", note: "Jhamt keeps JH III synthesis high between pulses." },
      { gene: "Met / Tai", state: "ON", note: "Liganded receptor complex enters nuclei." },
      { gene: "Kr-h1", state: "ON", note: "Directly represses E93 — the metamorphosis lock is closed." },
      { gene: "chinmo", state: "ON", note: "Larval identity factor maintained in tissues & neuroblasts." },
      { gene: "Br-C (Z3/Z4)", state: "ON", note: "Larval isoforms → status-quo molts." },
      { gene: "E93", state: "OFF", note: "Silenced by Kr-h1. The adult programme cannot start." },
    ],
  },
  {
    id: "wander",
    name: "Wandering L3",
    time: "~96–120 h AEL",
    jh: 25, ecd: 85,
    headline: "JH crashes — the prepupal pulse now means something different.",
    rows: [
      { gene: "Jheh / JH-esterases", state: "RISING", note: "Enzymes degrade the remaining juvenile hormone." },
      { gene: "Kr-h1", state: "FALLING", note: "Met/Tai lose their ligand; Kr-h1 transcription collapses." },
      { gene: "let-7 / mir-125", state: "RISING", note: "Timer miRNAs rise, repressing chinmo & Abrupt." },
      { gene: "chinmo", state: "FALLING", note: "Larval identity erodes tissue by tissue." },
      { gene: "βFTZ-F1", state: "RISING", note: "Mid-prepupa: the competence window opens." },
      { gene: "E93", state: "OFF", note: "Not yet — the pupal pulse hasn't fired." },
    ],
  },
  {
    id: "pupa",
    name: "Pupa → adult",
    time: "~12 h APF onward",
    jh: 3, ecd: 100,
    headline: "20E alone, through the βFTZ-F1 window — E93 switches ON.",
    rows: [
      { gene: "JH", state: "OFF", note: "Undetectable — the status-quo signal is gone." },
      { gene: "Kr-h1", state: "OFF", note: "The lock is open. Nothing represses E93 anymore." },
      { gene: "βFTZ-F1", state: "ON", note: "Poises late genes for the pupal pulse." },
      { gene: "E93", state: "ON", note: "Master selector fires: adult programme + larval tissue death." },
      { gene: "HR3 → HR4", state: "ON", note: "Timer loop measures the pulse, then closes the window." },
      { gene: "rpr · hid · Atg", state: "ON", note: "E93-licensed demolition of larval organs begins." },
    ],
  },
];

/* ================================================================
   RESEARCH GAPS — what is still unknown
   ================================================================ */
export interface Gap {
  id: number;
  tag: string;
  title: string;
  known: string;
  unknown: string;
  why: string;
}

export const GAPS: Gap[] = [
  {
    id: 1,
    tag: "CIS-REGULATION",
    title: "The enhancer grammar of a hormone pulse",
    known: "EcR/USP binds EcRE motifs (AGGTCA) and the early genes E74/E75/Br-C were mapped as direct targets decades ago.",
    unknown: "Why does the SAME pulse activate different gene sets in different cells and stages? The combinatorial code of EcRE + cofactor motifs, chromatin context and pioneer factors that makes a pulse 'readable' tissue-specifically is still not predictable. We cannot compute a pulse response from sequence.",
    why: "Without this grammar we can't predict how hormone therapies or insecticides rewire development.",
  },
  {
    id: 2,
    tag: "3D GENOME",
    title: "Chromosome topology across the pulses",
    known: "Pulse-responsive genes sit in developmental gene clusters (Eip clusters, the BX-C) and chromatin state changes during metamorphosis.",
    unknown: "High-resolution Hi-C / imaging time courses spanning prepupa → pupa barely exist. How TADs and enhancer-promoter loops re-wire between pulses — and whether the hormone itself remodels topology — is unmapped territory.",
    why: "Hormone response is 3D: the pulse may act by changing which enhancers can touch which genes.",
  },
  {
    id: 3,
    tag: "NON-CODING RNA",
    title: "The lncRNA layer nobody has read",
    known: "let-7/mir-125 act as pupal timers repressing chinmo & Abrupt; miR-14 modulates cell death; Bithorax non-coding RNAs are transcribed.",
    unknown: "Hundreds of metamorphosis-stage lncRNAs appear in transcriptomes but almost none are functionally tested. Which are noise, which are regulators, and whether they scaffold EcR complexes or chromatin modifiers is wide open.",
    why: "lncRNAs may be the missing tissue-specificity layer that problem #1 demands.",
  },
  {
    id: 4,
    tag: "SINGLE-CELL",
    title: "A continuous atlas is only beginning",
    known: "Embryo and wandering-L3 single-cell atlases exist; modERN and whole-fly atlases have started sampling metamorphosis.",
    unknown: "There is no continuous, all-tissue single-cell time course from wandering larva through pharate adult at 2–4 h resolution. Rare cells — the 2 PTTH neurons, handful of Inka cells, corpus allatum — are still invisible to atlases, and lineage tracing of remodeling neurons is sparse.",
    why: "The interesting decisions happen in rare cells the averages erase.",
  },
  {
    id: 5,
    tag: "TIMING",
    title: "What measures pulse duration?",
    known: "The HR4 ⊣ HR3 ⊣ βFTZ-F1 loop and Cyp18a1 shape pulse width; critical weight and Dilp8/Lgr3 checkpoint feed timing.",
    unknown: "No molecular 'stopwatch' is known. How cells measure how LONG 20E has been present — versus how much — and how the βFTZ-F1 window gets its precise length are unresolved. A quantitative timer model linking pulse shape to fate outcome does not exist.",
    why: "Pulse duration, not just amplitude, determines molt vs metamorphosis.",
  },
  {
    id: 6,
    tag: "EVOLUTION",
    title: "Where did the pupa come from?",
    known: "Holometaboly evolved once; Kr-h1, Br-C and E93 are co-opted across insects; hemimetabolous RNAi studies (Oncopeltus, Blattodea) shift nymphs toward adult traits.",
    unknown: "Was the pupal stage a suppressed final nymphal instar, or a novel intercalated stage? Which regulatory changes first uncoupled E93 from immediate adult development — creating a hidden transformation inside a case — remains one of entomology's deepest open questions, hotly debated with 2023–2025 data still contradictory.",
    why: "The pupa is why beetles, flies and butterflies dominate the planet.",
  },
  {
    id: 7,
    tag: "METABOLISM",
    title: "The metabolic rewiring map",
    known: "Fat body lipolysis, amino-acid recycling and Imp-L1/2 insulin antagonism accompany the pulses; 20E directly regulates some metabolic enzymes.",
    unknown: "Tissue-resolved metabolomics time courses across metamorphosis are missing. How the hormone coordinates the switch from growth metabolism to demolition/recycling metabolism — fuel allocation per tissue, per hour — is essentially uncharted.",
    why: "Metamorphosis is a whole-organism metabolic event wearing a developmental costume.",
  },
  {
    id: 8,
    tag: "CONNECTOMICS",
    title: "Rewiring a brain while alive",
    known: "Mushroom-body γ-neuron pruning (EcR-B1 → Sox14 → Mical) and the Imp→Syp neuroblast timer are worked out; the adult hemibrain and larval connectomes exist.",
    unknown: "A complete, matched larva→adult wiring diagram of remodeling circuits does not exist. Rules for which synapses are pruned vs kept, how adult-specific neurons find their partners, and how behavior circuits (courtship, flight) assemble de novo are incomplete.",
    why: "It is the only natural example of rebuilding a working brain without killing the animal.",
  },
  {
    id: 9,
    tag: "ENVIRONMENT",
    title: "From nutrition & microbes to pulse timing",
    known: "Insulin/TOR sets critical weight; Dilp8 reports disc damage; light and temperature shift ecdysone timing; the gut microbiome measurably affects developmental time.",
    unknown: "There is no predictive, quantitative model from environment → hormone titers → pulse timing. How microbial metabolites, temperature and diet are integrated at the PTTH neurons and corpus allatum to set exact pulse schedules is unknown.",
    why: "Climate change acts on development through exactly these unwritten rules.",
  },
  {
    id: 10,
    tag: "TRANSLATION",
    title: "New targets & resistance in a warming world",
    known: "JH analogs (methoprene, pyriproxyfen) and ecdysone agonists (tebufenozide) are proven insecticides; Met mutations and CYP upregulation cause resistance.",
    unknown: "The E93 node, the ETH receptor and βFTZ-F1 have never been exploited as targets; species-selective disruption of the cascade is unexplored; and how resistance will evolve against pulse-timing (not hormone-mimicking) drugs is an open evolutionary question.",
    why: "Pest control that breaks the timer rather than mimics the hormone could sidestep existing resistance.",
  },
];

/* ticker content */
export const TICKER_GENES: { symbol: string; pathway: PathwayKey }[] = [
  { symbol: "E93", pathway: "ECD" }, { symbol: "Br-C", pathway: "ECD" }, { symbol: "E74A", pathway: "ECD" },
  { symbol: "βFTZ-F1", pathway: "ECD" }, { symbol: "Kr-h1", pathway: "JH" }, { symbol: "EcR/USP", pathway: "ECD" },
  { symbol: "HR3", pathway: "ECD" }, { symbol: "HR4", pathway: "ECD" }, { symbol: "rpr", pathway: "LYS" },
  { symbol: "Atg8a", pathway: "LYS" }, { symbol: "let-7", pathway: "ECD" }, { symbol: "chinmo", pathway: "JH" },
  { symbol: "ptth", pathway: "ECD" }, { symbol: "shd", pathway: "ECD" }, { symbol: "Antp", pathway: "HOX" },
  { symbol: "Ubx", pathway: "HOX" }, { symbol: "bcd", pathway: "SEG" }, { symbol: "eve", pathway: "SEG" },
  { symbol: "vg", pathway: "SEG" }, { symbol: "ey", pathway: "SEG" }, { symbol: "ETH", pathway: "ECL" },
  { symbol: "ebony", pathway: "DIF" }, { symbol: "yellow", pathway: "DIF" }, { symbol: "burs", pathway: "DIF" },
  { symbol: "FOXO", pathway: "GRW" }, { symbol: "Dilp8", pathway: "GRW" }, { symbol: "dsx", pathway: "DIF" },
];

export const totalGenes = STAGES.reduce(
  (n, s) => n + s.groups.reduce((m, g) => m + g.genes.length, 0),
  0
);
