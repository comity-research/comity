export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AnalyzeClient } from './_components/analyze-client';

export default async function AnalyzePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  if (!session.user.approved) redirect('/pending');
  return <AnalyzeClient />;
}
