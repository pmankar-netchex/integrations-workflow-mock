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
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import AddIcon from '@mui/icons-material/Add';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { EMPLOYEES, Employee, PAYROLL_GROUPS, DIVISIONS, BUSINESS_UNITS, DEPARTMENTS } from './lib/mockData';

const PENDING_EMPLOYEES: Employee[] = [
  { id: '9', name: 'CARTER, MIRA', divBusDep: '200 / 201 / 3RD', unitRate: 22.0, regular: 76, overtime: 4, bonus: 0, holiday: 0, vacation: 0, externalId: 'EXT-1009' },
  { id: '10', name: 'OKONKWO, ADAEZE', divBusDep: '000 / 000 / 000', unitRate: 32.5, regular: 80, overtime: 0, bonus: 0, holiday: 8, vacation: 0, externalId: 'EXT-1010' },
];

const REARM_AFTER_MS = 20_000;
const PAY_PERIOD_LABEL = 'May 1 – May 14, 2026';
const RUN_ID = 'Run #4218';

function formatTimeAgo(from: Date, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function DimNum({ value, prefix = '' }: { value: number; prefix?: string }) {
  if (!value) {
    return (
      <Box component="span" sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
        {prefix}0
      </Box>
    );
  }
  return (
    <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {value}
    </Box>
  );
}

export default function EditTimesheetsPage() {
  const [employees, setEmployees] = React.useState<Employee[]>(EMPLOYEES);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(() => new Date(Date.now() - 12 * 60_000));
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [pending, setPending] = React.useState<Employee[]>(PENDING_EMPLOYEES);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const rearmIndexRef = React.useRef(0);

  React.useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(tick);
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      if (pending.length) {
        setEmployees((prev) => {
          const ids = new Set(prev.map((e) => e.id));
          return [...prev, ...pending.filter((e) => !ids.has(e.id))];
        });
      }
      setPending([]);
      setLastRefreshed(new Date());
      setNow(new Date());
      setIsRefreshing(false);
    }, 800);
  }, [isRefreshing, pending]);

  React.useEffect(() => {
    if (pending.length > 0) return;
    const rearm = setTimeout(() => {
      rearmIndexRef.current += 1;
      const i = rearmIndexRef.current;
      setPending([
        {
          id: `live-${i}`,
          name: i % 2 === 0 ? 'NEWHIRE, AVERY' : 'CONTRACTOR, JORDAN',
          divBusDep: '200 / 201 / 3RD',
          unitRate: 18 + i,
          regular: 24 + i * 8,
          overtime: 0,
          bonus: 0,
          holiday: 0,
          vacation: 0,
          externalId: `EXT-${2000 + i}`,
        },
      ]);
    }, REARM_AFTER_MS);
    return () => clearTimeout(rearm);
  }, [pending.length, lastRefreshed]);

  const allSelected = employees.length > 0 && selectedIds.size === employees.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(employees.map((e) => e.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const refreshTooltip = (
    <Stack spacing={0.25} sx={{ py: 0.25 }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Synced {formatTimeAgo(lastRefreshed, now)}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {lastRefreshed.toLocaleString()}
      </Typography>
      {pending.length > 0 && (
        <Typography variant="caption" sx={{ color: '#ffd54f' }}>
          {pending.length} new record{pending.length === 1 ? '' : 's'} available — click to pull in
        </Typography>
      )}
    </Stack>
  );

  return (
    <Box>
      {/* Title row */}
      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" mb={0.75}>
        <Typography variant="h1" component="h1">
          Edit Timesheets
        </Typography>
        <Chip
          size="small"
          label={RUN_ID}
          variant="outlined"
          sx={{ fontWeight: 500, height: 22 }}
        />
      </Stack>

      {/* Meta row */}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={2.5}>
        <Chip
          size="small"
          label={`Pay period · ${PAY_PERIOD_LABEL}`}
          variant="outlined"
          sx={{ height: 22 }}
        />
        <Chip
          size="small"
          label="Draft"
          color="warning"
          sx={{ height: 22, fontWeight: 600 }}
        />
        <Chip
          size="small"
          label={`${employees.length} employees`}
          variant="outlined"
          sx={{ height: 22 }}
        />
        <Box flex={1} />
        <Tooltip arrow title={refreshTooltip}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              border: '1px solid',
              borderColor: pending.length > 0 ? 'warning.light' : 'divider',
              borderRadius: 999,
              bgcolor: pending.length > 0 ? '#fff8e1' : '#fff',
              cursor: isRefreshing ? 'default' : 'pointer',
              transition: 'background-color 120ms ease',
              '&:hover': { bgcolor: isRefreshing ? undefined : 'action.hover' },
            }}
            onClick={isRefreshing ? undefined : handleRefresh}
          >
            <Typography
              variant="caption"
              sx={{
                color: pending.length > 0 ? 'warning.dark' : 'text.secondary',
                fontWeight: pending.length > 0 ? 600 : 400,
                lineHeight: 1,
              }}
            >
              {isRefreshing
                ? 'Refreshing…'
                : pending.length > 0
                ? `${pending.length} new · Synced ${formatTimeAgo(lastRefreshed, now)}`
                : `Synced ${formatTimeAgo(lastRefreshed, now)}`}
            </Typography>
            <Badge
              color="warning"
              variant="dot"
              overlap="circular"
              invisible={pending.length === 0 || isRefreshing}
              sx={{ '& .MuiBadge-badge': { boxShadow: '0 0 0 2px #fff' } }}
            >
              <IconButton
                size="small"
                disabled={isRefreshing}
                aria-label="Refresh timesheet data"
                sx={{ p: 0.25 }}
              >
                {isRefreshing ? (
                  <CircularProgress size={14} thickness={5} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Badge>
          </Box>
        </Tooltip>
        <Button
          startIcon={<SettingsOutlinedIcon />}
          size="small"
          variant="outlined"
        >
          Settings
        </Button>
      </Stack>

      {/* Compressed banner — primary entry point, dismissible */}
      <Collapse in={bannerOpen}>
        <Paper
          variant="outlined"
          sx={{
            mb: 2,
            px: 1.5,
            py: 1,
            bgcolor: '#f3f8ff',
            borderColor: '#bcd7f5',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#1976d2', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>
            Bring in files, vendor APIs, scheduled syncs, or Netchex modules for this run.
          </Typography>
          <Button
            component={Link}
            href="/marketplace/"
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add data
          </Button>
          <IconButton
            size="small"
            onClick={() => setBannerOpen(false)}
            aria-label="Dismiss"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Paper>
      </Collapse>

      {!bannerOpen && (
        <Box sx={{ mb: 2 }}>
          <Button
            component={Link}
            href="/marketplace/"
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
          >
            Add data to this run
          </Button>
        </Box>
      )}

      {/* Filter Criteria */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h3" mb={1.5}>
          Filter Criteria
        </Typography>
        <Stack direction="row" gap={2} flexWrap="wrap">
          <TextField
            select
            label="Payroll Group"
            size="small"
            defaultValue={PAYROLL_GROUPS[0]}
            sx={{ minWidth: 200 }}
          >
            {PAYROLL_GROUPS.map((g) => (
              <MenuItem key={g} value={g}>
                {g === 'All Payroll Groups' ? 'All' : g}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Last Name" size="small" sx={{ minWidth: 200 }} />
          <TextField
            select
            label="Division"
            size="small"
            defaultValue={DIVISIONS[0]}
            sx={{ minWidth: 200 }}
          >
            {DIVISIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d === 'All Divisions' ? 'All' : d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Business Unit"
            size="small"
            defaultValue={BUSINESS_UNITS[0]}
            sx={{ minWidth: 200 }}
          >
            {BUSINESS_UNITS.map((b) => (
              <MenuItem key={b} value={b}>
                {b === 'All Business Units' ? 'All' : b}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Department"
            size="small"
            defaultValue={DEPARTMENTS[0]}
            sx={{ minWidth: 200 }}
          >
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d === 'All Departments' ? 'All' : d}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Selection toolbar OR helper row */}
      <Box
        sx={{
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          mb: 1,
          transition: 'background-color 150ms ease',
          borderRadius: 1,
          px: selectedIds.size > 0 ? 1.5 : 0,
          bgcolor: selectedIds.size > 0 ? '#e8f0fe' : 'transparent',
          border: selectedIds.size > 0 ? '1px solid #c2d6f4' : '1px solid transparent',
        }}
      >
        {selectedIds.size > 0 ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 2 }}>
              {selectedIds.size} selected
            </Typography>
            <Button
              size="small"
              startIcon={<CardGiftcardOutlinedIcon />}
              sx={{ textTransform: 'none' }}
            >
              Apply bonus
            </Button>
            <Button
              size="small"
              startIcon={<CalculateOutlinedIcon />}
              sx={{ textTransform: 'none' }}
            >
              Recalculate
            </Button>
            <Button
              size="small"
              startIcon={<BlockOutlinedIcon />}
              color="warning"
              sx={{ textTransform: 'none' }}
            >
              Exclude
            </Button>
            <Box flex={1} />
            <Button
              size="small"
              onClick={() => setSelectedIds(new Set())}
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Tip: select rows to apply bonuses, recalculate, or exclude in bulk.
          </Typography>
        )}
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fa' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  indeterminate={someSelected}
                  checked={allSelected}
                  onChange={toggleAll}
                  inputProps={{ 'aria-label': 'Select all employees' }}
                />
              </TableCell>
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
            {employees.map((e) => (
              <TableRow key={e.id} hover selected={selectedIds.has(e.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={selectedIds.has(e.id)}
                    onChange={() => toggleOne(e.id)}
                    inputProps={{ 'aria-label': `Select ${e.name}` }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Box component="span" sx={{ color: '#1976d2', fontSize: 13 }}>
                      {e.name}
                    </Box>
                    <PersonIcon sx={{ fontSize: 14, color: '#999' }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                  {e.divBusDep}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  ${e.unitRate.toFixed(2)}
                </TableCell>
                <TableCell align="right"><DimNum value={e.regular} /></TableCell>
                <TableCell align="right"><DimNum value={e.overtime} /></TableCell>
                <TableCell align="right"><DimNum value={e.bonus} /></TableCell>
                <TableCell align="right"><DimNum value={e.holiday} /></TableCell>
                <TableCell align="right"><DimNum value={e.vacation} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Inline legend + count */}
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        sx={{ mt: 1, mb: 2, flexWrap: 'wrap' }}
      >
        <Typography variant="caption" color="text.secondary">
          Row colors:
        </Typography>
        <Chip
          label="Selected"
          size="small"
          sx={{ bgcolor: '#cfe9f1', height: 18, fontSize: 10.5 }}
        />
        <Chip
          label="Changed"
          size="small"
          sx={{ bgcolor: '#fff7c2', height: 18, fontSize: 10.5 }}
        />
        <Chip
          label="Not changed"
          size="small"
          variant="outlined"
          sx={{ height: 18, fontSize: 10.5 }}
        />
        <Box flex={1} />
        <Typography variant="caption" color="text.secondary">
          {employees.length} employees
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        </Typography>
      </Stack>

      {/* Sticky action bar */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          mt: 2,
          mx: -3,
          py: 1.25,
          px: 3,
          bgcolor: '#fff',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          zIndex: 5,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {selectedIds.size === 0
            ? 'No unsaved changes'
            : `${selectedIds.size} selected · unsaved`}
        </Typography>
        <Box flex={1} />
        <Button
          startIcon={<KeyboardReturnIcon />}
          variant="outlined"
          size="medium"
        >
          Return to Create Timesheets
        </Button>
        <Button
          startIcon={<SaveOutlinedIcon />}
          variant="contained"
          size="medium"
        >
          Save Timesheets
        </Button>
      </Box>
    </Box>
  );
}
