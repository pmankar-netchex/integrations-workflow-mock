'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useWizardState } from '../../lib/useWizardState';
import WizardShell from '../WizardShell';
import ReviewGrid from '../ReviewGrid';

export default function NetchexInternalFlow({
  context,
}: {
  context: 'payroll' | 'time';
}) {
  const wizard = useWizardState({
    steps: [
      { id: 'review', label: 'Review', state: 'idle' },
      { id: 'confirm', label: 'Confirm', state: 'idle' },
    ],
  });
  const [committed, setCommitted] = React.useState(false);

  React.useEffect(() => {
    wizard.setStepState('review', 'ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceName = context === 'payroll' ? 'Netchex Payroll module' : 'Netchex Time & Attendance';
  const initial = context === 'payroll' ? 'N' : 'T';
  const color = context === 'payroll' ? '#43a047' : '#0277bd';

  return (
    <WizardShell
      title={sourceName}
      subtitle={
        context === 'payroll'
          ? 'Pull payroll data already entered in the Payroll module into this run.'
          : 'Move T&A periods into pay-ready timesheets without leaving this run.'
      }
      vendorBadge={{ label: sourceName, color, initial }}
      steps={wizard.steps}
      activeStep={wizard.activeStep}
      canAdvance={wizard.canAdvance}
      goNext={wizard.goNext}
      goPrev={wizard.goPrev}
      goTo={wizard.goTo}
      retryStep={wizard.retryStep}
      armFailure={wizard.armFailure}
      renderStep={(id) => {
        if (id === 'review') {
          return (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                {context === 'payroll'
                  ? 'These are the rows currently in the Payroll module for this run. Configuration is inherited from the module — nothing to set here.'
                  : 'These are the T&A periods currently associated with this run. Configuration is inherited from T&A — nothing to set here.'}
              </Alert>
              <ReviewGrid context={context} />
            </Box>
          );
        }

        return (
          <Box>
            {!committed ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {context === 'payroll'
                  ? 'On confirm, selected rows will be applied to this payroll run.'
                  : 'On confirm, this data will be moved into pay-ready timesheets — equivalent of the legacy Move To Pay step happens automatically.'}
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                Done. {context === 'payroll' ? 'Payroll module data is in this run.' : 'T&A data is now in pay-ready timesheets.'}
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" mb={1}>Summary</Typography>
              <Stack gap={0.5}>
                <Typography variant="body2"><strong>Source:</strong> {sourceName}</Typography>
                <Typography variant="body2"><strong>Rows to import:</strong> 6 (1 error excluded)</Typography>
              </Stack>
              <Stack direction="row" gap={1} mt={3}>
                <Chip size="small" label={committed ? 'Imported' : 'Pending'} color={committed ? 'success' : 'default'} />
                <Box flex={1} />
                {!committed ? (
                  <Button variant="contained" onClick={() => setCommitted(true)}>
                    {context === 'payroll' ? 'Confirm — apply to payroll' : 'Confirm — move to pay-ready'}
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
