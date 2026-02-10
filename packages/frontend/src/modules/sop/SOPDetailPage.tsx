import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@erp/ui';
import { useSOP, useSOPAcknowledgments } from '../../data-layer/hooks/useSOP';
import { Edit, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import type { SOPAcknowledgment } from '@erp/shared';

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning' | 'info'> = {
  published: 'success',
  draft: 'default',
  under_review: 'warning',
  archived: 'info',
};

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  under_review: 'Under Review',
  archived: 'Archived',
};

export default function SOPDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sop } = useSOP(id || '');
  const { data: allAcknowledgments } = useSOPAcknowledgments();

  const acknowledgments: SOPAcknowledgment[] = useMemo(
    () => (allAcknowledgments ?? []).filter((a: SOPAcknowledgment) => a.sopId === id),
    [allAcknowledgments, id]
  );

  if (!sop) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-text-muted">Loading SOP...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-text-primary">{sop.title}</h1>
            <Badge variant={STATUS_VARIANT[sop.status] || 'default'}>
              {STATUS_LABEL[sop.status] || sop.status}
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">{sop.description}</p>
        </div>
        <Button onClick={() => navigate(`/sop/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>

      {/* Metadata Bar */}
      <div className="flex flex-wrap gap-4 p-3 rounded-lg border border-border bg-surface-1">
        <MetaItem label="SOP Number" value={sop.sopNumber} />
        <MetaItem label="Version" value={`v${sop.version}`} />
        <MetaItem label="Department" value={sop.department} />
        <MetaItem label="Effective Date" value={sop.effectiveDate ? new Date(sop.effectiveDate).toLocaleDateString() : '-'} />
        <MetaItem label="Created By" value={sop.createdBy} />
        <MetaItem label="Approved By" value={sop.approvedBy || '-'} />
      </div>

      {/* Tags */}
      {sop.tags && sop.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Tags:</span>
          <div className="flex flex-wrap gap-1">
            {sop.tags.map((tag: string) => (
              <Badge key={tag} variant="primary">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Procedure Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sop.content || '<p>No content available.</p>' }}
          />
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          {sop.revisionHistory && sop.revisionHistory.length > 0 ? (
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
              <div className="space-y-4">
                {[...sop.revisionHistory].reverse().map((rev, i) => (
                  <div key={`${rev.version}-${i}`} className="relative">
                    <div className="absolute -left-[17px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-500 bg-surface-0">
                      <Clock className="h-2.5 w-2.5 text-brand-500" />
                    </div>
                    <div className="rounded-lg border border-border p-3 bg-surface-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">v{rev.version}</span>
                        <span className="text-2xs text-text-muted">
                          {new Date(rev.changedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{rev.changeDescription}</p>
                      <p className="text-2xs text-text-muted mt-1">By {rev.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No revision history available.</p>
          )}
        </CardContent>
      </Card>

      {/* Acknowledgment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Acknowledgment Status</CardTitle>
        </CardHeader>
        <CardContent>
          {acknowledgments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase">Employee</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase">Due Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase">Acknowledged Date</th>
                  </tr>
                </thead>
                <tbody>
                  {acknowledgments.map((ack: SOPAcknowledgment) => (
                    <tr key={ack.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 text-sm text-text-primary">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-text-muted" />
                          {ack.employeeName}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {ack.isAcknowledged ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Acknowledged</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-text-primary">
                        {ack.dueDate ? new Date(ack.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-text-primary">
                        {ack.acknowledgedAt ? new Date(ack.acknowledgedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No acknowledgment records for this SOP.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[120px]">
      <span className="text-2xs text-text-muted uppercase tracking-wide">{label}</span>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}
