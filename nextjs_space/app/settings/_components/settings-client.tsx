'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Settings, Key, User, Palette, CheckCircle, AlertCircle, Trash2, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

export function SettingsClient() {
  const { data: session } = useSession() || {};
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState<{ hasToken: boolean; tokenPreview: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/github/token');
        if (res.ok) setTokenStatus(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchToken();
  }, []);

  const handleSaveToken = async () => {
    if (!token?.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'GitHub token saved successfully' });
        setTokenStatus({ hasToken: true, tokenPreview: token.slice(0, 8) + '...' });
        setToken('');
      } else {
        setMessage({ type: 'error', text: data?.error ?? 'Failed to save token' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save token' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteToken = async () => {
    if (!confirm('Remove your GitHub token?')) return;
    try {
      const res = await fetch('/api/github/token', { method: 'DELETE' });
      if (res.ok) {
        setTokenStatus({ hasToken: false, tokenPreview: null });
        setMessage({ type: 'success', text: 'Token removed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove token' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[800px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your profile, GitHub integration, and preferences.</p>
          </div>

          <div className="space-y-6">
            {/* Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-mono text-sm">{session?.user?.email ?? 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm">{session?.user?.name ?? 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Badge variant="outline" className="capitalize">{session?.user?.role ?? 'user'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={session?.user?.approved ? 'default' : 'secondary'}>
                      {session?.user?.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Token */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">GitHub Personal Access Token</CardTitle>
                </div>
                <CardDescription>Required for accessing the GitHub API to analyze repositories. Create one at github.com/settings/tokens with repo scope.</CardDescription>
              </CardHeader>
              <CardContent>
                {tokenStatus?.hasToken && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Token configured</span>
                      <span className="font-mono text-xs text-muted-foreground">{tokenStatus?.tokenPreview ?? ''}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleDeleteToken} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button onClick={handleSaveToken} loading={saving} disabled={!token?.trim()}>
                    Save Token
                  </Button>
                </div>
                {message && (
                  <div className={`flex items-center gap-2 text-sm mt-3 ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Theme */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Appearance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Toggle light/dark mode</span>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
