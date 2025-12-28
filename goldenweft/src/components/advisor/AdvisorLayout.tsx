"use client";

import { useState } from "react";
import AdvisorProgress from "./AdvisorProgress";
import StepIntro from "./StepIntro";
import StepSingleChoice from "./StepSingleChoice";
import AdvisorResult from "./AdvisorResult";

const steps = [
  "intro",
  "occasion",
  "drape",
  "style",
  "tone",
  "investment",
  "result",
] as const;

type StepKey = (typeof steps)[number];

export default function AdvisorLayout() {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const next = () =>
    setStep((s) => Math.min(s + 1, steps.length - 1));

  const back = () =>
    setStep((s) => Math.max(s - 1, 0));

  const save = (key: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
    next();
  };

  const currentStep: StepKey = steps[step];

  /* ---------- Intro ---------- */
  if (currentStep === "intro") {
    return <StepIntro onNext={next} />;
  }

  /* ---------- Result ---------- */
  if (currentStep === "result") {
    // ✅ Guard: do not render until answers exist
    if (Object.keys(answers).length === 0) {
      return null;
    }

    return <AdvisorResult answers={answers} />;
  }

  /* ---------- Question Steps ---------- */
  return (
    <div className="min-h-screen flex flex-col justify-center">
      <AdvisorProgress
        current={step}
        total={steps.length - 2}
      />

      <StepSingleChoice
        step={currentStep}
        onSelect={save}
        onBack={back}
      />
    </div>
  );
}
