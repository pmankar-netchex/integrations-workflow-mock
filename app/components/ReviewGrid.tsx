'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { REVIEW_ROWS, ReviewRow } from '../lib/mockData';

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
  const data = rows ?? REVIEW_ROWS;
  const [filter, setFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | ReviewRow['status']>('all');
  const [selection, setSelection] = React.useState<GridRowSelectionModel>(
    data.filter((r) => r.status !== 'error').map((r) => r.id),
  );

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
