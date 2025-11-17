import { CustomerDetailPage } from '@/features/admin/components/CustomerDetailPage';

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { customerId } = await params;
  return <CustomerDetailPage customerId={customerId} />;
}

