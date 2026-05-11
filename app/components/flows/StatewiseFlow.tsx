'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useWizardState } from '../../lib/useWizardState';
import WizardShell from '../WizardShell';
import ReviewGrid from '../ReviewGrid';

export default function StatewiseFlow() {
  const wizard = useWizardState({
    steps: [
      { id: 'configure', label: 'Configure', state: 'idle' },
      { id: 'review', label: 'Review', state: 'idle' },
      { id: 'confirm', label: 'Confirm', state: 'idle' },
    ],
  });
  const [employeeIdType, setEmployeeIdType] = React.useState('');
  const [filename, setFilename] = React.useState<string | null>(null);
  const [includeYTD, setIncludeYTD] = React.useState('No');
  const [committed, setCommitted] = React.useState(false);

  React.useEffect(() => {
    if (filename && employeeIdType) {
      wizard.setStepState('configure', 'ready');
      wizard.setStepState('review', 'ready');
    } else {
      wizard.setStepState('configure', 'idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename, employeeIdType]);

  return (
    <WizardShell
      title="Statewise Payroll Import"
      subtitle="Upload the Statewise export — column mapping is pre-built. No manual mapping needed."
      vendorBadge={{ label: 'Statewise', color: '#ef6c00', initial: 'S' }}
      steps={wizard.steps}
      activeStep={wizard.activeStep}
      canAdvance={wizard.canAdvance && (wizard.activeStep !== 'configure' || (!!filename && !!employeeIdType))}
      goNext={wizard.goNext}
      goPrev={wizard.goPrev}
      goTo={wizard.goTo}
      retryStep={wizard.retryStep}
      armFailure={wizard.armFailure}
      renderStep={(id) => {
        if (id === 'configure') {
          return (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Statewise files are pre-mapped: as long as you tell us which Employee ID field they use, we’ll handle the rest.
                If your file format changes, contact onboarding to refresh the layout.
              </Alert>

              <TextField
                select
                label="Employee ID type"
                size="small"
                required
                value={employeeIdType}
                onChange={(e) => {
                  setEmployeeIdType(e.target.value);
                  if (filename) wizard.onUpstreamChange('mapping');
                }}
                sx={{ minWidth: 320, mb: 3 }}
                helperText="Select the Employee ID used in the file"
              >
                <MenuItem value="netchex">Netchex Employee ID</MenuItem>
                <MenuItem value="ssn">SSN (last 4)</MenuItem>
                <MenuItem value="external">Statewise External ID</MenuItem>
              </TextField>

              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  bgcolor: !employeeIdType ? '#fafbfc' : filename ? '#e8f5e9' : '#fafbfc',
                  mb: 2,
                }}
              >
                {!employeeIdType ? (
                  <Stack alignItems="center" gap={1}>
                    <CloudUploadIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.disabled">Choose your selections above</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Complete all required selections above to enable file upload
                    </Typography>
                  </Stack>
                ) : filename ? (
                  <Stack alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="body2"><strong>{filename}</strong> uploaded</Typography>
                    <Button size="small" onClick={() => setFilename(null)}>Replace file</Button>
                  </Stack>
                ) : (
                  <Stack alignItems="center" gap={1}>
                    <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Drop your Statewise export here or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Only Excel files (.xlsx, .xls) are supported
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setFilename('statewise-payroll-2026-05.xlsx')}
                    >
                      Choose file
                    </Button>
                  </Stack>
                )}
              </Paper>

              {filename && (
                <TextField
                  select
                  label="Include YTD adjustments"
                  size="small"
                  value={includeYTD}
                  onChange={(e) => {
                    setIncludeYTD(e.target.value);
                    wizard.onUpstreamChange('mapping');
                  }}
                  sx={{ minWidth: 280 }}
                  helperText="Statewise-specific: pulls year-to-date adjustment rows when set to Yes."
                >
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                </TextField>
              )}
            </Box>
          );
        }

        if (id === 'review') {
          return <ReviewGrid context="payroll" />;
        }

        return (
          <Box>
            {!committed ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                On confirm, the selected Statewise rows will be written into the active payroll run.
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                Done. Statewise data is now in this payroll run.
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" mb={1}>Summary</Typography>
              <Stack gap={0.5}>
                <Typography variant="body2"><strong>Source:</strong> Statewise (specific-vendor file)</Typography>
                <Typography variant="body2"><strong>File:</strong> {filename}</Typography>
                <Typography variant="body2"><strong>Employee ID type:</strong> {employeeIdType}</Typography>
                <Typography variant="body2"><strong>Include YTD:</strong> {includeYTD}</Typography>
                <Typography variant="body2"><strong>Rows to import:</strong> 6 (1 error excluded)</Typography>
              </Stack>
              <Stack direction="row" gap={1} mt={3}>
                <Chip size="small" label={committed ? 'Imported' : 'Pending'} color={committed ? 'success' : 'default'} />
                <Box flex={1} />
                {!committed ? (
                  <Button variant="contained" onClick={() => setCommitted(true)}>Confirm and import</Button>
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
