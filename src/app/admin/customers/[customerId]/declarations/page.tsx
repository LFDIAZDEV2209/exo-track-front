import { DeclarationsPage } from '@/features/admin/components/DeclarationsPage';

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { customerId } = await params;
  return <DeclarationsPage customerId={customerId} />;
}
