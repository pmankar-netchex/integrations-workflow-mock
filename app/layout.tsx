import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { netchexTheme } from './theme';
import Chrome from './components/Chrome';

export const metadata: Metadata = {
  title: 'Netchex — Integrations Workflow (Mock)',
  description: 'Unified integrations workflow prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={netchexTheme}>
            <CssBaseline />
            <Chrome>{children}</Chrome>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
