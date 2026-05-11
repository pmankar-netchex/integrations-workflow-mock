export type IntegrationCategory =
  | 'netchex'
  | 'generic-file'
  | 'specific-file'
  | 'api-on-demand'
  | 'api-scheduled';

export type IntegrationContext = 'payroll' | 'time' | 'both';

export type ConnectionField = {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'url';
  required: boolean;
  options?: string[];
  helperText?: string;
  placeholder?: string;
  /** secret = masked when displaying saved value */
  secret?: boolean;
};

export type ConnectionSchema = {
  authType: 'oauth2' | 'apikey' | 'basic';
  fields: ConnectionField[];
  /** Plain-language description of what gets tested */
  testDescription: string;
  docsUrl?: string;
};

export type Integration = {
  slug: string;
  name: string;
  vendor?: string;
  category: IntegrationCategory;
  context: IntegrationContext;
  blurb: string;
  initial?: string;
  color?: string;
  enabled: boolean;
  /** legacy embed = render the existing screen as-is */
  embed?: boolean;
  /** Required only when category is api-on-demand or api-scheduled */
  connection?: ConnectionSchema;
};

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  netchex: 'Netchex modules',
  'generic-file': 'Generic files',
  'specific-file': 'Specific vendor files',
  'api-on-demand': 'APIs (on-demand)',
  'api-scheduled': 'Scheduled syncs',
};

export const CATEGORY_DESCRIPTIONS: Record<IntegrationCategory, string> = {
  netchex: 'Pull from another Netchex module already in this tenant.',
  'generic-file':
    'Excel or CSV in a generic Netchex layout (Long, Wide, Time). Map columns once, reuse forever.',
  'specific-file': 'Pre-built layouts for specific vendors — drop the file as the vendor exports it.',
  'api-on-demand':
    'Trigger a pull on demand. Credentials and mappings stay configured between runs.',
  'api-scheduled':
    'Vendor pushes data to Netchex on a schedule. Inspect what landed; optionally pull a slice for this run.',
};

export const INTEGRATIONS: Integration[] = [
  {
    slug: 'netchex-payroll',
    name: 'Netchex Payroll module',
    category: 'netchex',
    context: 'payroll',
    blurb: 'Pull payroll data already entered in the Payroll module into this run.',
    initial: 'N',
    color: '#43a047',
    enabled: true,
  },
  {
    slug: 'netchex-time',
    name: 'Netchex Time & Attendance',
    category: 'netchex',
    context: 'time',
    blurb: 'Move T&A periods into pay-ready timesheets without leaving this run.',
    initial: 'T',
    color: '#0277bd',
    enabled: true,
  },
  {
    slug: 'generic-payroll',
    name: 'Generic payroll file',
    category: 'generic-file',
    context: 'payroll',
    blurb: 'Excel/CSV in Long or Wide layout. Map columns to earnings/deductions.',
    initial: 'F',
    color: '#5e35b1',
    enabled: true,
  },
  {
    slug: 'generic-time',
    name: 'Generic time file',
    category: 'generic-file',
    context: 'time',
    blurb: 'Excel/CSV in the standard time layout. Lands in timesheets pay-ready.',
    initial: 'F',
    color: '#5e35b1',
    enabled: true,
  },
  {
    slug: 'statewise',
    name: 'Statewise',
    vendor: 'Statewise',
    category: 'specific-file',
    context: 'payroll',
    blurb: 'Upload the Statewise export — column mapping is pre-built.',
    initial: 'S',
    color: '#ef6c00',
    enabled: true,
  },
  {
    slug: 'daxko',
    name: 'Daxko Club Automation',
    vendor: 'Daxko',
    category: 'api-on-demand',
    context: 'payroll',
    blurb: 'On-demand pull of payroll commissions and class instructor hours.',
    initial: 'D',
    color: '#c62828',
    enabled: true,
    connection: {
      authType: 'oauth2',
      testDescription:
        'We will exchange your Client ID and Secret for a token against the Daxko OAuth endpoint and read your tenant metadata.',
      docsUrl: 'https://api.daxko.com/docs',
      fields: [
        {
          key: 'baseUrl',
          label: 'Daxko region',
          type: 'select',
          required: true,
          options: ['US Production (api.daxko.com)', 'EU Production (eu.api.daxko.com)', 'Sandbox (sandbox.daxko.com)'],
          helperText: 'Pick the region your Daxko tenant is hosted in.',
        },
        {
          key: 'tenantId',
          label: 'Tenant ID',
          type: 'text',
          required: true,
          placeholder: 'e.g. 73881',
          helperText: 'Daxko tenant identifier — supplied during your Daxko onboarding.',
        },
        {
          key: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          placeholder: 'app_xxxxxxxxxxxxxxxx',
        },
        {
          key: 'clientSecret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          secret: true,
          helperText: 'Stored encrypted. Rotate anytime by re-entering.',
        },
      ],
    },
  },
  {
    slug: 'delaget',
    name: 'Delaget',
    vendor: 'Delaget',
    category: 'api-on-demand',
    context: 'time',
    blurb: 'Restaurant time & sales — pull current period into timesheets.',
    initial: 'L',
    color: '#1565c0',
    enabled: true,
    connection: {
      authType: 'apikey',
      testDescription:
        'We will call Delaget /v2/sites with your API key and confirm at least one site is returned for this account.',
      fields: [
        {
          key: 'apiKey',
          label: 'API key',
          type: 'password',
          required: true,
          secret: true,
          helperText: 'Generate from Delaget → Settings → Integrations → API keys.',
        },
        {
          key: 'siteId',
          label: 'Default site ID',
          type: 'text',
          required: false,
          placeholder: 'leave blank for all sites',
          helperText: 'Restrict pulls to a single site. Optional.',
        },
      ],
    },
  },
  {
    slug: 'tcp',
    name: 'TCP Humanity (scheduled)',
    vendor: 'TCP',
    category: 'api-scheduled',
    context: 'time',
    blurb: 'TCP pushes time data nightly. Inspect what landed for this run.',
    initial: 'T',
    color: '#00695c',
    enabled: true,
    connection: {
      authType: 'basic',
      testDescription:
        'We will sign in to TCP Humanity with these credentials and confirm the scheduled webhook receiver is reachable.',
      fields: [
        {
          key: 'subdomain',
          label: 'TCP subdomain',
          type: 'text',
          required: true,
          placeholder: 'acme',
          helperText: 'The part before .humanity.com in your TCP login URL.',
        },
        {
          key: 'username',
          label: 'Service account username',
          type: 'text',
          required: true,
          helperText: 'Use a service account, not a personal login.',
        },
        {
          key: 'password',
          label: 'Service account password',
          type: 'password',
          required: true,
          secret: true,
        },
        {
          key: 'webhookUrl',
          label: 'Webhook URL (TCP → Netchex)',
          type: 'url',
          required: false,
          placeholder: 'auto-generated on save',
          helperText: 'You will paste this URL into TCP after saving here. Leave blank for now.',
        },
      ],
    },
  },
  {
    slug: 'dealertrack',
    name: 'Dealertrack',
    vendor: 'Dealertrack',
    category: 'api-on-demand',
    context: 'payroll',
    blurb: 'Tech time & sales commissions for dealerships (legacy import).',
    initial: 'DT',
    color: '#37474f',
    enabled: true,
    embed: true,
  },
];
