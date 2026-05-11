'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Integration } from '../lib/integrations';
import { useConnections, describeStatus } from '../lib/connectionStore';

const AUTH_LABELS: Record<string, string> = {
  oauth2: 'OAuth 2.0',
  apikey: 'API key',
  basic: 'Username + password',
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return iso;
  const mins = Math.round(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export default function ConnectScreen({ integration }: { integration: Integration }) {
  const schema = integration.connection!;
  const router = useRouter();
  const { hydrated, get, update } = useConnections();
  const record = get(integration.slug);

  const isExisting = record.status === 'connected' || record.status === 'error';

  const [values, setValues] = React.useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = React.useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = React.useState<'idle' | 'testing' | 'pass' | 'fail'>('idle');
  const [testMessage, setTestMessage] = React.useState<string | null>(null);
  const [armFailNext, setArmFailNext] = React.useState(false);
  const [savedJustNow, setSavedJustNow] = React.useState(false);

  // Hydrate form from saved record once we have client storage
  React.useEffect(() => {
    if (!hydrated) return;
    setValues(record.values || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Editing invalidates previous test result
    if (testStatus !== 'idle') {
      setTestStatus('idle');
      setTestMessage(null);
    }
  };

  const allRequiredFilled = schema.fields
    .filter((f) => f.required)
    .every((f) => (values[f.key] ?? '').trim().length > 0);

  const runTest = () => {
    setTestStatus('testing');
    setTestMessage(null);
    const willFail = armFailNext;
    if (willFail) setArmFailNext(false);
    window.setTimeout(() => {
      if (willFail) {
        setTestStatus('fail');
        if (schema.authType === 'oauth2') {
          setTestMessage(
            'OAuth token request rejected (HTTP 401: invalid_client). Double-check Client ID and Secret, and confirm the region matches your tenant.',
          );
        } else if (schema.authType === 'apikey') {
          setTestMessage('Request rejected (HTTP 403: forbidden). The API key may be revoked or scoped to a different account.');
        } else {
          setTestMessage('Sign-in failed (HTTP 401). Verify the service-account credentials and that the account is not locked.');
        }
      } else {
        setTestStatus('pass');
        if (schema.authType === 'oauth2') {
          setTestMessage('Token issued successfully. Tenant metadata returned 1 organization.');
        } else if (schema.authType === 'apikey') {
          setTestMessage('Returned 4 sites for this account.');
        } else {
          setTestMessage('Sign-in successful. Webhook receiver is reachable.');
        }
      }
    }, 1300 + Math.random() * 500);
  };

  const save = (force = false) => {
    const masked: Record<string, string> = { ...values };
    schema.fields.forEach((f) => {
      if (f.secret && masked[f.key]) masked[f.key] = '••••••••';
    });
    update(integration.slug, {
      status: testStatus === 'pass' ? 'connected' : force ? 'connected' : record.status,
      lastTested: testStatus === 'pass' ? new Date().toISOString() : record.lastTested,
      lastError: testStatus === 'pass' ? undefined : record.lastError,
      values: masked,
    });
    setSavedJustNow(true);
    window.setTimeout(() => router.push(`/flow/${integration.slug}/`), 700);
  };

  const disconnect = () => {
    update(integration.slug, {
      status: 'not-connected',
      lastTested: undefined,
      lastError: undefined,
      values: {},
    });
    setValues({});
    setTestStatus('idle');
    setTestMessage(null);
  };

  const status = describeStatus(record.status);

  return (
    <Box>
      <Button component={Link} href="/marketplace/" startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 1 }}>
        Back to integrations
      </Button>

      <Stack direction="row" alignItems="center" gap={2} mb={0.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: integration.color || '#5e35b1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {integration.initial || integration.name[0]}
        </Box>
        <Box>
          <Typography variant="h1">{isExisting ? `Manage ${integration.name} connection` : `Connect ${integration.name}`}</Typography>
          <Typography variant="body2" color="text.secondary">
            {isExisting
              ? 'Rotate credentials, re-test, or disconnect.'
              : `One-time setup. After this, you'll see ${integration.name} in the marketplace as a normal data source.`}
          </Typography>
        </Box>
        <Box flex={1} />
        <Chip
          label={status.label}
          color={status.color === 'default' ? undefined : status.color}
          variant={status.color === 'default' ? 'outlined' : 'filled'}
          size="small"
        />
      </Stack>

      <Stack direction="row" gap={3} alignItems="flex-start" mt={3}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {record.status === 'error' && record.lastError && (
            <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ mb: 2 }}>
              <strong>Last sync reported a problem.</strong> {record.lastError}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Chip label={`Auth: ${AUTH_LABELS[schema.authType]}`} size="small" />
              {schema.docsUrl && (
                <Button
                  size="small"
                  variant="text"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  href={schema.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vendor API docs
                </Button>
              )}
            </Stack>

            <Stack gap={2.5}>
              {schema.fields.map((field) => {
                const isPassword = field.type === 'password';
                const reveal = !!showSecret[field.key];
                const inputType = isPassword && !reveal ? 'password' : 'text';
                const showCopy = field.type === 'url' && (values[field.key] ?? '').length > 0;

                if (field.type === 'select') {
                  return (
                    <TextField
                      key={field.key}
                      select
                      label={`${field.label}${field.required ? ' *' : ''}`}
                      size="small"
                      value={values[field.key] ?? ''}
                      onChange={(e) => setField(field.key, e.target.value)}
                      helperText={field.helperText}
                      sx={{ maxWidth: 480 }}
                    >
                      {(field.options ?? []).map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  );
                }

                return (
                  <TextField
                    key={field.key}
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    size="small"
                    type={inputType}
                    value={values[field.key] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.key, e.target.value)}
                    helperText={field.helperText}
                    sx={{ maxWidth: 480 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {isPassword && (
                            <IconButton
                              size="small"
                              onClick={() => setShowSecret((s) => ({ ...s, [field.key]: !s[field.key] }))}
                              edge="end"
                              tabIndex={-1}
                            >
                              {reveal ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                          )}
                          {showCopy && (
                            <IconButton
                              size="small"
                              edge="end"
                              tabIndex={-1}
                              onClick={() => navigator.clipboard?.writeText(values[field.key] ?? '')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                );
              })}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography variant="overline" color="text.secondary">Connection test</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {schema.testDescription}
              </Typography>

              {testStatus === 'testing' && <LinearProgress sx={{ mt: 1, mb: 1 }} />}
              {testStatus === 'pass' && (
                <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ mt: 1, mb: 1 }}>
                  {testMessage}
                </Alert>
              )}
              {testStatus === 'fail' && (
                <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ mt: 1, mb: 1 }}>
                  {testMessage}
                </Alert>
              )}

              <Stack direction="row" gap={1} alignItems="center" mt={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={runTest}
                  disabled={!allRequiredFilled || testStatus === 'testing'}
                >
                  {testStatus === 'testing' ? 'Testing…' : 'Test connection'}
                </Button>
                <Tooltip title="Demo helper — arms the next test to fail so you can see the error path. Not visible in product.">
                  <Button size="small" variant="text" color="warning" onClick={() => setArmFailNext(true)}>
                    Demo: simulate test failure
                  </Button>
                </Tooltip>
                {armFailNext && (
                  <Chip size="small" icon={<WarningAmberIcon />} label="Next test will fail" color="warning" />
                )}
                <Box flex={1} />
                <Button
                  variant="contained"
                  onClick={() => save(false)}
                  disabled={testStatus !== 'pass' || savedJustNow}
                >
                  {savedJustNow ? 'Saved — opening flow…' : 'Save and continue'}
                </Button>
              </Stack>

              {testStatus === 'fail' && (
                <Box sx={{ mt: 2 }}>
                  <Tooltip title="Saves credentials without a passing test. Use only when you’ve fixed something on the vendor side and want to retry from the flow.">
                    <Button
                      variant="text"
                      size="small"
                      color="warning"
                      onClick={() => save(true)}
                    >
                      Save anyway (skip test)
                    </Button>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Paper>

          {isExisting && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: '#ffcdd2' }}>
              <Stack direction="row" alignItems="center" gap={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2">Disconnect this integration</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Removes credentials. Existing payroll runs are untouched, but new pulls will fail until you reconnect.
                  </Typography>
                </Box>
                <Button color="error" variant="outlined" startIcon={<LinkOffIcon />} onClick={disconnect}>
                  Disconnect
                </Button>
              </Stack>
            </Paper>
          )}
        </Box>

        <Paper variant="outlined" sx={{ p: 2, width: 260, flexShrink: 0, bgcolor: '#f7f9fc' }}>
          <Typography variant="overline" color="text.secondary">Connection state</Typography>
          <Stack mt={1} gap={1.25}>
            <Box>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Box>
                <Chip
                  size="small"
                  label={status.label}
                  color={status.color === 'default' ? undefined : status.color}
                  variant={status.color === 'default' ? 'outlined' : 'filled'}
                />
              </Box>
            </Box>
            {record.lastTested && (
              <Box>
                <Typography variant="caption" color="text.secondary">Last successful test</Typography>
                <Typography variant="body2">{relativeTime(record.lastTested)}</Typography>
              </Box>
            )}
            {record.webhookUrl && (
              <Box>
                <Typography variant="caption" color="text.secondary">Webhook URL (paste into vendor)</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', display: 'block' }}>
                  {record.webhookUrl}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Auth method</Typography>
              <Typography variant="body2">{AUTH_LABELS[schema.authType]}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
