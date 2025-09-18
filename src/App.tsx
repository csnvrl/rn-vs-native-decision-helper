import React, { useMemo, useState, useEffect } from "react";

// --- Configure your questionnaire here -------------------------------------
// Each option contributes weights to either RN or Native. Adjust as you wish.
// Tip: Keep magnitudes between 0 and 3 for balance.

type Weights = { rn: number; native: number };

type Option = {
  label: string;
  value: string;
  weights: Weights;
};

type Question = {
  id: string;
  text: string;
  help?: string;
  options: Option[];
  category?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "os_features",
    category: "Platform Requirements",
    text: "Will the app rely heavily on platform-specific OS features (e.g., NFC, Bluetooth LE, background services, CarPlay/Android Auto, widgets)?",
    options: [
      { label: "Yes, heavily", value: "yes", weights: { rn: 0, native: 3 } },
      {
        label: "Somewhat",
        value: "somewhat",
        weights: { rn: 0.0, native: 1.5 },
      },
      { label: "No", value: "no", weights: { rn: 3, native: 0 } },
    ],
  },
  {
    id: "graphics_perf",
    category: "Performance & UI",
    text: "Do you need advanced 2D/3D graphics, AR/VR, or game-level performance?",
    options: [
      { label: "Yes", value: "yes", weights: { rn: 0, native: 3 } },
      {
        label: "Maybe / unsure",
        value: "maybe",
        weights: { rn: 0, native: 1.5 },
      },
      { label: "No", value: "no", weights: { rn: 3, native: 0 } },
    ],
  },
  {
    id: "team_web_ts",
    category: "Team & Skills",
    text: "Do you already have web or TypeScript developers?",
    options: [
      { label: "Yes", value: "yes", weights: { rn: 3, native: 0 } },
      { label: "Somewhat", value: "some", weights: { rn: 1.5, native: 0 } },
      { label: "No", value: "no", weights: { rn: 0, native: 1 } },
    ],
  },
  {
    id: "team_native",
    category: "Team & Skills",
    text: "Do you already have strong native iOS/Android developers?",
    options: [
      { label: "Yes", value: "yes", weights: { rn: 0, native: 3 } },
      { label: "Somewhat", value: "some", weights: { rn: 0.0, native: 1.5 } },
      { label: "No", value: "no", weights: { rn: 1, native: 0 } },
    ],
  },
  {
    id: "budget",
    category: "Resourcing",
    text: "Are budget and hiring costs constrained (vs. funding two separate native teams)?",
    options: [
      {
        label: "Yes, constrained",
        value: "yes",
        weights: { rn: 2, native: 0 },
      },
      { label: "Somewhat", value: "some", weights: { rn: 1, native: 0.5 } },
      { label: "No", value: "no", weights: { rn: 0, native: 1.5 } },
    ],
  },
  {
    id: "sdk_availability",
    category: "Dependencies",
    text: "Do you depend on third-party SDKs that are only available natively?",
    options: [
      { label: "Yes", value: "yes", weights: { rn: 0, native: 3 } },
      { label: "Maybe", value: "maybe", weights: { rn: 0, native: 1.5 } },
      { label: "No", value: "no", weights: { rn: 1, native: 0 } },
    ],
  },
];

// --- Helpers ----------------------------------------------------------------

type Answers = Record<string, string | undefined>;

type Totals = { rn: number; native: number; unanswered: number };

const sumWeights = (answers: Answers): Totals => {
  let rn = 0;
  let native = 0;
  let unanswered = 0;
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) {
      unanswered += 1;
      continue;
    }
    const opt = q.options.find((o) => o.value === a);
    if (opt) {
      rn += opt.weights.rn;
      native += opt.weights.native;
    }
  }
  return { rn, native, unanswered };
};

const toPercentages = (totals: Totals) => {
  const base = totals.rn + totals.native;
  if (base <= 0) return { rnPct: 50, nativePct: 50 };
  const rnPct = Math.round((totals.rn / base) * 100);
  const nativePct = 100 - rnPct;
  return { rnPct, nativePct };
};

const decodeState = (): Answers => {
  const params = new URLSearchParams(window.location.search);
  const out: Answers = {};
  QUESTIONS.forEach((q) => {
    const v = params.get(q.id) ?? undefined;
    if (v) out[q.id] = v;
  });
  return out;
};

// --- UI ---------------------------------------------------------------------

