'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { CitationBlock } from './citation-block';
import { Network, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading graph...</div> });

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  contributions: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export function NetworkGraphTab({ analysis }: { analysis: any }) {
  const contributors = analysis?.contributors ?? analysis?.rawData?.contributors ?? [];
  const rawNodes = analysis?.rawData?.networkNodes ?? [];
  const rawLinks = analysis?.rawData?.networkLinks ?? [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef?.current) {
        setDimensions({ width: containerRef.current.clientWidth ?? 600, height: 450 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    // Prefer pre-computed network data from rawData
    if (rawNodes.length > 0) {
      return {
        nodes: rawNodes.map((n: any) => ({
          id: n?.id ?? '',
          name: n?.name ?? n?.id ?? '',
          val: Math.max(3, Math.sqrt(n?.val ?? 1) * 2),
          color: (n?.group === 'reviewer') ? '#FF9149' : ((n?.name ?? '').toLowerCase().includes('bot') ? '#A19AD3' : '#60B5FF'),
          contributions: n?.val ?? 0,
        })),
        links: rawLinks.map((l: any) => ({ source: l?.source ?? '', target: l?.target ?? '' })),
      };
    }

    // Fallback: build from contributors
    const nodes: GraphNode[] = [];
    const nodeMap = new Set<string>();
    (contributors ?? []).slice(0, 50).forEach((c: any) => {
      const login = c?.login ?? 'unknown';
      if (!nodeMap.has(login)) {
        nodeMap.add(login);
        const isBot = (login ?? '').toLowerCase().includes('bot') || (login ?? '').toLowerCase().includes('[bot]');
        nodes.push({
          id: login, name: login,
          val: Math.max(3, Math.sqrt(c?.commits ?? c?.contributions ?? 1) * 2),
          color: isBot ? '#A19AD3' : '#60B5FF',
          contributions: c?.commits ?? c?.contributions ?? 0,
        });
      }
    });
    return { nodes, links: [] as GraphLink[] };
  }, [contributors, rawNodes, rawLinks]);

  if ((contributors ?? []).length === 0 && rawNodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Network className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No contributor data available for network visualisation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <CitationBlock
          explanation="This force-directed graph represents the collaboration network among contributors. Nodes are sized by commit count and coloured by role. Edges connect PR authors with their reviewers. Dense, well-connected networks indicate distributed knowledge, while star topologies with a single central node signal bottleneck risk."
          citations={[
            { label: 'Seminal', text: 'Bird, C., Pattison, D., D\u2019Souza, R., Filkov, V. & Devanbu, P. (2008). Latent social structure in open source projects. Proc. 16th ACM SIGSOFT Intl. Symp. on Foundations of Software Engineering, pp. 24-35.', doi: '10.1145/1453101.1453107' },
            { label: 'Latest', text: 'Wattanakriengkrai, S., Kamei, Y. & Hata, H. (2024). Understanding developers\' collaboration through the lens of social network analysis. IEEE Transactions on Software Engineering, 50(1), 110-127.', doi: '10.1109/TSE.2023.3339851' },
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="h-4 w-4" />
              Contributor Network ({graphData.nodes.length} nodes, {graphData.links.length} connections)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={containerRef} className="rounded-lg overflow-hidden bg-accent/20">
              {graphData.nodes.length > 0 && (
                <ForceGraph2D
                  graphData={graphData}
                  width={dimensions.width}
                  height={dimensions.height}
                  nodeLabel={(node: any) => `${node?.name ?? ''} (${node?.contributions ?? 0} contributions)`}
                  nodeColor={(node: any) => node?.color ?? '#60B5FF'}
                  nodeVal={(node: any) => node?.val ?? 3}
                  linkColor={() => 'rgba(150,150,150,0.3)'}
                  linkWidth={1}
                  enableNodeDrag={true}
                  enableZoomInteraction={true}
                  cooldownTicks={100}
                />
              )}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#60B5FF' }} />Contributor</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF9149' }} />Reviewer</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A19AD3' }} />Bot</div>
              <span>Node size = contribution count</span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
