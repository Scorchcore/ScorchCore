"use client";

import { useEffect, useState } from "react";
import {
  EVENTS,
  Joyride,
  type EventData,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";

export interface ForgeTourStepDef {
  target: string;
  title: string;
  content: string;
  placement?: Step["placement"];
}

/**
 * One contextual tip per demo stage. The tip explains the procedure while the
 * user performs the real action on the highlighted element (clicks pass through
 * the spotlight cutout).
 */
export const FORGE_TOUR_STEPS: Record<string, ForgeTourStepDef> = {
  "select-geode": {
    target: '[data-tour="icon-geode"]',
    title: "1 · Choose the Geode",
    content:
      "Every forge begins with a geode. The Petit is the smallest and most affordable. Click the floating icon to select it.",
    placement: "bottom",
  },
  "select-class": {
    target: '[data-tour="icon-class"]',
    title: "2 · Choose the Class",
    content:
      "The class defines the CoreMiner's element. Here we forge an Aqua. Click the icon to continue.",
    placement: "bottom",
  },
  "select-axie": {
    target: '[data-tour="icon-axie"]',
    title: "3 · Bring your Axie",
    content:
      "Your Axie Aqua is the living material of the transmutation. Select it to complete the forge triad.",
    placement: "bottom",
  },
  setup: {
    target: '[data-tour="costs"]',
    title: "4 · Forge Recipe",
    content:
      "The protocol leverages all these assets to create a circular economy: AXS goes to staking, the Axie is released to Axie Infinity, and Mementos feed into different liquidity mechanics for $CORE.",
    placement: "top",
  },
  forging: {
    target: '[data-tour="stage"]',
    title: "5 · Transmutation",
    content:
      "The energies of the three vertices draw a triangle and converge at the center of the altar, igniting the runic seal.",
    placement: "top",
  },
  "geode-created": {
    target: '[data-tour="geode-video"]',
    title: "6 · Geode Forged",
    content:
      "The Petit Aqua geode has been born from the altar. Open it to discover which CoreMiner it holds.",
    placement: "bottom",
  },
  opening: {
    target: '[data-tour="stage"]',
    title: "7 · Hatching",
    content:
      "The crystal roulette decides your fate among the possible CoreMiners for this combination.",
    placement: "top",
  },
  revealed: {
    target: '[data-tour="reveal"]',
    title: "8 · CoreMiner Revealed!",
    content:
      "This is your CoreMiner. Every forge is random: try again to get different results.",
    placement: "bottom",
  },
};

function ForgeTooltip({ step, closeProps, tooltipProps }: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="alchemy-copy relative w-[min(20rem,calc(100vw-2rem))] overflow-hidden border border-magma-gold/30 bg-black/92 text-cyan-50 shadow-[0_28px_90px_rgba(0,0,0,0.72),0_0_42px_rgba(240,106,18,0.14)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/12 via-transparent to-cyan-300/8" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/70 to-transparent" />

      <div className="relative space-y-2 px-5 py-4">
        {step.title && (
          <h3 className="alchemy-heading text-base leading-tight">
            {step.title}
          </h3>
        )}
        <p className="text-xs leading-relaxed text-cyan-50/72">
          {step.content}
        </p>

        <div className="flex justify-end pt-1">
          <button
            {...closeProps}
            type="button"
            className="inline-flex items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

interface ForgeTourProps {
  stepKey: string | null;
}

export default function ForgeTour({ stepKey }: ForgeTourProps) {
  const [run, setRun] = useState(true);

  // Re-open the tip whenever the stage (stepKey) changes
  useEffect(() => {
    setRun(Boolean(stepKey));
  }, [stepKey]);

  const def = stepKey ? FORGE_TOUR_STEPS[stepKey] : null;
  if (!def) return null;

  const steps: Step[] = [
    {
      target: def.target,
      title: def.title,
      content: def.content,
      placement: def.placement,
    },
  ];

  const handleEvent = (data: EventData) => {
    if (
      data.type === EVENTS.TOUR_END ||
      data.type === EVENTS.TARGET_NOT_FOUND
    ) {
      setRun(false);
    }
  };

  return (
    <Joyride
      key={stepKey}
      run={run}
      steps={steps}
      continuous={false}
      tooltipComponent={ForgeTooltip}
      onEvent={handleEvent}
      options={{
        skipBeacon: true,
        skipScroll: true,
        buttons: ["close"],
        overlayColor: "rgba(2,6,7,0.66)",
        spotlightPadding: 8,
        zIndex: 60,
      }}
    />
  );
}
