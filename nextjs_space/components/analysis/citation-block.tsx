'use client';

import { BookOpen } from 'lucide-react';

export interface Citation {
  label: string; // "Seminal" or "Latest"
  text: string;
  doi?: string;
}

export function CitationBlock({ citations, explanation }: { citations: Citation[]; explanation: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-accent/20 p-4 space-y-3">
      <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-1">
          {citations.map((c, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">[{c.label}]</span>{' '}
              {c.doi ? (
                <span
                  role="link"
                  tabIndex={0}
                  className="underline underline-offset-2 hover:text-foreground cursor-pointer"
                  onClick={() => window.open(`https://doi.org/${c.doi}`, '_blank', 'noopener,noreferrer')}
                  onKeyDown={(e) => { if (e.key === 'Enter') window.open(`https://doi.org/${c.doi}`, '_blank', 'noopener,noreferrer'); }}
                >
                  {c.text}
                </span>
              ) : (
                c.text
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
