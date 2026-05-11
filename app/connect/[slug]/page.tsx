import { notFound } from 'next/navigation';
import { INTEGRATIONS } from '../../lib/integrations';
import ConnectScreen from '../../components/ConnectScreen';

export function generateStaticParams() {
  return INTEGRATIONS.filter((i) => !!i.connection).map((i) => ({ slug: i.slug }));
}

export default async function ConnectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const integration = INTEGRATIONS.find((i) => i.slug === slug);
  if (!integration || !integration.connection) notFound();
  return <ConnectScreen integration={integration} />;
}
