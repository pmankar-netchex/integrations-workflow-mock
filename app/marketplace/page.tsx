'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { INTEGRATIONS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, IntegrationCategory } from '../lib/integrations';
import { useConnections, describeStatus } from '../lib/connectionStore';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import LinkIcon from '@mui/icons-material/Link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const CATS: IntegrationCategory[] = [
  'netchex',
  'generic-file',
  'specific-file',
  'api-on-demand',
  'api-scheduled',
];

export default function MarketplacePage() {
  const [query, setQuery] = React.useState('');
  const [activeCat, setActiveCat] = React.useState<IntegrationCategory | 'all'>('all');
  const { get } = useConnections();

  const filtered = INTEGRATIONS.filter((i) => {
    if (activeCat !== 'all' && i.category !== activeCat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.vendor?.toLowerCase().includes(q) ?? false);
  });

  return (
    <Box>
      <Button component={Link} href="/" startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 1 }}>
        Back to Edit Timesheets
      </Button>
      <Typography variant="h1" component="h1">Add data to this run</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Pick a source. Files, vendor APIs, scheduled syncs, and Netchex modules — same review-and-confirm flow for all.
      </Typography>

      <TextField
        size="small"
        fullWidth
        placeholder="Search by vendor or file format (e.g., Daxko, Excel)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2.5, maxWidth: 560 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Stack direction="row" gap={3} alignItems="flex-start">
        <Paper variant="outlined" sx={{ width: 240, p: 1, flexShrink: 0 }}>
          <Typography variant="overline" sx={{ px: 1, color: 'text.secondary' }}>Categories</Typography>
          <List dense disablePadding>
            <ListItemButton selected={activeCat === 'all'} onClick={() => setActiveCat('all')}>
              <ListItemText primary="All sources" />
            </ListItemButton>
            {CATS.map((c) => (
              <ListItemButton key={c} selected={activeCat === c} onClick={() => setActiveCat(c)}>
                <ListItemText
                  primary={CATEGORY_LABELS[c]}
                  secondary={INTEGRATIONS.filter((i) => i.category === c).length + ' available'}
                  primaryTypographyProps={{ fontSize: 13.5 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Box sx={{ flex: 1 }}>
          {activeCat !== 'all' && (
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#fafbfc' }}>
              <Typography variant="subtitle2">{CATEGORY_LABELS[activeCat]}</Typography>
              <Typography variant="caption" color="text.secondary">
                {CATEGORY_DESCRIPTIONS[activeCat]}
              </Typography>
            </Paper>
          )}

          {filtered.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nothing matches that filter. Try a different category or search term.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 1.5,
              }}
            >
              {filtered.map((i) => {
                const conn = i.connection ? get(i.slug) : null;
                const connLabel = conn ? describeStatus(conn.status) : null;
                const needsSetup = !!conn && conn.status === 'not-connected';
                const hasIssue = !!conn && conn.status === 'error';
                const targetHref = needsSetup ? `/connect/${i.slug}/` : `/flow/${i.slug}/`;
                const ctaLabel = i.embed
                  ? 'Open'
                  : needsSetup
                  ? 'Set up connection'
                  : hasIssue
                  ? 'Open (issue)'
                  : 'Configure';
                return (
                  <Paper key={i.slug} variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" gap={1.5} alignItems="flex-start" mb={1}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: i.color || '#5e35b1',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {i.initial || i.name[0]}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">{i.name}</Typography>
                        <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
                          <Chip size="small" label={CATEGORY_LABELS[i.category]} sx={{ fontSize: 10.5, height: 18 }} />
                          {i.context !== 'both' && (
                            <Chip
                              size="small"
                              label={i.context === 'payroll' ? 'Payroll' : 'Time'}
                              sx={{ fontSize: 10.5, height: 18 }}
                              variant="outlined"
                            />
                          )}
                          {i.embed && (
                            <Chip size="small" label="Legacy embed" sx={{ fontSize: 10.5, height: 18 }} variant="outlined" />
                          )}
                          {connLabel && (
                            <Chip
                              size="small"
                              icon={
                                conn?.status === 'connected'
                                  ? <LinkIcon sx={{ fontSize: 12 }} />
                                  : conn?.status === 'error'
                                  ? <ErrorOutlineIcon sx={{ fontSize: 12 }} />
                                  : <LinkOffIcon sx={{ fontSize: 12 }} />
                              }
                              label={connLabel.label}
                              color={connLabel.color === 'default' ? undefined : connLabel.color}
                              variant={connLabel.color === 'default' ? 'outlined' : 'filled'}
                              sx={{ fontSize: 10.5, height: 18 }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 1.5, fontSize: 12.5 }}>
                      {i.blurb}
                    </Typography>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Button size="small" variant="text">Documentation</Button>
                      {i.connection && conn && conn.status !== 'not-connected' && (
                        <Button
                          component={Link}
                          href={`/connect/${i.slug}/`}
                          size="small"
                          variant="text"
                        >
                          Manage
                        </Button>
                      )}
                      <Box flex={1} />
                      <Button
                        component={Link}
                        href={targetHref}
                        size="small"
                        variant="contained"
                        color={hasIssue ? 'warning' : 'primary'}
                      >
                        {ctaLabel}
                      </Button>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
