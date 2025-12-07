import { EditCustomerPage } from '@/features/admin/components/EditCustomerPage';

interface PageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { customerId } = await params;
  return <EditCustomerPage customerId={customerId} />;
}
