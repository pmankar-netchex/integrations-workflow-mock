'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { StepId, StepInfo } from '../lib/useWizardState';

export type WizardShellProps = {
  title: string;
  subtitle?: string;
  vendorBadge?: { label: string; color?: string; initial?: string };
  steps: StepInfo[];
  activeStep: StepId;
  canAdvance: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (id: StepId) => void;
  retryStep: (id: StepId) => void;
  armFailure?: () => void;
  /** Per-step content. Active step's content is rendered. */
  renderStep: (id: StepId) => React.ReactNode;
  /** Optional slot rendered between header and step content (e.g., credential banner) */
  headerSlot?: React.ReactNode;
};

function stepIcon(state: StepInfo['state']) {
  switch (state) {
    case 'done':
      return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />;
    case 'ready':
      return <CheckCircleIcon fontSize="small" sx={{ color: 'success.light' }} />;
    case 'updating':
      return <HourglassTopIcon fontSize="small" sx={{ color: 'primary.main' }} />;
    case 'needs-update':
      return <WarningAmberIcon fontSize="small" sx={{ color: '#ed6c02' }} />;
    case 'error':
      return <ErrorOutlineIcon fontSize="small" sx={{ color: 'error.main' }} />;
    default:
      return <RadioButtonUncheckedIcon fontSize="small" sx={{ color: 'text.disabled' }} />;
  }
}

function stepStatusLabel(state: StepInfo['state']): string {
  switch (state) {
    case 'updating':
      return 'Updating…';
    case 'needs-update':
      return 'Needs update';
    case 'ready':
      return 'Ready';
    case 'done':
      return 'Done';
    case 'error':
      return 'Failed';
    default:
      return '';
  }
}

export default function WizardShell(props: WizardShellProps) {
  const {
    title,
    subtitle,
    vendorBadge,
    steps,
    activeStep,
    canAdvance,
    goNext,
    goPrev,
    goTo,
    retryStep,
    armFailure,
    renderStep,
    headerSlot,
  } = props;

  const activeIdx = steps.findIndex((s) => s.id === activeStep);
  const isLast = activeIdx === steps.length - 1;
  const blockingStep = steps.find(
    (s) => s.state === 'updating' || s.state === 'needs-update' || s.state === 'error',
  );

  return (
    <Box>
      <Button component={Link} href="/marketplace/" startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 1 }}>
        Select Another Integration
      </Button>

      <Stack direction="row" alignItems="center" gap={2} mb={0.5}>
        {vendorBadge && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1,
              bgcolor: vendorBadge.color || '#5e35b1',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {vendorBadge.initial || vendorBadge.label[0]}
          </Box>
        )}
        <Box>
          <Typography variant="h1" component="h1">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
        <Box flex={1} />
        {armFailure && (
          <Tooltip title="Demo helper — arms the next refetch to fail so you can see the retry path. The user-facing UI does not normally show this.">
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={armFailure}
              sx={{ fontSize: 11 }}
            >
              Demo: simulate vendor error on next refresh
            </Button>
          </Tooltip>
        )}
      </Stack>

      {headerSlot}

      <Stack direction="row" gap={3} alignItems="flex-start" mt={3}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {blockingStep && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: blockingStep.state === 'error' ? '#fdecea' : '#fff8e1',
                borderColor: blockingStep.state === 'error' ? '#f5c2c0' : '#ffe082',
              }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                {blockingStep.state === 'updating' && <HourglassTopIcon fontSize="small" color="primary" />}
                {blockingStep.state === 'needs-update' && <WarningAmberIcon fontSize="small" sx={{ color: '#ed6c02' }} />}
                {blockingStep.state === 'error' && <ErrorOutlineIcon fontSize="small" color="error" />}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {blockingStep.state === 'updating' && `Updating ${blockingStep.label.toLowerCase()} for the new inputs…`}
                    {blockingStep.state === 'needs-update' && `${blockingStep.label} needs to be refreshed because an upstream input changed.`}
                    {blockingStep.state === 'error' && `${blockingStep.label} could not be refreshed.`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Forward navigation is disabled until everything is consistent. (Reactive refresh — Spec §7.3.1.)
                  </Typography>
                  {blockingStep.errorMessage && (
                    <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                      {blockingStep.errorMessage}
                    </Typography>
                  )}
                </Box>
                {blockingStep.state === 'error' && (
                  <Button size="small" variant="contained" onClick={() => retryStep(blockingStep.id)}>
                    Retry
                  </Button>
                )}
              </Stack>
              {blockingStep.state === 'updating' && <LinearProgress sx={{ mt: 1 }} />}
            </Paper>
          )}

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Chip label={`Step ${activeIdx + 1}`} size="small" color="primary" />
              <Typography variant="h2">{steps[activeIdx]?.label}</Typography>
            </Stack>
            {renderStep(activeStep)}

            <Stack direction="row" gap={1} mt={4}>
              <Button onClick={goPrev} disabled={activeIdx === 0} variant="outlined">
                Back
              </Button>
              <Box flex={1} />
              <Tooltip title={!canAdvance ? 'Waiting for steps to refresh' : ''}>
                <span>
                  <Button onClick={goNext} disabled={!canAdvance || isLast} variant="contained">
                    {isLast ? 'Done' : 'Continue'}
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Paper>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, width: 240, flexShrink: 0, bgcolor: '#f7f9fc' }}>
          <Typography variant="overline" color="text.secondary">Track Your Progress</Typography>
          <Stack mt={1} gap={0.5}>
            {steps.map((s) => {
              const idx = steps.findIndex((x) => x.id === s.id);
              const isActive = s.id === activeStep;
              const status = stepStatusLabel(s.state);
              return (
                <Box
                  key={s.id}
                  onClick={() => goTo(s.id)}
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: isActive ? '#e3f0fd' : 'transparent',
                    '&:hover': { bgcolor: isActive ? '#d6e7fb' : '#eef1f5' },
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    {stepIcon(s.state)}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400 }}>
                        {idx + 1}. {s.label}
                      </Typography>
                      {status && (
                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              s.state === 'error'
                                ? 'error.main'
                                : s.state === 'updating'
                                ? 'primary.main'
                                : s.state === 'needs-update'
                                ? '#ed6c02'
                                : 'text.secondary',
                          }}
                        >
                          {status}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
