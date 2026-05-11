'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { REVIEW_ROWS, ReviewRow } from '../lib/mockData';

const PENDING_REFRESH_ROWS: ReviewRow[] = [
  { id: 'r8', employee: 'WILSON, WADE', externalId: 'EXT-1007', hoursRegular: 72, hoursOvertime: 6, hoursHoliday: 0, earningsAmount: 1520.34, status: 'ok' },
  { id: 'r9', employee: 'MAJEWSKI, ROBERT', externalId: 'EXT-1008', hoursRegular: 80, hoursOvertime: 0, hoursHoliday: 8, earningsAmount: 2080, status: 'warning', message: 'Holiday rate not set on master' },
];

const REARM_AFTER_MS = 20_000;

function formatTimeAgo(from: Date, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

const STATUS_COLORS: Record<ReviewRow['status'], string> = {
  ok: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
};

const COLUMNS: GridColDef<ReviewRow>[] = [
  { field: 'employee', headerName: 'Employee', flex: 1.2 },
  { field: 'externalId', headerName: 'External ID', width: 130 },
  { field: 'hoursRegular', headerName: 'Reg hrs', width: 90, type: 'number' },
  { field: 'hoursOvertime', headerName: 'OT hrs', width: 90, type: 'number' },
  { field: 'hoursHoliday', headerName: 'Hol hrs', width: 90, type: 'number' },
  {
    field: 'earningsAmount',
    headerName: 'Earnings',
    width: 120,
    type: 'number',
    valueFormatter: (v: number | undefined) => (typeof v === 'number' ? `$${v.toFixed(2)}` : ''),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 220,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ height: '100%' }}>
        <Chip
          size="small"
          label={params.value as string}
          sx={{
            bgcolor: STATUS_COLORS[params.value as ReviewRow['status']],
            color: '#fff',
            height: 18,
            fontSize: 10.5,
            textTransform: 'uppercase',
          }}
        />
        <Typography variant="caption" color="text.secondary" noWrap>
          {params.row.message}
        </Typography>
      </Stack>
    ),
  },
];

export default function ReviewGrid({
  context,
  rows,
}: {
  context: 'payroll' | 'time';
  rows?: ReviewRow[];
}) {
  const initialData = rows ?? REVIEW_ROWS;
  const [data, setData] = React.useState<ReviewRow[]>(initialData);
  const [filter, setFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | ReviewRow['status']>('all');
  const [selection, setSelection] = React.useState<GridRowSelectionModel>(
    initialData.filter((r) => r.status !== 'error').map((r) => r.id),
  );
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(() => new Date(Date.now() - 8 * 60_000));
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [pendingRows, setPendingRows] = React.useState<ReviewRow[]>(PENDING_REFRESH_ROWS);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(tick);
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      if (pendingRows.length) {
        setData((prev) => {
          const existing = new Set(prev.map((r) => r.id));
          return [...prev, ...pendingRows.filter((r) => !existing.has(r.id))];
        });
        setSelection((prev) => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const additions = pendingRows.filter((r) => r.status !== 'error').map((r) => r.id);
          return [...prevArr, ...additions];
        });
      }
      setPendingRows([]);
      setLastRefreshed(new Date());
      setNow(new Date());
      setIsRefreshing(false);
    }, 800);
  }, [isRefreshing, pendingRows]);

  React.useEffect(() => {
    if (pendingRows.length > 0) return;
    const rearm = setTimeout(() => {
      setPendingRows([
        {
          id: `r-new-${Date.now()}`,
          employee: 'NEWHIRE, CASEY',
          externalId: `EXT-${1100 + Math.floor(Math.random() * 99)}`,
          hoursRegular: 32,
          hoursOvertime: 0,
          hoursHoliday: 0,
          earningsAmount: 640,
          status: 'ok',
        },
      ]);
    }, REARM_AFTER_MS);
    return () => clearTimeout(rearm);
  }, [pendingRows.length, lastRefreshed]);

  const visibleRows = React.useMemo(() => {
    return data.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!filter) return true;
      const q = filter.toLowerCase();
      return r.employee.toLowerCase().includes(q) || r.externalId.toLowerCase().includes(q);
    });
  }, [data, filter, statusFilter]);

  const selectedCount = Array.isArray(selection) ? selection.length : 0;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        These are the rows that will be applied to {context === 'payroll' ? 'payroll' : 'pay-ready timesheets'}.
        Uncheck any row to exclude it. Filter to focus on warnings or errors.
      </Typography>

      <Stack direction="row" gap={1.5} mb={1.5} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Filter by name or external ID"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="ok">Ok</MenuItem>
          <MenuItem value="warning">Warning</MenuItem>
          <MenuItem value="error">Error</MenuItem>
        </TextField>
        <Box flex={1} />
        <Stack direction="row" gap={1} alignItems="center">
          <Tooltip
            arrow
            title={
              <Stack spacing={0.25} sx={{ py: 0.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Last refreshed {formatTimeAgo(lastRefreshed, now)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {lastRefreshed.toLocaleString()}
                </Typography>
                {pendingRows.length > 0 && (
                  <Typography variant="caption" sx={{ color: '#ffd54f' }}>
                    {pendingRows.length} new record{pendingRows.length === 1 ? '' : 's'} available
                  </Typography>
                )}
              </Stack>
            }
          >
            <Badge
              color="warning"
              variant="dot"
              overlap="circular"
              invisible={pendingRows.length === 0 || isRefreshing}
              sx={{ '& .MuiBadge-badge': { boxShadow: '0 0 0 2px #fff' } }}
            >
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh data"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#fff',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {isRefreshing ? (
                  <CircularProgress size={16} thickness={5} />
                ) : (
                  <RefreshIcon fontSize="small" />
                )}
              </IconButton>
            </Badge>
          </Tooltip>
          <Chip size="small" label={`${selectedCount} selected`} color="primary" />
          <Chip
            size="small"
            label={`${data.filter((r) => r.status === 'warning').length} warnings`}
            sx={{ bgcolor: '#fff3e0' }}
          />
          <Chip
            size="small"
            label={`${data.filter((r) => r.status === 'error').length} errors`}
            sx={{ bgcolor: '#fdecea' }}
          />
        </Stack>
      </Stack>

      <Box sx={{ height: 380 }}>
        <DataGrid
          rows={visibleRows}
          columns={COLUMNS}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) => setSelection(m)}
          hideFooterSelectedRowCount
          density="compact"
          isRowSelectable={(params) => params.row.status !== 'error'}
        />
      </Box>
    </Box>
  );
}
