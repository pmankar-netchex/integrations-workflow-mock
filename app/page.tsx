'use client';
import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { EMPLOYEES, PAYROLL_GROUPS, DIVISIONS, BUSINESS_UNITS, DEPARTMENTS } from './lib/mockData';

export default function EditTimesheetsPage() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
        <Typography variant="h1" component="h1">Edit Timesheets</Typography>
        <Button startIcon={<SettingsOutlinedIcon />} size="small" variant="outlined" sx={{ ml: 1 }}>
          Timesheet Settings
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          bgcolor: '#f3f8ff',
          borderColor: '#bcd7f5',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Need to bring in time, payroll, or vendor data for this run?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            One entry point — files, vendor APIs, scheduled syncs, and Netchex modules. Replaces the old{' '}
            <em>Move To Pay</em> / <em>Import Time</em> / <em>Import Batch Data</em> / <em>Import Payroll Data</em> buttons.
          </Typography>
        </Box>
        <Tooltip title="Open the integrations marketplace and pick a data source">
          <Button
            component={Link}
            href="/marketplace/"
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add data to this run
          </Button>
        </Tooltip>
      </Paper>

      <Stack direction="row" gap={1} flexWrap="wrap" mb={3}>
        <Button startIcon={<CardGiftcardOutlinedIcon />} size="small" variant="text">
          Add Non-Discretionary Bonus
        </Button>
        <Box flex={1} />
        <Button startIcon={<SaveOutlinedIcon />} size="small" variant="outlined">
          Save Timesheets
        </Button>
        <Button startIcon={<KeyboardReturnIcon />} size="small" variant="outlined">
          Return to Create Timesheets
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h3" mb={1.5}>Filter Criteria</Typography>
        <Stack direction="row" gap={2} flexWrap="wrap">
          <TextField select label="Payroll Group" size="small" defaultValue={PAYROLL_GROUPS[0]} sx={{ minWidth: 220 }}>
            {PAYROLL_GROUPS.map((g) => (<MenuItem key={g} value={g}>{g}</MenuItem>))}
          </TextField>
          <TextField label="Last Name" size="small" sx={{ minWidth: 220 }} />
          <TextField select label="Division" size="small" defaultValue={DIVISIONS[0]} sx={{ minWidth: 220 }}>
            {DIVISIONS.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
          </TextField>
          <TextField select label="Business Unit" size="small" defaultValue={BUSINESS_UNITS[0]} sx={{ minWidth: 220 }}>
            {BUSINESS_UNITS.map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
          </TextField>
          <TextField select label="Department" size="small" defaultValue={DEPARTMENTS[0]} sx={{ minWidth: 220 }}>
            {DEPARTMENTS.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
          </TextField>
        </Stack>
      </Paper>

      <Stack direction="row" gap={1} mb={1} alignItems="center">
        <Box flex={1} />
        <Chip label="Data Selected" size="small" sx={{ bgcolor: '#cfe9f1' }} />
        <Chip label="Data Changed" size="small" sx={{ bgcolor: '#fff7c2' }} />
        <Chip label="Data Not Changed" size="small" variant="outlined" />
      </Stack>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fa' }}>
              <TableCell sx={{ fontWeight: 600 }}>Employee Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Div / Bus / Dep</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Unit Rate</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Regular</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Overtime</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Bonus</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Holiday</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Vacation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {EMPLOYEES.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Box component="span" sx={{ color: '#1976d2', fontSize: 13 }}>{e.name}</Box>
                    <PersonIcon sx={{ fontSize: 14, color: '#999' }} />
                  </Stack>
                </TableCell>
                <TableCell>{e.divBusDep}</TableCell>
                <TableCell align="right">${e.unitRate.toFixed(2)}</TableCell>
                <TableCell align="right">{e.regular || 0}</TableCell>
                <TableCell align="right">{e.overtime || 0}</TableCell>
                <TableCell align="right">{e.bonus || 0}</TableCell>
                <TableCell align="right">{e.holiday || 0}</TableCell>
                <TableCell align="right">{e.vacation || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Total Number of Employees: {EMPLOYEES.length}
      </Typography>
    </Box>
  );
}
