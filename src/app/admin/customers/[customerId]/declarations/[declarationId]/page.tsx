import { DeclarationDetailAdminPage } from '@/features/admin/components/DeclarationDetailAdminPage';

interface PageProps {
  params: Promise<{ customerId: string; declarationId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { customerId, declarationId } = await params;
  return <DeclarationDetailAdminPage customerId={customerId} declarationId={declarationId} />;
}

