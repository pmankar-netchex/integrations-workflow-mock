'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useWizardState } from '../../lib/useWizardState';
import { useConnections } from '../../lib/connectionStore';
import WizardShell from '../WizardShell';
import ReviewGrid from '../ReviewGrid';

const SYNC_LOG = [
  { time: '2026-05-06 02:14 AM', kind: 'Time entries', count: 142, status: 'ok' },
  { time: '2026-05-05 02:11 AM', kind: 'Time entries', count: 138, status: 'ok' },
  { time: '2026-05-04 02:13 AM', kind: 'Time entries', count: 145, status: 'ok' },
  { time: '2026-05-03 02:12 AM', kind: 'Time entries', count: 0, status: 'empty' },
  { time: '2026-05-02 02:10 AM', kind: 'Time entries', count: 156, status: 'ok' },
];

export default function TcpScheduledFlow() {
  const wizard = useWizardState({
    steps: [
      { id: 'configure', label: 'Inspect', state: 'idle' },
      { id: 'review', label: 'Review', state: 'idle' },
      { id: 'confirm', label: 'Confirm', state: 'idle' },
    ],
  });
  const [optionalPull, setOptionalPull] = React.useState(false);
  const [committed, setCommitted] = React.useState(false);
  const { get } = useConnections();
  const conn = get('tcp');

  React.useEffect(() => {
    wizard.setStepState('configure', 'ready');
    wizard.setStepState('review', 'ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const credentialsBanner = conn.status === 'error' ? (
    <Alert
      severity="warning"
      icon={<ErrorOutlineIcon />}
      sx={{ mt: 2 }}
      action={
        <Button component={Link} href="/connect/tcp/" size="small" color="inherit" variant="outlined">
          Open credentials
        </Button>
      }
    >
      <strong>Last connection check failed.</strong> {conn.lastError || 'Pulls may fail until credentials are re-tested.'}
    </Alert>
  ) : null;

  return (
    <WizardShell
      title="TCP Humanity (scheduled)"
      subtitle="TCP pushes time data into Netchex on a nightly schedule. Review what landed for this run."
      vendorBadge={{ label: 'TCP', color: '#00695c', initial: 'T' }}
      steps={wizard.steps}
      activeStep={wizard.activeStep}
      canAdvance={wizard.canAdvance}
      goNext={wizard.goNext}
      goPrev={wizard.goPrev}
      goTo={wizard.goTo}
      retryStep={wizard.retryStep}
      armFailure={wizard.armFailure}
      headerSlot={credentialsBanner}
      renderStep={(id) => {
        if (id === 'configure') {
          return (
            <Box>
              <Stack direction="row" gap={1} mb={2} flexWrap="wrap" alignItems="center">
                <Chip
                  size="small"
                  icon={conn.status === 'connected' ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
                  label={
                    conn.status === 'connected'
                      ? 'Last sync 2026-05-06 02:14 AM (success)'
                      : 'Webhook signature mismatch on last push'
                  }
                  color={conn.status === 'connected' ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  icon={<ScheduleIcon />}
                  label="Next sync ~2026-05-07 02:00 AM"
                  variant="outlined"
                />
                <Button
                  component={Link}
                  href="/connect/tcp/"
                  size="small"
                  startIcon={<SettingsIcon fontSize="small" />}
                  variant="text"
                >
                  Manage credentials
                </Button>
              </Stack>

              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>This source pushes data on a schedule</strong> — most of the time you’ll just confirm what already
                landed. Use the optional pull below only if a vendor-side fix means you need a fresher slice for this run.
              </Alert>

              <Typography variant="subtitle2" mb={1}>Recent syncs</Typography>
              <Paper variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>When</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Kind</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Rows</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {SYNC_LOG.map((row) => (
                      <TableRow key={row.time} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.time}</TableCell>
                        <TableCell>{row.kind}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell>
                          {row.status === 'ok' ? (
                            <Chip size="small" label="OK" color="success" variant="outlined" />
                          ) : (
                            <Chip size="small" label="Empty" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <FormControlLabel
                control={
                  <Switch
                    checked={optionalPull}
                    onChange={(e) => {
                      setOptionalPull(e.target.checked);
                      wizard.onUpstreamChange('syncType');
                    }}
                  />
                }
                label="Pull a fresh slice for this run (optional)"
              />
              {optionalPull && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  This will fetch any rows TCP has written since the last scheduled sync. Most runs do not need this.
                </Alert>
              )}
            </Box>
          );
        }

        if (id === 'review') {
          return <ReviewGrid context="time" />;
        }

        return (
          <Box>
            {!committed ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                On confirm, the selected TCP time rows will be moved into pay-ready timesheets — equivalent of the legacy
                Move To Pay step happens automatically.
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                Done. TCP time data is now in pay-ready timesheets.
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" mb={1}>Summary</Typography>
              <Stack gap={0.5}>
                <Typography variant="body2"><strong>Source:</strong> TCP Humanity (scheduled push)</Typography>
                <Typography variant="body2"><strong>Last scheduled sync:</strong> 2026-05-06 02:14 AM (142 rows)</Typography>
                <Typography variant="body2"><strong>Optional fresh pull:</strong> {optionalPull ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2"><strong>Rows to import:</strong> 6 (1 error excluded)</Typography>
              </Stack>
              <Stack direction="row" gap={1} mt={3}>
                <Chip size="small" label={committed ? 'Imported' : 'Pending'} color={committed ? 'success' : 'default'} />
                <Box flex={1} />
                {!committed ? (
                  <Button variant="contained" onClick={() => setCommitted(true)}>Confirm — move to pay-ready</Button>
                ) : (
                  <Button variant="contained" color="success" onClick={() => (window.location.href = '/')}>
                    Return to Edit Timesheets
                  </Button>
                )}
              </Stack>
            </Paper>
          </Box>
        );
      }}
    />
  );
}