export default function App() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  // Load from URL on mount
  useEffect(() => {
    const initial = decodeState();
    if (Object.keys(initial).length) setAnswers(initial);
  }, []);

  const totals = useMemo(() => sumWeights(answers), [answers]);
  const { rnPct, nativePct } = useMemo(() => toPercentages(totals), [totals]);
  const recommended =
    rnPct > nativePct ? "React Native" : rnPct < nativePct ? "Native" : "Tie";

  const setAnswer = (qid: string, value: string) =>
    setAnswers((prev) => {
      // If the user changes an answer after submission, keep showing the card with updated values.
      return { ...prev, [qid]: value };
    });

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const submit = () => {
    setSubmitted(true);
    // Optionally scroll into view
    requestAnimationFrame(() => {
      const el = document.getElementById("result-card");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Share functionality removed per request.

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-black text-white grid place-items-center font-semibold">
              RN
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                RN vs Native · Project Fit
              </h1>
              <p className="text-xs text-neutral-500">
                Answer a few questions → get a weighted recommendation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* (Recommendation moved to bottom) */}

        {/* Questions */}
        <section className="space-y-4">
          {QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium mb-1">
                    {q.category ?? "Question"}
                  </div>
                  <h3 className="text-base font-medium leading-6">
                    {idx + 1}. {q.text}
                  </h3>
                  {q.help && (
                    <p className="mt-1 text-sm text-neutral-600">{q.help}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {q.options.map((opt) => {
                  const id = `${q.id}_${opt.value}`;
                  const selected = answers[q.id] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      htmlFor={id}
                      className={
                        "cursor-pointer rounded-xl border p-3 text-sm transition-colors " +
                        (selected
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-300")
                      }
                    >
                      <input
                        id={id}
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={selected}
                        onChange={() => setAnswer(q.id, opt.value)}
                        className="sr-only"
                      />
                      <div className="font-medium">{opt.label}</div>
                      <div className="mt-1 text-neutral-500 text-xs">
                        RN {opt.weights.rn} · Native {opt.weights.native}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Footer actions */}
        <section className="my-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {(() => {
            const total = QUESTIONS.length;
            const answered = total - totals.unanswered;
            const allAnswered = totals.unanswered === 0;
            return (
              <>
                <div className="text-xs text-neutral-500 flex-1">
                  {answered}/{total} answered
                  {!submitted && !allAnswered && (
                    <>
                      {" · "}Answer remaining questions to enable submit.
                    </>
                  )}
                  {!submitted && allAnswered && (
                    <>
                      {" · "}
                      <span className="text-neutral-600">Ready to submit.</span>
                    </>
                  )}
                  {submitted && (
                    <>
                      {" · "}
                      <span className="text-neutral-600">You can still adjust answers.</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={submit}
                    disabled={!allAnswered}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      allAnswered
                        ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800"
                        : "bg-neutral-200 text-neutral-500 border-neutral-300 cursor-not-allowed"
                    }`}
                  >
                    {submitted ? "Resubmit" : "Submit"}
                  </button>
                  {/* Share link button removed */}
                </div>
              </>
            );
          })()}
        </section>

        {/* Explanation */}
        {/* Result Card (moved to bottom) */}
        {submitted && (
          <section id="result-card" className="mb-6 mt-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Current recommendation</h2>
                  <p className="text-sm text-neutral-600">
                    {recommended === "Tie"
                      ? "It’s a tie."
                      : `${recommended} looks like a better fit.`}
                  </p>
                </div>
                <div className="text-sm text-neutral-600">
                  RN score: <span className="font-medium">{totals.rn.toFixed(1)}</span> ·
                  Native score: <span className="font-medium">{totals.native.toFixed(1)}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="relative h-5 w-full rounded-full bg-neutral-200 overflow-hidden ring-1 ring-neutral-300/60">
                  {/* RN segment */}
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: rnPct + "%" }}
                    title={`React Native ${rnPct}%`}
                    aria-label={`React Native ${rnPct}%`}
                  />
                  {/* Native segment (flex grow placeholder) */}
                  <div
                    className="absolute top-0 right-0 h-full bg-emerald-600 transition-all duration-500 ease-out"
                    style={{ width: nativePct + "%" }}
                    title={`Native ${nativePct}%`}
                    aria-label={`Native ${nativePct}%`}
                  />
                  {/* Boundary divider */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white/70 mix-blend-overlay pointer-events-none"
                    style={{ left: rnPct + "%" }}
                  />
                  {/* Inline labels (only show if enough space) */}
                  {rnPct > 12 && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-white drop-shadow-sm tracking-wide">
                      {rnPct}% RN
                    </span>
                  )}
                  {nativePct > 12 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-white drop-shadow-sm tracking-wide">
                      {nativePct}% Native
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-indigo-600 shadow-sm" />
                    <span>React Native: <span className="font-semibold">{rnPct}%</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-emerald-600 shadow-sm" />
                    <span>Native: <span className="font-semibold">{nativePct}%</span></span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Explanation now follows the recommendation for end-of-page context */}
        <section className="mb-16">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-semibold">How this works</h4>
            <ul className="mt-2 text-sm list-disc pl-5 text-neutral-700 space-y-1">
              <li>
                Each answer adds a <span className="font-medium">weight</span>{" "}
                to either React Native or Native.
              </li>
              <li>
                We convert totals into percentages and visualize them in the bar
                above.
              </li>
              <li>
                You can tweak questions, options, and weights in the{" "}
                <code>QUESTIONS</code> constant.
              </li>
              <li>
                Use the share button to copy a URL with your current selections
                for quick reviews with stakeholders.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-neutral-500">
        Built with ❤️ — Customize to match your product context.
      </footer>
    </div>
  );
}
