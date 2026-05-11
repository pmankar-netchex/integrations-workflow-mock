'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const STEPS = ['Import Settings', 'Employee Settings', 'Review and Import'];

export default function DealertrackEmbed() {
  const [active] = React.useState(0); // legacy screen — only step 1 is reproduced here
  const [includeMode, setIncludeMode] = React.useState('Tech Time');
  const [openRepairOrders, setOpenRepairOrders] = React.useState('No');

  return (
    <Box>
      <Button component={Link} href="/marketplace/" startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 1 }}>
        Select Another Integration
      </Button>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Legacy embed.</strong> This is the existing <em>Import Batch Data</em> page reproduced as-is.
        Per spec §11 we deep-link to it from the marketplace until the rewrite. Functional behavior is unchanged.
      </Alert>

      <Stack direction="row" alignItems="center" gap={2} mb={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 1,
            bgcolor: '#37474f',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          DT
        </Box>
        <Typography variant="h1">Import Batch Data</Typography>
      </Stack>

      <Stack direction="row" gap={3} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: '#424242',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              1
            </Box>
            <Typography variant="h2">Import Settings</Typography>
          </Stack>

          <Typography variant="subtitle2" color="primary" mb={1}>Basic Info</Typography>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ fontSize: 13 }}>What would you like to include in this batch?</FormLabel>
            <RadioGroup row value={includeMode} onChange={(e) => setIncludeMode(e.target.value)}>
              {['Tech Time', 'Sales Commissions', 'Schedule Import'].map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio size="small" />}
                  label={opt}
                  sx={{
                    border: '1px solid #d0d7de',
                    px: 1,
                    mr: 1,
                    borderRadius: 1,
                    bgcolor: includeMode === opt ? '#e3f0fd' : 'transparent',
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Typography variant="caption" color="text.secondary">Date Range</Typography>
          <Stack direction="row" gap={2} mb={3} mt={0.5}>
            <TextField type="text" size="small" placeholder="From - To" sx={{ minWidth: 280 }} />
          </Stack>

          <Typography variant="subtitle2" color="primary" mb={1.5}>Batch Settings</Typography>
          <Stack gap={2} sx={{ maxWidth: 360, mb: 3 }}>
            <TextField select size="small" label="Divisions" defaultValue="All Divisions">
              <MenuItem value="All Divisions">All Divisions</MenuItem>
            </TextField>
            <TextField select size="small" label="Business Units" defaultValue="All Business Units">
              <MenuItem value="All Business Units">All Business Units</MenuItem>
            </TextField>
            <TextField select size="small" label="Departments" defaultValue="All Departments">
              <MenuItem value="All Departments">All Departments</MenuItem>
            </TextField>
            <TextField select size="small" label="Payroll Groups" defaultValue="All Payroll Groups">
              <MenuItem value="All Payroll Groups">All Payroll Groups</MenuItem>
            </TextField>
          </Stack>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel sx={{ fontSize: 13 }}>Do you want to include open repair orders?</FormLabel>
            <RadioGroup row value={openRepairOrders} onChange={(e) => setOpenRepairOrders(e.target.value)}>
              {['Yes', 'No'].map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio size="small" />}
                  label={opt}
                  sx={{
                    border: '1px solid #d0d7de',
                    px: 1.5,
                    mr: 1,
                    borderRadius: 1,
                    bgcolor: openRepairOrders === opt ? '#e3f0fd' : 'transparent',
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Stack direction="row" gap={1}>
            <Button variant="contained">Continue</Button>
            <Button variant="text">Cancel</Button>
          </Stack>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, width: 240, flexShrink: 0, bgcolor: '#f7f9fc' }}>
          <Typography variant="overline" color="text.secondary">Track Your Progress</Typography>
          <Stack mt={1} gap={0.5}>
            {STEPS.map((s, i) => (
              <Box
                key={s}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: i === active ? '#e3f0fd' : 'transparent',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: i === active ? 600 : 400 }}>
                  {s}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
