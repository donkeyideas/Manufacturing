import { useMemo, useState } from 'react';
import { Card, CardContent, Badge, Button } from '@erp/ui';
import { FileCheck, Check, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { getSOPsByRole, getSOPAcknowledgments } from '@erp/demo-data';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { SOP, SOPAcknowledgment } from '@erp/shared';

export default function SOPsPage() {
  const { isDemo } = useAppMode();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localAcks, setLocalAcks] = useState<Set<string>>(new Set());

  const sops = useMemo(() => isDemo ? getSOPsByRole('CNC Operator') : [], [isDemo]);
  const allAcks = useMemo(() => isDemo ? getSOPAcknowledgments() : [], [isDemo]);

  const myAcks = useMemo(() => {
    const map: Record<string, SOPAcknowledgment> = {};
    for (const ack of allAcks) {
      if (ack.employeeId === 'emp-1') {
        map[ack.sopId] = ack;
      }
    }
    return map;
  }, [allAcks]);

  const handleAcknowledge = (sopId: string) => {
    setLocalAcks((prev) => new Set(prev).add(sopId));
  };

  const isAcknowledged = (sopId: string) => {
    return localAcks.has(sopId) || myAcks[sopId]?.isAcknowledged === true;
  };

  const pendingCount = useMemo(
    () => sops.filter((s) => !isAcknowledged(s.id)).length,
    [sops, myAcks, localAcks]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Standard Operating Procedures</h1>
        <p className="text-xs text-text-muted">
          SOPs assigned to your role (CNC Operator)
        </p>
      </div>

      {/* Pending Warning */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            You have {pendingCount} SOP{pendingCount > 1 ? 's' : ''} pending acknowledgment.
          </p>
        </div>
      )}

      {/* SOPs List */}
      <div className="space-y-3">
        {sops.map((sop) => {
          const acked = isAcknowledged(sop.id);
          const expanded = expandedId === sop.id;

          return (
            <Card key={sop.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <button
                    className="flex items-start gap-3 text-left flex-1 min-w-0"
                    onClick={() => setExpandedId(expanded ? null : sop.id)}
                  >
                    <div className="mt-0.5">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {sop.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        <span>{sop.sopNumber}</span>
                        <span>{sop.department}</span>
                        <span>v{sop.version}</span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {acked ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                        <Check className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    ) : (
                      <>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                          Pending
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(sop.id)}
                        >
                          Acknowledge
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-text-secondary mb-3">{sop.description}</p>
                    <div className="rounded-lg bg-surface-2 p-4">
                      <div
                        className="prose prose-sm max-w-none text-text-secondary dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: sop.content.replace(/\n/g, '<br/>') }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span>Category: {sop.category}</span>
                      <span>Effective: {new Date(sop.effectiveDate + 'T12:00:00').toLocaleDateString()}</span>
                      <span>Created by: {sop.createdBy}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sops.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-text-muted">No SOPs assigned to your role.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
