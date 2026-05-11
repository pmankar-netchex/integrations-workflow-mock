'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useWizardState } from '../../lib/useWizardState';
import { EMPLOYEES } from '../../lib/mockData';
import { useConnections } from '../../lib/connectionStore';
import WizardShell from '../WizardShell';
import ReviewGrid from '../ReviewGrid';

export default function DaxkoFlow({ slug = 'daxko' }: { slug?: 'daxko' | 'delaget' } = {}) {
  const SLUG = slug;
  const wizard = useWizardState();
  const { get } = useConnections();
  const conn = get(SLUG);
  const [dateFrom, setDateFrom] = React.useState('2026-04-22');
  const [dateTo, setDateTo] = React.useState('2026-05-05');
  const [division, setDivision] = React.useState('All Divisions');
  const [businessUnit, setBusinessUnit] = React.useState('All Business Units');
  const [includeBenched, setIncludeBenched] = React.useState('No');
  const [committed, setCommitted] = React.useState(false);

  // First-time arrival → seed ready states for downstream
  React.useEffect(() => {
    wizard.setStepState('configure', 'ready');
    wizard.setStepState('map', 'ready');
    wizard.setStepState('review', 'ready');
    wizard.setStepState('confirm', 'idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If credentials missing entirely, show a focused setup prompt instead of the full wizard
  if (conn.status === 'not-connected') {
    return (
      <Box>
        <Button component={Link} href="/marketplace/" startIcon={<LinkOffIcon />} size="small" sx={{ mb: 2 }}>
          Back to integrations
        </Button>
        <Paper variant="outlined" sx={{ p: 4, maxWidth: 640 }}>
          <Stack direction="row" alignItems="center" gap={2} mb={2}>
            <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: '#c62828', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>D</Box>
            <Box>
              <Typography variant="h2">Daxko Club Automation</Typography>
              <Typography variant="body2" color="text.secondary">One-time credentials setup needed before you can pull data.</Typography>
            </Box>
          </Stack>
          <Alert severity="info" sx={{ mb: 2 }}>
            Daxko uses OAuth 2.0. You'll need a Client ID and Secret from your Daxko admin. Takes about a minute.
          </Alert>
          <Button component={Link} href={`/connect/${SLUG}/`} variant="contained" size="large" startIcon={<LinkIcon />}>
            Set up connection
          </Button>
        </Paper>
      </Box>
    );
  }

  const credentialsBanner = conn.status === 'error' ? (
    <Alert
      severity="warning"
      icon={<ErrorOutlineIcon />}
      sx={{ mt: 2 }}
      action={
        <Button component={Link} href={`/connect/${SLUG}/`} size="small" color="inherit" variant="outlined">
          Open credentials
        </Button>
      }
    >
      <strong>Last connection test failed.</strong> {conn.lastError || 'Pulls may fail until credentials are re-tested.'}
    </Alert>
  ) : null;

  return (
    <WizardShell
      title="Daxko Club Automation"
      subtitle="On-demand pull of payroll commissions and class instructor hours"
      vendorBadge={{ label: 'Daxko', color: '#c62828', initial: 'D' }}
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
              <Stack direction="row" gap={1} mb={2} alignItems="center" flexWrap="wrap">
                <Chip
                  size="small"
                  icon={conn.status === 'connected' ? <LinkIcon /> : <ErrorOutlineIcon />}
                  label={
                    conn.status === 'connected'
                      ? `Connected${conn.lastTested ? ' — last tested ' + new Date(conn.lastTested).toLocaleString() : ''}`
                      : 'Connection issue'
                  }
                  color={conn.status === 'connected' ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Button
                  component={Link}
                  href={`/connect/${SLUG}/`}
                  size="small"
                  startIcon={<SettingsIcon fontSize="small" />}
                  variant="text"
                >
                  Manage credentials
                </Button>
              </Stack>

              <Typography variant="subtitle2" mb={1}>Date range</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Mappings and preview will refresh automatically when this changes — no manual button needed.
              </Typography>
              <Stack direction="row" gap={2} mb={3}>
                <TextField
                  type="date"
                  label="From"
                  size="small"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    wizard.onUpstreamChange('dateRange');
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="To"
                  size="small"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    wizard.onUpstreamChange('dateRange');
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Typography variant="subtitle2" mb={1}>Org slice</Typography>
              <Stack direction="row" gap={2} mb={3} flexWrap="wrap">
                <TextField
                  select
                  label="Division"
                  size="small"
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    wizard.onUpstreamChange('orgSlice');
                  }}
                  sx={{ minWidth: 220 }}
                >
                  {['All Divisions', '000 - Default', '200 - Service'].map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Business Unit"
                  size="small"
                  value={businessUnit}
                  onChange={(e) => {
                    setBusinessUnit(e.target.value);
                    wizard.onUpstreamChange('orgSlice');
                  }}
                  sx={{ minWidth: 220 }}
                >
                  {['All Business Units', '000 - HQ', '201 - Field Ops'].map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Typography variant="subtitle2" mb={1}>Vendor-specific options</Typography>
              <Stack direction="row" gap={2} flexWrap="wrap">
                <TextField
                  select
                  label="Include benched instructors"
                  size="small"
                  value={includeBenched}
                  onChange={(e) => {
                    setIncludeBenched(e.target.value);
                    wizard.onUpstreamChange('syncType');
                  }}
                  sx={{ minWidth: 240 }}
                >
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                </TextField>
              </Stack>
            </Box>
          );
        }

        if (id === 'map') {
          return (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Daxko employees mapped to Netchex. Unmapped rows are excluded from import; map them or accept exclusion.
              </Typography>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Daxko Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Netchex Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {EMPLOYEES.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {e.externalId || `daxko_${e.id}`}
                        </TableCell>
                        <TableCell>{e.name}</TableCell>
                        <TableCell align="right">
                          {e.externalId ? (
                            <Chip
                              size="small"
                              icon={<CheckCircleIcon />}
                              label="Mapped"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip size="small" label="Unmapped" color="warning" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          );
        }

        if (id === 'review') {
          return <ReviewGrid context="payroll" />;
        }

        // confirm
        return (
          <Box>
            {!committed ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                On confirm, selected rows from Daxko will be written into the active payroll run.
                You can return to this run from <strong>Edit Timesheets</strong> at any time.
              </Alert>
            ) : (
              <Alert
                severity="success"
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ mb: 2 }}
              >
                Done. Daxko data is now in this payroll run.
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" mb={1}>Summary</Typography>
              <Stack gap={0.5}>
                <Typography variant="body2"><strong>Source:</strong> Daxko Club Automation (API on-demand)</Typography>
                <Typography variant="body2"><strong>Date range:</strong> {dateFrom} → {dateTo}</Typography>
                <Typography variant="body2"><strong>Division:</strong> {division}</Typography>
                <Typography variant="body2"><strong>Business Unit:</strong> {businessUnit}</Typography>
                <Typography variant="body2"><strong>Include benched:</strong> {includeBenched}</Typography>
                <Typography variant="body2"><strong>Rows to import:</strong> 6 (1 error excluded)</Typography>
              </Stack>
              <Stack direction="row" gap={1} mt={3}>
                {!committed ? (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    onClick={() => setCommitted(true)}
                  >
                    Confirm and import to payroll
                  </button>
                ) : (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: '#43a047',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    onClick={() => (window.location.href = '/')}
                  >
                    Return to Edit Timesheets
                  </button>
                )}
              </Stack>
            </Paper>
          </Box>
        );
      }}
    />
  );
}
