'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  FolderGit2, Search, Plus, ExternalLink, Bookmark, Star, Code, Pencil, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Project {
  id: string;
  owner: string;
  repo: string;
  name: string;
  description?: string | null;
  category: string;
  categoryName?: string | null;
  primaryLanguage?: string | null;
  license?: string | null;
  governanceModel?: string | null;
  isUserAdded: boolean;
  addedByUserId?: string | null;
  tags?: any;
}

export function ProjectsClient() {
  const { data: session } = useSession() || {};
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ owner: '', repo: '', name: '', description: '', category: 'custom' });

  const isAdmin = session?.user?.role === 'admin';
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, bookRes] = await Promise.all([
          fetch('/api/preset-projects'),
          fetch('/api/bookmarks'),
        ]);
        if (projRes.ok) setProjects(await projRes.json());
        if (bookRes.ok) {
          const bk = await bookRes.json();
          setBookmarks(new Set((bk ?? []).map((b: any) => `${b?.repoOwner}/${b?.repoName}`)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p?.category ?? '').filter(Boolean));
    return ['all', ...Array.from(cats)].sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = !search || (p?.name ?? '').toLowerCase().includes(q) ||
        (p?.owner ?? '').toLowerCase().includes(q) ||
        (p?.repo ?? '').toLowerCase().includes(q) ||
        (p?.description ?? '').toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'all' || p?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, selectedCategory]);

  const toggleBookmark = async (owner: string, name: string) => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoOwner: owner, repoName: name }),
      });
      const key = `${owner}/${name}`;
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.owner || !newProject.repo || !newProject.name) return;
    try {
      const res = await fetch('/api/preset-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [...prev, data]);
        setAddOpen(false);
        setNewProject({ owner: '', repo: '', name: '', description: '', category: 'custom' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;
    try {
      const res = await fetch('/api/preset-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        setEditOpen(false);
        setEditingProject(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;
    try {
      const res = await fetch(`/api/preset-projects?id=${editingProject.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== editingProject.id));
        setDeleteOpen(false);
        setEditingProject(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const canEdit = (project: Project) => isAdmin || project.addedByUserId === userId;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Project Corpus</h1>
              <p className="text-muted-foreground mt-1">{projects.length} open source projects available for governance analysis.</p>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />Add Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Project</DialogTitle>
                  <DialogDescription>Add any public GitHub repository to the corpus for analysis.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Owner</Label><Input value={newProject.owner} onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })} placeholder="e.g. facebook" /></div>
                    <div><Label>Repo</Label><Input value={newProject.repo} onChange={(e) => setNewProject({ ...newProject, repo: e.target.value })} placeholder="e.g. react" /></div>
                  </div>
                  <div><Label>Display Name</Label><Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="React" /></div>
                  <div><Label>Description</Label><Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="A JavaScript library for building UIs" rows={2} /></div>
                  <div><Label>Category</Label><Input value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} placeholder="custom" /></div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddProject}>Add Project</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.slice(0, 10).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Project grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse"><CardContent className="pt-6"><div className="h-24 bg-muted rounded" /></CardContent></Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-1">No projects found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters, or add a new project.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((project, i) => (
                <motion.div
                  key={project?.id ?? i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.3 }}
                >
                  <Card variant="interactive">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{project?.name ?? ''}</h3>
                          <p className="font-mono text-xs text-muted-foreground">{project?.owner ?? ''}/{project?.repo ?? ''}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {canEdit(project) && (
                            <>
                              <button onClick={() => { setEditingProject({ ...project }); setEditOpen(true); }} className="p-1 rounded hover:bg-accent">
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => { setEditingProject(project); setDeleteOpen(true); }} className="p-1 rounded hover:bg-accent">
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </button>
                            </>
                          )}
                          <button onClick={() => toggleBookmark(project?.owner ?? '', project?.repo ?? '')}>
                            <Bookmark className={`h-4 w-4 ${bookmarks.has(`${project?.owner}/${project?.repo}`) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                          </button>
                        </div>
                      </div>
                      {project?.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="secondary" className="text-xs capitalize">{(project?.category ?? '').replace(/_/g, ' ')}</Badge>
                        {project?.primaryLanguage && <Badge variant="outline" className="text-xs"><Code className="h-3 w-3 mr-1" />{project.primaryLanguage}</Badge>}
                        {project?.license && <Badge variant="outline" className="text-xs">{project.license}</Badge>}
                        {project?.isUserAdded && <Badge className="text-xs">Custom</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/analyze?repo=${project?.owner ?? ''}/${project?.repo ?? ''}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                            <Star className="h-3 w-3" />
                            Analyze
                          </Button>
                        </Link>
                        <a href={`https://github.com/${project?.owner ?? ''}/${project?.repo ?? ''}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Edit dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update the project details below.</DialogDescription>
              </DialogHeader>
              {editingProject && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Owner</Label><Input value={editingProject.owner} onChange={(e) => setEditingProject({ ...editingProject, owner: e.target.value })} /></div>
                    <div><Label>Repo</Label><Input value={editingProject.repo} onChange={(e) => setEditingProject({ ...editingProject, repo: e.target.value })} /></div>
                  </div>
                  <div><Label>Display Name</Label><Input value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea value={editingProject.description ?? ''} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} rows={2} /></div>
                  <div><Label>Category</Label><Input value={editingProject.category} onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })} /></div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditProject}>Save Changes</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete confirmation dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Remove <span className="font-mono font-medium">{editingProject?.owner}/{editingProject?.repo}</span> from the corpus? This does not delete any analyses.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteProject}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}
