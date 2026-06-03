'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, UserCheck, UserX, Users, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  approved: boolean;
  createdAt: string;
}

export function AdminClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleApproval = async (userId: string, approved: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved }),
      });
      if (res.ok) {
        setUsers((prev: AdminUser[]) =>
          prev.map((u: AdminUser) => u?.id === userId ? { ...u, approved } : u)
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pending = users.filter((u: AdminUser) => !u?.approved);
  const approved = users.filter((u: AdminUser) => u?.approved);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1000px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage user registrations and approvals.</p>
            </div>
            <Button variant="outline" onClick={fetchUsers} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{approved.length}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{pending.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Users */}
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-lg font-semibold mb-3">Pending Approval</h2>
              <div className="space-y-3">
                {pending.map((user: AdminUser, i: number) => (
                  <motion.div key={user?.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{user?.name ?? 'No name'}</p>
                            <p className="text-xs text-muted-foreground font-mono">{user?.email ?? ''}</p>
                            <p className="text-xs text-muted-foreground mt-1">Registered {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'unknown'}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => toggleApproval(user?.id ?? '', true)} className="gap-1">
                              <UserCheck className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => toggleApproval(user?.id ?? '', false)} className="gap-1">
                              <UserX className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Users */}
          <h2 className="font-display text-lg font-semibold mb-3">All Users</h2>
          {loading ? (
            <Card className="animate-pulse"><CardContent className="pt-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">Role</th>
                        <th className="text-left py-2 font-medium">Status</th>
                        <th className="text-right py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: AdminUser) => (
                        <tr key={user?.id ?? ''} className="border-b last:border-0">
                          <td className="py-3">{user?.name ?? 'No name'}</td>
                          <td className="py-3 font-mono text-xs">{user?.email ?? ''}</td>
                          <td className="py-3"><Badge variant="outline" className="capitalize text-xs">{user?.role ?? 'user'}</Badge></td>
                          <td className="py-3">
                            <Badge variant={user?.approved ? 'default' : 'secondary'} className="text-xs">
                              {user?.approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              size="xs"
                              variant={user?.approved ? 'destructive' : 'default'}
                              onClick={() => toggleApproval(user?.id ?? '', !user?.approved)}
                            >
                              {user?.approved ? 'Revoke' : 'Approve'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
