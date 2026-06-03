import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ComparisonClient } from './_components/comparison-client';

export const dynamic = 'force-dynamic';

export default async function ComparisonPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!session.user?.approved) redirect('/pending');
  return <ComparisonClient />;
}
