import { notFound } from 'next/navigation';
import { INTEGRATIONS } from '../../lib/integrations';
import DaxkoFlow from '../../components/flows/DaxkoFlow';
import GenericFileFlow from '../../components/flows/GenericFileFlow';
import StatewiseFlow from '../../components/flows/StatewiseFlow';
import TcpScheduledFlow from '../../components/flows/TcpScheduledFlow';
import NetchexInternalFlow from '../../components/flows/NetchexInternalFlow';
import DealertrackEmbed from '../../components/flows/DealertrackEmbed';

export function generateStaticParams() {
  return INTEGRATIONS.map((i) => ({ slug: i.slug }));
}

export default async function FlowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const integration = INTEGRATIONS.find((i) => i.slug === slug);
  if (!integration) notFound();

  switch (slug) {
    case 'daxko':
      return <DaxkoFlow slug="daxko" />;
    case 'delaget':
      return <DaxkoFlow slug="delaget" />;
    case 'generic-payroll':
      return <GenericFileFlow context="payroll" />;
    case 'generic-time':
      return <GenericFileFlow context="time" />;
    case 'statewise':
      return <StatewiseFlow />;
    case 'tcp':
      return <TcpScheduledFlow />;
    case 'netchex-payroll':
      return <NetchexInternalFlow context="payroll" />;
    case 'netchex-time':
      return <NetchexInternalFlow context="time" />;
    case 'dealertrack':
      return <DealertrackEmbed />;
    default:
      notFound();
  }
}
