'use client';

import { useId, useState } from 'react';
import { Building2, ChevronDown, Hash, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  maskAccount,
  parseSourceDetail,
  toDisplayName,
} from '@/lib/source-detail';

interface SourceDetailViewProps {
  /** String crudo del sourceDetail (puede ser largo y desestructurado) */
  value: string;
  /** Versión densa para grillas de revisión */
  compact?: boolean;
  className?: string;
}

/**
 * Resumen escaneable de un subconcepto exógeno + detalle completo bajo demanda.
 * Nunca oculta información: lo que no se puede estructurar se muestra tal cual.
 */
export function SourceDetailView({ value, compact = false, className }: SourceDetailViewProps) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();
  const parsed = parseSourceDetail(value);

  const hasStructure =
    parsed.reporterName !== null ||
    parsed.reporterNit !== null ||
    parsed.entries.length > 0 ||
    parsed.notes.length > 0;

  // Fallback: si no hay nada parseable, mostrar el texto original (no perder info)
  if (!hasStructure) {
    return (
      <span className={cn('text-xs font-normal text-muted-foreground', className)}>
        {value}
      </span>
    );
  }

  const displayName = parsed.reporterName ? toDisplayName(parsed.reporterName) : null;

  return (
    <span className={cn('block min-w-0', className)}>
      <span className="flex min-w-0 items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 shrink-0 text-emerald-600/70" aria-hidden />
        {displayName ? (
          <span
            className={cn(
              'min-w-0 flex-1 truncate font-medium text-foreground/90',
              compact ? 'text-xs' : 'text-[13px]',
            )}
            title={parsed.reporterName ?? undefined}
          >
            {displayName}
          </span>
        ) : (
          <span className={cn('font-medium text-foreground/90', compact ? 'text-xs' : 'text-[13px]')}>
            Reportante sin nombre
          </span>
        )}
      </span>

      <span className="mt-1 flex flex-wrap items-center gap-1.5">
        {parsed.reporterNit && (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Hash className="h-3 w-3" aria-hidden />
            NIT {parsed.reporterNit}
          </span>
        )}
        {parsed.accountValue && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <Landmark className="h-3 w-3" aria-hidden />
            {maskAccount(parsed.accountValue)}
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={regionId}
          className="inline-flex items-center gap-0.5 rounded px-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          {expanded ? 'Ocultar' : 'Ver detalle'}
          <ChevronDown
            className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>
      </span>

      {expanded && (
        <span
          id={regionId}
          role="region"
          aria-label="Detalle del subconcepto"
          className="mt-1.5 block min-w-0 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-2"
        >
          {parsed.reporterName && (
            <span className="block text-xs leading-relaxed text-foreground/90">
              {parsed.reporterName}
            </span>
          )}
          <dl className="mt-1 space-y-0.5">
            {parsed.reporterNit && (
              <div className="flex gap-1.5 text-xs">
                <dt className="shrink-0 font-semibold text-muted-foreground">NIT:</dt>
                <dd className="text-foreground/90">{parsed.reporterNit}</dd>
              </div>
            )}
            {parsed.entries.map((entry, idx) => (
              <div key={`${entry.label}-${idx}`} className="flex gap-1.5 text-xs">
                <dt className="shrink-0 font-semibold text-muted-foreground">{entry.label}:</dt>
                <dd className="break-words text-foreground/90">{entry.value}</dd>
              </div>
            ))}
            {parsed.notes.map((note, idx) => (
              <div key={`note-${idx}`} className="text-xs break-words text-muted-foreground">
                {note}
              </div>
            ))}
          </dl>
        </span>
      )}
    </span>
  );
}
