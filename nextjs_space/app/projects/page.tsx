import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectsClient } from './_components/projects-client';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!session.user?.approved) redirect('/pending');
  return <ProjectsClient />;
}
