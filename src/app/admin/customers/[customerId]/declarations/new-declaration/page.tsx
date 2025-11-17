import { NewDeclarationPage } from '@/features/admin/components/NewDeclarationPage';

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { customerId } = await params;
  return <NewDeclarationPage customerId={customerId} />;
}

