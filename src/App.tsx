import React, { useMemo, useState, useEffect } from "react";
import logoImg from "./elementsnl_logo.jpeg";
import rnImg from "./react-native.png";
import nativeImg from "./native.png";

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
  // Device Features
  {
    id: "device_features",
    category: "Device Features",
    text: "Will your app need deep access to device hardware or platform-only features (GPS, cameras, BLE, background services, widgets)?",
    options: [
      {
        label: "Yes — extensive access",
        value: "yes",
        weights: { rn: 0, native: 3 },
      },
      {
        label: "Some features",
        value: "some",
        weights: { rn: 0, native: 1.5 },
      },
      { label: "No", value: "no", weights: { rn: 2, native: 0 } },
    ],
  },

  // Performance & UI
  {
    id: "performance_needs",
    category: "Performance & UI",
    text: "Is high-performance rendering or low-level graphics (game, AR/VR, heavy animations) critical?",
    options: [
      { label: "Yes — critical", value: "yes", weights: { rn: 0, native: 3 } },
      {
        label: "Maybe / some parts",
        value: "maybe",
        weights: { rn: 0.5, native: 1.5 },
      },
      { label: "No", value: "no", weights: { rn: 1.5, native: 0 } },
    ],
  },

  // User Experience
  {
    id: "ux_platform_fidelity",
    category: "User Experience",
    text: "Do you need an experience that exactly matches native UI components or you prefer a consistent cross-platform experience?",
    options: [
      {
        label: "Yes — exact native UX",
        value: "yes",
        weights: { rn: 0, native: 1.5 },
      },
      {
        label: "Close is fine",
        value: "some",
        weights: { rn: 0, native: 0 },
      },
      {
        label: "Cross-platform consistent UX",
        value: "no",
        weights: { rn: 2, native: 0 },
      },
    ],
  },
  // Dependencies
  {
    id: "third_party_sdks",
    category: "Dependencies",
    text: "Do you rely on third‑party SDKs that are only available or significantly better on native platforms?",
    options: [
      {
        label: "Yes — native-only",
        value: "yes",
        weights: { rn: 0, native: 3 },
      },
      {
        label: "Some SDKs may be native",
        value: "maybe",
        weights: { rn: 0, native: 1.5 },
      },
      {
        label: "No — JS/TS/bridges available",
        value: "no",
        weights: { rn: 2, native: 0 },
      },
    ],
  },

  // Team & Skills
  {
    id: "team_skills",
    category: "Team & Skills",
    text: "Does your team primarily consist of web/TypeScript developers who can reuse skills and code?",
    options: [
      {
        label: "Yes — mostly web/TS",
        value: "yes",
        weights: { rn: 3, native: 0 },
      },
      { label: "Mixed skills", value: "some", weights: { rn: 1.5, native: 0 } },
      {
        label: "Mostly native engineers",
        value: "no",
        weights: { rn: 0, native: 2 },
      },
    ],
  },

  {
    id: "code_reuse",
    category: "Team & Skills",
    text: "Do you want to share code, components, or business logic with a web app or reduce duplication between platforms?",
    options: [
      {
        label: "Yes — high reuse",
        value: "yes",
        weights: { rn: 3, native: 0 },
      },
      {
        label: "Some reuse possible",
        value: "some",
        weights: { rn: 1.5, native: 0 },
      },
      {
        label: "No — platform-specific apps",
        value: "no",
        weights: { rn: 0, native: 1.5 },
      },
    ],
  },

  // Resourcing
  {
    id: "time_to_market",
    category: "Resourcing",
    text: "Is a fast launch across both stores a major priority (minimize duplicated work / parallel releases)?",
    options: [
      {
        label: "Yes — speed matters most",
        value: "yes",
        weights: { rn: 3, native: 0 },
      },
      {
        label: "Somewhat — balanced",
        value: "some",
        weights: { rn: 1.5, native: 0 },
      },
      {
        label: "No — long-term roadmap",
        value: "no",
        weights: { rn: 0, native: 1.5 },
      },
    ],
  },

  {
    id: "budget_constraints",
    category: "Resourcing",
    text: "Are budget and hiring constraints important (would managing two full native teams be costly)?",
    options: [
      { label: "Tight budget", value: "yes", weights: { rn: 3, native: 0 } },
      { label: "Moderate", value: "some", weights: { rn: 0, native: 0 } },
      {
        label: "Budget is flexible",
        value: "no",
        weights: { rn: 0, native: 3 },
      },
    ],
  },

  // Maintenance (short-term)
  {
    id: "maintenance_shortterm",
    category: "Maintenance",
    text: "Are you prioritizing faster delivery and minimizing short‑term maintenance (one shared codebase for quick releases)?",
    options: [
      {
        label: "Yes — prioritize speed / single codebase",
        value: "yes",
        weights: { rn: 3, native: 0 },
      },
      {
        label: "Somewhat — balance speed and effort",
        value: "some",
        weights: { rn: 1.5, native: 0 },
      },
      {
        label: "No — platform specialists preferred",
        value: "no",
        weights: { rn: 0, native: 2 },
      },
    ],
  },

  // Maintenance (long-term)
  {
    id: "maintenance_longterm",
    category: "Maintenance",
    text: "How concerned are you about long‑term platform divergence and the cumulative cost of maintaining native integrations and OS updates?",
    options: [
      {
        label: "High concern — avoid platform divergence",
        value: "high",
        weights: { rn: 0, native: 3 },
      },
      {
        label: "Moderate concern",
        value: "moderate",
        weights: { rn: 0, native: 1.5 },
      },
      {
        label: "Low concern — single codebase acceptable",
        value: "low",
        weights: { rn: 2, native: 0 },
      },
    ],
  },

  // Quality & Stability
  {
    id: "security_stability",
    category: "Quality & Stability",
    text: "Does the project require platform-level security guarantees, regulatory compliance, or OS-specific stability (secure enclave, critical background services)?",
    options: [
      {
        label: "Yes — platform guarantees & compliance required",
        value: "yes",
        weights: { rn: 0, native: 3 },
      },
      {
        label: "Important but manageable",
        value: "some",
        weights: { rn: 0, native: 1.5 },
      },
      {
        label: "Not a primary concern",
        value: "no",
        weights: { rn: 1.5, native: 0 },
      },
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
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={logoImg}
                alt="Elements NL Logo"
                className="w-8 h-8 rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                React-Native vs Native · Project Fit
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

        {/* Questions grouped by category */}
        <section className="space-y-6">
          {(() => {
            // Build a map of category -> questions
            const groups: Record<string, Question[]> = {};
            QUESTIONS.forEach((q) => {
              const cat = q.category ?? "Other";
              if (!groups[cat]) groups[cat] = [];
              groups[cat].push(q);
            });

            // Keep a running question index for global numbering
            let globalIndex = 0;
            return Object.entries(groups).map(([cat, qs]) => (
              <div key={cat}>
                <div className="mb-2">
                  <div className="text-sm font-semibold text-neutral-700">
                    {cat}
                  </div>
                </div>

                <div className="space-y-4">
                  {qs.map((q) => {
                    const idx = globalIndex++;
                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-medium leading-6">
                              {idx + 1}. {q.text}
                            </h3>
                            {q.help && (
                              <p className="mt-1 text-sm text-neutral-600">
                                {q.help}
                              </p>
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
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
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
                    <>{" · "}Answer remaining questions to enable submit.</>
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
                      <span className="text-neutral-600">
                        You can still adjust answers.
                      </span>
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
            <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-lg">
              {/* Header with recommendation */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-800 mb-2">
                    🎯 Recommendation
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm text-neutral-500">
                      Confidence Score
                    </div>
                    <div className="text-2xl font-bold text-neutral-800">
                      {Math.max(rnPct, nativePct)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="space-y-4">
                <div className="relative h-8 w-full rounded-2xl bg-neutral-200 overflow-hidden shadow-inner">
                  {/* React Native segment */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out relative"
                    style={{ width: rnPct + "%" }}
                    title={`React Native ${rnPct}%`}
                  >
                    {rnPct > 15 && (
                      <div className="absolute inset-0 flex items-center justify-start pl-3">
                        <img
                          src={rnImg}
                          alt="React Native"
                          className="w-4 h-4 mr-2"
                        />
                        <span className="text-xs font-bold text-white drop-shadow">
                          {rnPct}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Native segment */}
                  <div
                    className="absolute top-0 right-0 h-full bg-gradient-to-l from-green-500 to-emerald-600 transition-all duration-700 ease-out"
                    style={{ width: nativePct + "%" }}
                    title={`Native ${nativePct}%`}
                  >
                    {nativePct > 15 && (
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-xs font-bold text-white drop-shadow mr-2">
                          {nativePct}%
                        </span>
                        <img src={nativeImg} alt="Native" className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Center divider */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-sm"
                    style={{ left: rnPct + "%" }}
                  />
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <img
                      src={rnImg}
                      alt="React Native"
                      className="w-6 h-6 rounded-lg shadow-sm"
                    />
                    <div>
                      <div className="text-sm font-semibold text-blue-800">
                        React Native
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {rnPct}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <img
                      src={nativeImg}
                      alt="Native"
                      className="w-6 h-6 rounded-lg shadow-sm"
                    />
                    <div>
                      <div className="text-sm font-semibold text-green-800">
                        Native Development
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        {nativePct}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional insights */}
                <div className="mt-4 p-4 bg-neutral-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <div className="text-lg">💡</div>
                    <div>
                      <div className="text-sm font-medium text-neutral-700 mb-1">
                        Key Insight
                      </div>
                      <div className="text-sm text-neutral-600">
                        Scores below 30% or above 70% typically point to a safe
                        choice. However, results in the 30%–70% range represent
                        a grey area where context, priorities, and long-term
                        strategy truly matter. To navigate these nuances and
                        make the best decision for your organization, reach out
                        for tailored advice:{" "}
                        <a
                          href="https://www.elements.nl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          www.elements.nl
                        </a>{" "}
                        or{" "}
                        <a
                          href="mailto:expert@elements.nl"
                          className="text-blue-600 underline"
                        >
                          expert@elements.nl
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
