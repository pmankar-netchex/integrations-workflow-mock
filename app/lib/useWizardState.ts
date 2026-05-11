'use client';
import * as React from 'react';

export type StepId = 'configure' | 'map' | 'review' | 'confirm';

export type StepState =
  | 'idle'
  | 'needs-update'
  | 'updating'
  | 'ready'
  | 'error'
  | 'done';

export type StepInfo = {
  id: StepId;
  label: string;
  state: StepState;
  errorMessage?: string;
};

/**
 * Dependency rule: when an upstream input named in `invalidates` changes,
 * every step listed becomes 'needs-update' → auto-refetches → 'ready'.
 * Forward navigation is hard-blocked while any step is needs-update / updating / error.
 */
export type DependencyRule = {
  trigger: string;
  invalidates: StepId[];
};

const DEFAULT_RULES: DependencyRule[] = [
  { trigger: 'dateRange', invalidates: ['map', 'review'] },
  { trigger: 'orgSlice', invalidates: ['map', 'review'] },
  { trigger: 'syncType', invalidates: ['map', 'review'] },
  { trigger: 'credentials', invalidates: ['map', 'review'] },
  { trigger: 'file', invalidates: ['map', 'review'] },
  { trigger: 'mapping', invalidates: ['review'] },
];

type Options = {
  steps?: StepInfo[];
  rules?: DependencyRule[];
  /** Simulate vendor failure on next refetch (for retry-path demo) */
  failNext?: boolean;
};

const DEFAULT_STEPS: StepInfo[] = [
  { id: 'configure', label: 'Configure', state: 'idle' },
  { id: 'map', label: 'Map', state: 'idle' },
  { id: 'review', label: 'Review', state: 'idle' },
  { id: 'confirm', label: 'Confirm', state: 'idle' },
];

export function useWizardState(opts: Options = {}) {
  const rules = opts.rules ?? DEFAULT_RULES;
  const [steps, setSteps] = React.useState<StepInfo[]>(opts.steps ?? DEFAULT_STEPS);
  const [activeStep, setActiveStep] = React.useState<StepId>(steps[0].id);
  const [shouldFailNext, setShouldFailNext] = React.useState(!!opts.failNext);
  const refetchTimers = React.useRef<Map<StepId, ReturnType<typeof setTimeout>>>(new Map());

  const setStepState = React.useCallback((id: StepId, state: StepState, errorMessage?: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state, errorMessage } : s)));
  }, []);

  const stepIndex = React.useCallback(
    (id: StepId) => steps.findIndex((s) => s.id === id),
    [steps],
  );

  const refetch = React.useCallback(
    (id: StepId, opts?: { fail?: boolean }) => {
      const fail = opts?.fail ?? false;
      // clear any in-flight refetch for this step
      const existing = refetchTimers.current.get(id);
      if (existing) clearTimeout(existing);
      setStepState(id, 'updating');
      const t = setTimeout(() => {
        if (fail) {
          setStepState(
            id,
            'error',
            'Vendor returned an error while pulling fresh data. Try again or contact support.',
          );
        } else {
          setStepState(id, 'ready');
        }
        refetchTimers.current.delete(id);
      }, 1100 + Math.random() * 600);
      refetchTimers.current.set(id, t);
    },
    [setStepState],
  );

  const onUpstreamChange = React.useCallback(
    (trigger: string) => {
      const rule = rules.find((r) => r.trigger === trigger);
      if (!rule) return;
      const willFail = shouldFailNext;
      if (willFail) setShouldFailNext(false);
      // Mark each invalidated step as needs-update first (visible flash before updating)
      setSteps((prev) =>
        prev.map((s) => (rule.invalidates.includes(s.id) ? { ...s, state: 'needs-update' } : s)),
      );
      // Kick off refetches after the debounce so rapid edits collapse to one
      window.setTimeout(() => {
        rule.invalidates.forEach((id) => refetch(id, { fail: willFail }));
      }, 400);
    },
    [rules, refetch, shouldFailNext],
  );

  const retryStep = React.useCallback(
    (id: StepId) => {
      refetch(id, { fail: false });
    },
    [refetch],
  );

  const armFailure = React.useCallback(() => setShouldFailNext(true), []);

  const canAdvance = React.useMemo(() => {
    const idx = stepIndex(activeStep);
    if (idx === -1) return false;
    // Block if anything from current step onward is not ready/done/idle
    return steps.every((s) => {
      if (s.state === 'updating' || s.state === 'needs-update' || s.state === 'error') return false;
      return true;
    });
  }, [activeStep, steps, stepIndex]);

  const goNext = React.useCallback(() => {
    if (!canAdvance) return;
    const idx = stepIndex(activeStep);
    const next = steps[idx + 1];
    if (!next) return;
    setStepState(activeStep, 'done');
    setActiveStep(next.id);
  }, [activeStep, canAdvance, setStepState, steps, stepIndex]);

  const goPrev = React.useCallback(() => {
    const idx = stepIndex(activeStep);
    const prev = steps[idx - 1];
    if (!prev) return;
    setActiveStep(prev.id);
  }, [activeStep, steps, stepIndex]);

  const goTo = React.useCallback(
    (id: StepId) => {
      const targetIdx = stepIndex(id);
      const currentIdx = stepIndex(activeStep);
      // Allow backward navigation always; forward only if all earlier steps are done/ready
      if (targetIdx <= currentIdx) {
        setActiveStep(id);
        return;
      }
      const earlierAllReady = steps
        .slice(0, targetIdx)
        .every((s) => s.state === 'done' || s.state === 'ready');
      if (earlierAllReady && canAdvance) {
        setActiveStep(id);
      }
    },
    [activeStep, canAdvance, steps, stepIndex],
  );

  React.useEffect(() => {
    return () => {
      refetchTimers.current.forEach((t) => clearTimeout(t));
      refetchTimers.current.clear();
    };
  }, []);

  return {
    steps,
    activeStep,
    canAdvance,
    onUpstreamChange,
    retryStep,
    armFailure,
    goNext,
    goPrev,
    goTo,
    setStepState,
  };
}
