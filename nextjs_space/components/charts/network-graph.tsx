'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback, useRef } from 'react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading graph...</div> });

interface NetworkGraphProps {
  nodes: { id: string; name: string; val: number; group?: string }[];
  links: { source: string; target: string; value: number }[];
}

export function NetworkGraph({ nodes, links }: NetworkGraphProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 400 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDims({ width: rect.width || 600, height: rect.height || 400 });
    }
  }, [mounted]);

  const safeNodes = (nodes ?? []).map((n: any) => ({ ...(n ?? {}), id: n?.id ?? '', name: n?.name ?? '', val: Math.max(1, Math.sqrt(n?.val ?? 1)) }));
  const safeLinks = (links ?? []).filter((l: any) => l?.source && l?.target);

  const nodeColor = useCallback((node: any) => {
    if (node?.group === 'reviewer') return '#FF9149';
    return '#7C3AED';
  }, []);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>;
  if (safeNodes.length === 0) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No network data</div>;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <ForceGraph2D
        graphData={{ nodes: safeNodes, links: safeLinks }}
        width={dims.width}
        height={dims.height}
        nodeColor={nodeColor}
        nodeLabel={(node: any) => node?.name ?? ''}
        nodeRelSize={4}
        linkColor={() => isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
        linkWidth={(link: any) => Math.max(1, (link?.value ?? 1) * 0.5)}
        backgroundColor="transparent"
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}
