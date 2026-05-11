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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useWizardState } from '../../lib/useWizardState';
import WizardShell from '../WizardShell';
import ReviewGrid from '../ReviewGrid';

type Format = 'long' | 'wide';
const NETCHEX_FIELDS = ['Employee ID', 'Earnings Code', 'Amount', 'Hours', 'Date', 'Memo'];

export default function GenericFileFlow({
  context,
}: {
  context: 'payroll' | 'time';
}) {
  const wizard = useWizardState();
  const [format, setFormat] = React.useState<Format>('long');
  const [employeeIdType, setEmployeeIdType] = React.useState('Netchex Employee ID');
  const [filename, setFilename] = React.useState<string | null>(null);
  const [deleteExisting, setDeleteExisting] = React.useState('No');
  const [committed, setCommitted] = React.useState(false);

  React.useEffect(() => {
    wizard.setStepState('configure', filename ? 'ready' : 'idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename]);

  React.useEffect(() => {
    if (filename) {
      wizard.setStepState('map', 'ready');
      wizard.setStepState('review', 'ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename]);

  return (
    <WizardShell
      title={`Generic ${context} file`}
      subtitle={
        context === 'payroll'
          ? 'Excel/CSV in Long or Wide layout. Map columns to earnings/deductions.'
          : 'Excel/CSV in the standard time layout. Lands in pay-ready timesheets.'
      }
      vendorBadge={{ label: 'File', color: '#5e35b1', initial: 'F' }}
      steps={wizard.steps}
      activeStep={wizard.activeStep}
      canAdvance={wizard.canAdvance && (wizard.activeStep !== 'configure' || !!filename)}
      goNext={wizard.goNext}
      goPrev={wizard.goPrev}
      goTo={wizard.goTo}
      retryStep={wizard.retryStep}
      armFailure={wizard.armFailure}
      renderStep={(id) => {
        if (id === 'configure') {
          return (
            <Box>
              {context === 'payroll' && (
                <FormControl sx={{ mb: 3 }}>
                  <FormLabel>Layout</FormLabel>
                  <RadioGroup
                    row
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value as Format);
                      if (filename) wizard.onUpstreamChange('file');
                    }}
                  >
                    <FormControlLabel value="long" control={<Radio />} label="Long (one earnings code per row)" />
                    <FormControlLabel value="wide" control={<Radio />} label="Wide (one employee per row, columns per code)" />
                  </RadioGroup>
                </FormControl>
              )}

              <TextField
                select
                label="Employee ID type"
                size="small"
                value={employeeIdType}
                onChange={(e) => {
                  setEmployeeIdType(e.target.value);
                  if (filename) wizard.onUpstreamChange('mapping');
                }}
                sx={{ minWidth: 280, mb: 3 }}
                helperText="Which ID does the file use to identify employees?"
              >
                {['Netchex Employee ID', 'SSN (last 4)', 'External ID', 'Email'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>

              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  bgcolor: filename ? '#e8f5e9' : '#fafbfc',
                  mb: 2,
                }}
              >
                {filename ? (
                  <Stack alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="body2"><strong>{filename}</strong> uploaded</Typography>
                    <Button size="small" onClick={() => setFilename(null)}>Replace file</Button>
                  </Stack>
                ) : (
                  <Stack alignItems="center" gap={1}>
                    <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Drop your file here or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Only Excel files (.xlsx, .xls) are supported
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setFilename('payroll-week-18.xlsx')}
                    >
                      Choose file
                    </Button>
                  </Stack>
                )}
              </Paper>

              {context === 'payroll' && filename && (
                <TextField
                  select
                  label="Replace existing rows for this period?"
                  size="small"
                  value={deleteExisting}
                  onChange={(e) => {
                    setDeleteExisting(e.target.value);
                    wizard.onUpstreamChange('mapping');
                  }}
                  sx={{ minWidth: 320 }}
                  helperText="Yes = clear pre-existing rows in this period before import."
                >
                  <MenuItem value="No">No — append</MenuItem>
                  <MenuItem value="Yes">Yes — clear and replace</MenuItem>
                </TextField>
              )}
            </Box>
          );
        }

        if (id === 'map') {
          return (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                We detected these columns in <strong>{filename}</strong>. Confirm or adjust the mapping to Netchex fields.
                Changing a mapping will refresh the preview automatically.
              </Typography>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Source column</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sample</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Maps to</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { src: 'EMP_ID', sample: 'EXT-1001', target: 'Employee ID' },
                      { src: 'CODE', sample: 'REG', target: 'Earnings Code' },
                      { src: 'HRS', sample: '80.00', target: 'Hours' },
                      { src: 'AMT', sample: '4280.00', target: 'Amount' },
                      { src: 'PAY_DATE', sample: '2026-05-05', target: 'Date' },
                    ].map((r) => (
                      <TableRow key={r.src} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.src}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.sample}</TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            defaultValue={r.target}
                            onChange={() => wizard.onUpstreamChange('mapping')}
                            sx={{ minWidth: 200 }}
                          >
                            {NETCHEX_FIELDS.map((f) => (
                              <MenuItem key={f} value={f}>{f}</MenuItem>
                            ))}
                          </TextField>
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
          return <ReviewGrid context={context} />;
        }

        return (
          <Box>
            {!committed ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {context === 'payroll'
                  ? 'On confirm, selected rows will be written into the active payroll run.'
                  : 'On confirm, this data will be moved into pay-ready timesheets — equivalent of the legacy Move To Pay step happens automatically.'}
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                Done. {context === 'payroll' ? 'File data is in this payroll run.' : 'Time data is now in pay-ready timesheets.'}
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" mb={1}>Summary</Typography>
              <Stack gap={0.5}>
                <Typography variant="body2"><strong>File:</strong> {filename}</Typography>
                {context === 'payroll' && (
                  <Typography variant="body2"><strong>Layout:</strong> {format === 'long' ? 'Long' : 'Wide'}</Typography>
                )}
                <Typography variant="body2"><strong>Employee ID type:</strong> {employeeIdType}</Typography>
                {context === 'payroll' && (
                  <Typography variant="body2"><strong>Replace existing:</strong> {deleteExisting}</Typography>
                )}
                <Typography variant="body2"><strong>Rows to import:</strong> 6 (1 error excluded)</Typography>
              </Stack>
              <Stack direction="row" gap={1} mt={3}>
                <Chip
                  size="small"
                  label={committed ? 'Imported' : 'Pending'}
                  color={committed ? 'success' : 'default'}
                />
                <Box flex={1} />
                {!committed ? (
                  <Button variant="contained" onClick={() => setCommitted(true)}>
                    {context === 'payroll' ? 'Confirm and import' : 'Confirm — move to pay-ready'}
                  </Button>
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
