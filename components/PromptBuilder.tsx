"use client";

import { useMemo, useState } from "react";
import {
  BrainCircuit,
  ClipboardCheck,
  Copy,
  FlaskConical,
  Layers,
  ListChecks,
  Plus,
  RefreshCcw,
  Sparkles,
  Target,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PromptSection = {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  value: string;
  enabled: boolean;
  heuristics: string[];
  category: "setup" | "context" | "execution" | "quality";
  importance: number;
};

type CustomVariable = {
  id: string;
  label: string;
  example: string;
};

type PromptPreset = {
  id: string;
  name: string;
  description: string;
  hero?: string;
  sections: Partial<Record<PromptSection["id"], string>>;
  variables?: CustomVariable[];
};

const baseSections: PromptSection[] = [
  {
    id: "role",
    title: "Strategic Role",
    description:
      "Clarify who the assistant is and the vantage point they should adopt when solving the task.",
    placeholder:
      "You are a veteran UX researcher embedded with the product strategy team at a fast-scaling SaaS startup.",
    value: "",
    enabled: true,
    heuristics: [
      "Anchor to an expert persona with domain knowledge.",
      "Clarify the decision latitude or guardrails.",
      "Indicate any collaboration style (consultant, pair partner, etc.)."
    ],
    category: "setup",
    importance: 0.15
  },
  {
    id: "mission",
    title: "Mission Objective",
    description:
      "Define the decisive outcome the assistant must drive toward with measurable signals of success.",
    placeholder:
      "Deliver a workshop-ready brief that synthesizes user pains into three opportunity territories, each with supporting evidence.",
    value: "",
    enabled: true,
    heuristics: [
      "Use action verbs that imply ownership.",
      "Bake in quality criteria like format, resolution, or rigor.",
      "Reference delivery deadlines or iteration loops when relevant."
    ],
    category: "execution",
    importance: 0.2
  },
  {
    id: "audience",
    title: "Audience & End Consumer",
    description:
      "Describe who ultimately consumes the output, their expectations, sensitivities, and context of use.",
    placeholder:
      "Output is reviewed by the VP of Product and shared downstream with design leads; insights must be executive-polished yet implementable.",
    value: "",
    enabled: true,
    heuristics: [
      "Highlight stakeholder sophistication and prior knowledge.",
      "Mention tone/perception risks to avoid misalignment.",
      "Indicate follow-on actions readers will take."
    ],
    category: "context",
    importance: 0.1
  },
  {
    id: "inputs",
    title: "Available Inputs",
    description:
      "List data the model can rely on: source docs, analytics fragments, or user snippets. Clarify credibility and freshness.",
    placeholder:
      "Use the attached interview digest (March 2024), product analytics for Q1, and the brand north-star narrative from the strategy deck.",
    value: "",
    enabled: true,
    heuristics: [
      "Separate primary vs secondary sources.",
      "Surface key stats, thresholds, or tags for quick reference.",
      "Flag any data quality caveats or trust constraints."
    ],
    category: "context",
    importance: 0.12
  },
  {
    id: "constraints",
    title: "Constraints & Guardrails",
    description:
      "Enumerate non-negotiables such as exclusions, compliance restrictions, or formatting limitations.",
    placeholder:
      "Do not fabricate metrics. Stay within a 2-page brief (≈500 words). Reference customers anonymously (e.g., “Fintech Client A”).",
    value: "",
    enabled: true,
    heuristics: [
      "Name redlines that would invalidate the output.",
      "Surface industry regulations or policy constraints.",
      "Limit scope creep by stating out-of-bounds topics."
    ],
    category: "quality",
    importance: 0.1
  },
  {
    id: "process",
    title: "Process & Reasoning Rituals",
    description:
      "Specify the workflow you expect the model to follow, including interim reasoning steps and validation loops.",
    placeholder:
      "First map observations into Jobs To Be Done statements, then cluster into themes, finally rank themes by TAM and urgency.",
    value: "",
    enabled: true,
    heuristics: [
      "Request intermediate artifacts to inspect reasoning.",
      "Encourage self-critique or counterfactual checks.",
      "Highlight reusable frameworks to lean on."
    ],
    category: "execution",
    importance: 0.12
  },
  {
    id: "format",
    title: "Output Format & Packaging",
    description:
      "Describe the structure, formatting, and any markdown or data visualization conventions to follow.",
    placeholder:
      "Return markdown with an executive summary, theme table (| theme | supporting quote | metric |), and prioritized recommendations list.",
    value: "",
    enabled: true,
    heuristics: [
      "Mention specific sections, headings, or tables.",
      "Clarify length, bullet styles, and numbering.",
      "Call out artifacts to generate (JSON, Mermaid diagram, etc.)."
    ],
    category: "quality",
    importance: 0.08
  },
  {
    id: "tone",
    title: "Voice, Tone & Style",
    description:
      "Guide the comms palette: energy, brand alignment, and depth of explanation relative to the audience.",
    placeholder:
      "Adopt a focused, incisive tone similar to Harvard Business Review write-ups; avoid marketing fluff and keep sentences punchy.",
    value: "",
    enabled: false,
    heuristics: [
      "Reference known brands or authors for calibration.",
      "State verbosity preferences and jargon tolerance.",
      "Flag vocabulary to avoid or emphasize."
    ],
    category: "quality",
    importance: 0.05
  },
  {
    id: "failsafes",
    title: "Self-Checks & Failsafes",
    description:
      "Define what the assistant should verify before final delivery and how to recover from uncertainty.",
    placeholder:
      "Validate that every insight ties back to at least one evidence source. If confidence <80%, pause and request clarifications.",
    value: "",
    enabled: false,
    heuristics: [
      "Encourage sanity checks against constraints.",
      "Ask for evidence tags or citations.",
      "Provide fallback instructions if data is insufficient."
    ],
    category: "quality",
    importance: 0.08
  }
];

const presets: PromptPreset[] = [
  {
    id: "research-orchestrator",
    name: "Insight Orchestrator",
    description:
      "Turns qualitative research dumps into executive-ready briefs with strategic framing.",
    hero: "Distill messy research into opportunity stories with quant-qual balance.",
    sections: {
      role:
        "You are a principal-level product insights lead partnering with the executive team ahead of quarterly planning.",
      mission:
        "Extract 3-4 bold opportunities with supporting signals, each linked to user pains and potential business impact.",
      inputs:
        "Primary inputs: 12 moderated interviews (SaaS admins), churn analytics (Q1), support ticket taxonomy (Jan-Mar). Secondary: 2023 market landscape report.",
      constraints:
        "Preserve verbatim quotes. Cite evidence inline using [source - timestamp]. Avoid roadmap commitments or solution bias.",
      process:
        "Map insights to user journey stages, surface frictions, quantify with provided metrics, then articulate opportunity hypotheses ranked by urgency.",
      format:
        "Deliver markdown with ## Executive Pulse, ## Opportunity Radar (table), ## Strategic Plays with bullet proof points.",
      tone:
        "Concise, analytical, CPO-friendly. Aim for confident storytelling without filler.",
      failsafes:
        "Flag gaps if a finding lacks corroborating evidence. Recommend additional data pulls when uncertainty remains."
    }
  },
  {
    id: "growth-strategist",
    name: "Growth Strategist",
    description:
      "Architects marketing experiments with channel fit, messaging hypotheses, and KPI instrumentation.",
    sections: {
      role:
        "You are a senior growth strategist tasked with orchestrating net-new acquisition experiments for a PLG SaaS.",
      mission:
        "Deliver a laddered experiment plan covering awareness, activation, and referral with clear KPIs and learning goals.",
      audience:
        "Executives and growth team leads who require crisp decision-ready briefs and KPI clarity.",
      inputs:
        "Current data: onboarding analytics (March), messaging SWOT, competitor benchmark deck, experiment backlog snapshots.",
      constraints:
        "Budget per test must stay under $18k. Ensure each plan states KPI target lifts and minimum detectable effect size.",
      process:
        "Cluster insights into opportunity spaces, craft messaging hypotheses per audience segment, then pair with channel mechanics and instrumentation.",
      format:
        "Return a markdown deck with ## Core Insight, ## Experiment Grid (table), ## Messaging Framework, ## KPI Readiness Checklist.",
      tone:
        "Productive optimism with analytical rigor. Avoid buzzwords unless they clarify strategy."
    }
  },
  {
    id: "fullstack-architect",
    name: "Full-Stack Architect",
    description:
      "Guides code-generation workflows with architecture constraints, quality gates, and testing focus.",
    sections: {
      role:
        "You are a pragmatic staff-level full-stack engineer pair-programming on a production-critical module.",
      mission:
        "Produce implementation guidance and review notes ensuring the design meets scalability, reliability, and DX expectations.",
      constraints:
        "Respect existing architecture (Next.js app router, Postgres via Prisma). Ensure zero downtime deploys. No breaking API contracts.",
      process:
        "Interpret requirements, propose architecture diagram, outline schema & API changes, specify testing strategy, then deliver stepwise build order.",
      format:
        "Markdown with sections: ## Architecture, ## Data Model, ## API Contract, ## Implementation Steps, ## Validation.",
      failsafes:
        "Highlight unknowns as explicit callouts. Require a rollback plan if a migration fails.",
      tone:
        "Direct, engineering-led communication with focus on trade-offs and risk mitigation."
    }
  }
];

const heuristics = [
  "Clarify how success is judged before diving into tasks.",
  "Anchor tone and depth to the real decision maker.",
  "Ask for intermediate artifacts to audit reasoning quality.",
  "Use dynamic variables ({like_this}) to embed runtime data.",
  "Invite the assistant to surface uncertainties and data gaps."
];

const inspirationCards = [
  {
    title: "Constraint Triad",
    prompt:
      "Limit scope by defining time, fidelity, and resource constraints so the assistant optimizes within realistic bounds."
  },
  {
    title: "Counterfactual Lens",
    prompt:
      "Ask for 'what would have to be true' statements to trigger deeper strategic thinking."
  },
  {
    title: "Cited Evidence",
    prompt:
      "Require citations or data provenance tags to keep hallucinations at bay."
  },
  {
    title: "Calibration Pass",
    prompt:
      "Request a short synopsis before the final output so you can redirect if the assistant misinterprets the goal."
  }
];

const variableSuggestions: CustomVariable[] = [
  {
    id: "project_codename",
    label: "{project_codename}",
    example: "nebula-zero"
  },
  {
    id: "deadline",
    label: "{deadline}",
    example: "2024-06-30"
  },
  {
    id: "target_metric",
    label: "{target_metric}",
    example: "Activation Rate"
  }
];

export function PromptBuilder() {
  const [sections, setSections] = useState<PromptSection[]>(baseSections);
  const [customInstructions, setCustomInstructions] = useState<
    { id: string; label: string; value: string }[]
  >([
    {
      id: crypto.randomUUID(),
      label: "Strategic Reminder",
      value: "If context is missing, surface a clarifying question before proceeding."
    }
  ]);
  const [variables, setVariables] = useState<CustomVariable[]>([
    variableSuggestions[0],
    variableSuggestions[1]
  ]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const completionScore = useMemo(() => {
    const enabled = sections.filter((section) => section.enabled);
    if (!enabled.length) return 0;
    const weighted = enabled.reduce((acc, section) => {
      const filled = section.value.trim().length > 0 ? 1 : 0;
      return acc + filled * section.importance;
    }, 0);
    const totalImportance = enabled.reduce(
      (acc, section) => acc + section.importance,
      0
    );
    return Math.round((weighted / totalImportance) * 100);
  }, [sections]);

  const generatedPrompt = useMemo(() => {
    const promptLines: string[] = [];
    sections
      .filter((section) => section.enabled && section.value.trim())
      .sort((a, b) => a.importance < b.importance ? 1 : -1)
      .forEach((section) => {
        promptLines.push(`### ${section.title}`);
        promptLines.push(section.value.trim());
        promptLines.push("");
      });

    if (customInstructions.length) {
      promptLines.push("### Operate With");
      customInstructions
        .filter((instruction) => instruction.value.trim())
        .forEach((instruction) => {
          promptLines.push(`- ${instruction.value.trim()}`);
        });
      promptLines.push("");
    }

    if (variables.length) {
      promptLines.push("### Dynamic Variables");
      variables.forEach((variable) => {
        promptLines.push(`${variable.label}: e.g. ${variable.example}`);
      });
      promptLines.push("");
    }

    promptLines.push("### Final Delivery Checklist");
    promptLines.push(
      [
        "Confirm all constraints are respected.",
        "Summarize residual risks or unknowns.",
        "Offer 1-2 next-step options calibrated to the audience."
      ]
        .map((line) => `- ${line}`)
        .join("\n")
    );
    promptLines.push("");

    return promptLines.join("\n").trim();
  }, [sections, customInstructions, variables]);

  const qualitySignals = useMemo(() => {
    const signals = [];
    if (completionScore >= 80) {
      signals.push("🧠 Clarity signal high — you covered the critical inputs.");
    }
    if (sections.some((section) => section.id === "failsafes" && section.value)) {
      signals.push("🛡️ Fail-safes armed — hallucination risk mitigated.");
    }
    if (variables.length >= 2) {
      signals.push("🔗 Runtime variables ready for templating pipelines.");
    }
    if (!signals.length) {
      signals.push("Add more detail to boost prompt precision and resilience.");
    }
    return signals;
  }, [completionScore, sections, variables]);

  const handleSectionValueChange = (id: string, value: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? {
              ...section,
              value
            }
          : section
      )
    );
  };

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? {
              ...section,
              enabled: !section.enabled
            }
          : section
      )
    );
  };

  const applyPreset = (preset: PromptPreset) => {
    setActivePreset(preset.id);
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        value: preset.sections[section.id] ?? section.value,
        enabled:
          preset.sections[section.id] !== undefined ? true : section.enabled
      }))
    );
    if (preset.variables && preset.variables.length) {
      setVariables(preset.variables);
    }
  };

  const addCustomInstruction = () => {
    setCustomInstructions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "Instruction", value: "" }
    ]);
  };

  const updateInstruction = (id: string, value: string) => {
    setCustomInstructions((prev) =>
      prev.map((instruction) =>
        instruction.id === id
          ? {
              ...instruction,
              value
            }
          : instruction
      )
    );
  };

  const removeInstruction = (id: string) => {
    setCustomInstructions((prev) =>
      prev.filter((instruction) => instruction.id !== id)
    );
  };

  const addVariable = () => {
    setVariables((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "{variable_name}",
        example: "Describe what belongs here"
      }
    ]);
  };

  const updateVariable = (
    id: string,
    partial: Partial<Omit<CustomVariable, "id">>
  ) => {
    setVariables((prev) =>
      prev.map((variable) =>
        variable.id === id
          ? {
              ...variable,
              ...partial
            }
          : variable
      )
    );
  };

  const removeVariable = (id: string) => {
    setVariables((prev) => prev.filter((variable) => variable.id !== id));
  };

  const hydrateHeuristic = (sectionId: string, text: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              value: section.value
                ? `${section.value.trim()}\n- ${text}`
                : `- ${text}`
            }
          : section
      )
    );
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 lg:flex-row">
      <section className="flex flex-1 flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-slate-900/30 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-slate-400">
                <Sparkles className="h-4 w-4 text-accent" />
                Intelligent Prompt Architect
              </div>
              <h1 className="text-3xl font-semibold text-slate-50">
                Prompt Forge Studio
              </h1>
            </div>
            <Badge variant="glow">Prompt Quality Score {completionScore}%</Badge>
          </div>
          <p className="max-w-3xl text-sm text-slate-400">
            Craft elite prompts by aligning context, strategy, and delivery.
            Activate modules, inject heuristics, and preview a production-ready
            instruction set in minutes.
          </p>
          <div className="flex flex-wrap gap-2">
            {heuristics.map((insight) => (
              <Badge key={insight} variant="outline" className="bg-slate-900/60">
                {insight}
              </Badge>
            ))}
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/20 backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Layers className="h-4 w-4 text-accent" />
                Blueprint Library
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Jumpstart with a Template
              </h2>
            </div>
            {activePreset ? (
              <Badge variant="glow">Active: {activePreset}</Badge>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-left transition hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10",
                  activePreset === preset.id && "border-accent shadow-lg"
                )}
              >
                <h3 className="text-sm font-semibold text-slate-50">
                  {preset.name}
                </h3>
                {preset.hero ? (
                  <p className="text-xs text-slate-400">{preset.hero}</p>
                ) : null}
                <p className="text-xs text-slate-500">{preset.description}</p>
                <div className="mt-auto flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="h-3 w-3 text-accent" />
                  Apply Blueprint
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          {sections.map((section) => (
            <article
              key={section.id}
              className="group rounded-3xl border border-slate-800/70 bg-slate-900/30 p-6 transition hover:border-accent/60 hover:bg-slate-900/50"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    {section.category === "setup" ? (
                      <BrainCircuit className="h-4 w-4 text-accent" />
                    ) : section.category === "context" ? (
                      <Target className="h-4 w-4 text-accent" />
                    ) : section.category === "execution" ? (
                      <ListChecks className="h-4 w-4 text-accent" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4 text-accent" />
                    )}
                    {section.category.toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {section.title}
                  </h3>
                  <p className="max-w-2xl text-xs text-slate-400">
                    {section.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{section.enabled ? "Active" : "Dormant"}</span>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </div>
              </div>
              {section.enabled ? (
                <>
                  <Textarea
                    rows={section.value.split("\n").length > 4 ? 6 : 4}
                    placeholder={section.placeholder}
                    value={section.value}
                    onChange={(event) =>
                      handleSectionValueChange(section.id, event.target.value)
                    }
                    className="text-sm"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {section.heuristics.map((heuristic) => (
                      <button
                        key={heuristic}
                        type="button"
                        onClick={() => hydrateHeuristic(section.id, heuristic)}
                        className="rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-300 transition hover:border-accent/70 hover:text-accent"
                      >
                        {heuristic}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <FlaskConical className="h-4 w-4 text-accent" />
                Custom Boosters
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Layer in bespoke instructions
              </h2>
              <p className="text-xs text-slate-400">
                Use this space for calibration requests, quality bars, or
                collaboration rituals unique to your workflow.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={addCustomInstruction}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Instruction
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {customInstructions.map((instruction, index) => (
              <div
                key={instruction.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Instruction #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeInstruction(instruction.id)}
                    className="text-slate-500 transition hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Embed a calibration loop, e.g., “Before finalizing, offer a 3-bullet executive summary for validation.”"
                  value={instruction.value}
                  onChange={(event) =>
                    updateInstruction(instruction.id, event.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <RefreshCcw className="h-4 w-4 text-accent" />
                Dynamic Variables
              </div>
              <h2 className="text-xl font-semibold text-slate-100">
                Parameterize your prompt
              </h2>
              <p className="text-xs text-slate-400">
                Reference variables anywhere in your sections to inject runtime
                values (e.g., {`{project_codename}`}, {`{deadline}`}). Update
                labels and exemplar values to educate downstream users.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={addVariable}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Variable
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {variables.map((variable) => (
              <div
                key={variable.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <label className="text-[11px] uppercase tracking-wide text-slate-500">
                      Token
                    </label>
                    <Input
                      value={variable.label}
                      onChange={(event) =>
                        updateVariable(variable.id, { label: event.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] uppercase tracking-wide text-slate-500">
                      Sample Value
                    </label>
                    <Input
                      value={variable.example}
                      placeholder="Concrete example to guide usage"
                      onChange={(event) =>
                        updateVariable(variable.id, {
                          example: event.target.value
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariable(variable.id)}
                    className="self-center rounded-full border border-slate-700/80 bg-slate-900/70 p-2 text-slate-400 transition hover:border-rose-500/60 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            {variableSuggestions.map((variable) => (
              <button
                key={variable.id}
                type="button"
                onClick={() =>
                  setVariables((prev) => {
                    if (prev.some((item) => item.label === variable.label)) {
                      return prev;
                    }
                    return [...prev, { ...variable, id: crypto.randomUUID() }];
                  })
                }
                className="rounded-full border border-slate-700/80 px-3 py-1 transition hover:border-accent/70 hover:text-accent"
              >
                {variable.label}
              </button>
            ))}
          </div>
        </section>
      </section>

      <aside className="lg:w-[32rem]">
        <div className="sticky top-10 flex flex-col gap-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl shadow-slate-900/20 backdrop-blur lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-100">
                Prompt Preview
              </h2>
              <Button variant="outline" size="sm" onClick={copyPrompt}>
                {copied ? (
                  <>
                    <ClipboardCheck className="mr-1 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs leading-relaxed text-slate-200 shadow-inner">
              <pre className="whitespace-pre-wrap break-words font-mono">
                {generatedPrompt}
              </pre>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Quality Signals
              </h3>
              <div className="flex flex-col gap-2">
                {qualitySignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-300"
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/15">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">
              Prompt Design Sparks
            </h3>
            <div className="grid gap-3">
              {inspirationCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3 text-xs text-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">
                      {card.title}
                    </span>
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mt-2 text-slate-400">{card.prompt}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
