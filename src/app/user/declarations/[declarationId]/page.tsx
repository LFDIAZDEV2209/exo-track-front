import { DeclarationDetailPage } from '@/features/user/components/DeclarationDetailPage';

interface PageProps {
  params: Promise<{ declarationId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { declarationId } = await params;
  return <DeclarationDetailPage declarationId={declarationId} />;
}

