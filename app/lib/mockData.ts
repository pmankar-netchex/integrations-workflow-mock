export type Employee = {
  id: string;
  name: string;
  divBusDep: string;
  unitRate: number;
  regular: number;
  overtime: number;
  bonus: number;
  holiday: number;
  vacation: number;
  externalId?: string;
  mapped?: boolean;
};

export const EMPLOYEES: Employee[] = [
  { id: '1', name: 'ACTIVITYMAN, ETHAN', divBusDep: '000 / 000 / 000', unitRate: 51.0, regular: 1568, overtime: 55, bonus: 3530, holiday: 24, vacation: 0, externalId: 'EXT-1001' },
  { id: '2', name: 'LAST NO ACCESS, FIRST', divBusDep: '000 / 000 / 000', unitRate: 25.0, regular: 2210.19, overtime: 12, bonus: 0, holiday: 0, vacation: 0, externalId: 'EXT-1002' },
  { id: '3', name: 'MAJEWSKI, ROBERT', divBusDep: '000 / 000 / 000', unitRate: 0, regular: 0, overtime: 0, bonus: 0, holiday: 0, vacation: 0 },
  { id: '4', name: 'MCTESTERSON, TESTY', divBusDep: '000 / 000 / 000', unitRate: 45.0, regular: 0, overtime: 0, bonus: 0, holiday: 0, vacation: 0, externalId: 'EXT-1003' },
  { id: '5', name: 'USER, TESTING', divBusDep: '000 / 000 / 000', unitRate: 80.0, regular: 240, overtime: 0, bonus: 0, holiday: 0, vacation: 0, externalId: 'EXT-1004' },
  { id: '6', name: 'JONES, JESSICA', divBusDep: '200 / 201 / 3RD', unitRate: 15.0, regular: 0, overtime: 0, bonus: 0, holiday: 0, vacation: 0, externalId: 'EXT-1005' },
  { id: '7', name: 'PARKER, PETER', divBusDep: '200 / 201 / 3RD', unitRate: 16.5, regular: 0, overtime: 0, bonus: 0, holiday: 0, vacation: 0, externalId: 'EXT-1006' },
  { id: '8', name: 'WILSON, WADE', divBusDep: '200 / 201 / 3RD', unitRate: 19.23, regular: 0, overtime: 0, bonus: 0, holiday: 0, vacation: 0 },
];

export const PAYROLL_GROUPS = ['All Payroll Groups', 'Group A', 'Group B', 'Group C'];
export const DIVISIONS = ['All Divisions', '000 - Default', '200 - Service'];
export const BUSINESS_UNITS = ['All Business Units', '000 - HQ', '201 - Field Ops'];
export const DEPARTMENTS = ['All Departments', '000 - Admin', '3RD - Service Floor'];

export type ReviewRow = {
  id: string;
  employee: string;
  externalId: string;
  hoursRegular: number;
  hoursOvertime: number;
  hoursHoliday: number;
  earningsAmount: number;
  status: 'ok' | 'warning' | 'error';
  message?: string;
};

export const REVIEW_ROWS: ReviewRow[] = [
  { id: 'r1', employee: 'ACTIVITYMAN, ETHAN', externalId: 'EXT-1001', hoursRegular: 80, hoursOvertime: 4, hoursHoliday: 0, earningsAmount: 4280, status: 'ok' },
  { id: 'r2', employee: 'LAST NO ACCESS, FIRST', externalId: 'EXT-1002', hoursRegular: 88.4, hoursOvertime: 0, hoursHoliday: 0, earningsAmount: 2210.19, status: 'ok' },
  { id: 'r3', employee: 'JONES, JESSICA', externalId: 'EXT-1005', hoursRegular: 76, hoursOvertime: 2, hoursHoliday: 8, earningsAmount: 1320, status: 'warning', message: 'Holiday rate not set on master' },
  { id: 'r4', employee: 'PARKER, PETER', externalId: 'EXT-1006', hoursRegular: 80, hoursOvertime: 0, hoursHoliday: 0, earningsAmount: 1320, status: 'ok' },
  { id: 'r5', employee: 'USER, TESTING', externalId: 'EXT-1004', hoursRegular: 24, hoursOvertime: 0, hoursHoliday: 0, earningsAmount: 1920, status: 'ok' },
  { id: 'r6', employee: 'MCTESTERSON, TESTY', externalId: 'EXT-1003', hoursRegular: 40, hoursOvertime: 0, hoursHoliday: 0, earningsAmount: 1800, status: 'ok' },
  { id: 'r7', employee: 'UNKNOWN, EXTERNAL', externalId: 'EXT-9999', hoursRegular: 0, hoursOvertime: 0, hoursHoliday: 0, earningsAmount: 0, status: 'error', message: 'External ID not found in Netchex' },
];

export const LOCATION_MAPPINGS = [
  { external: 'Store #4501 — Lakefront', internal: '200 - Service' },
  { external: 'Store #4502 — Riverside', internal: '200 - Service' },
  { external: 'Store #4503 — Eastgate', internal: '' },
  { external: 'Store #4504 — Northridge', internal: '200 - Service' },
];
