import { useMemo } from 'react';
import { Card, CardContent, Badge, ProgressBar, cn } from '@erp/ui';
import { AlertTriangle, Award, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { useTrainingCertifications } from '../../data-layer/hooks/usePortal';
import type { TrainingCertification } from '@erp/shared';

const statusConfig: Record<string, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: BookOpen,
  },
  not_started: {
    label: 'Not Started',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: BookOpen,
  },
  expired: {
    label: 'Expired',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle,
  },
};

const typeBadge: Record<string, string> = {
  training: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  certification: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
};

function isExpiringSoon(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
}

export default function TrainingPage() {
  const { data: trainingData } = useTrainingCertifications();
  const items = useMemo(() => trainingData ?? [], [trainingData]);

  const expiringCount = useMemo(
    () => items.filter((t: TrainingCertification) => isExpiringSoon(t.expiryDate)).length,
    [items]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Training & Certifications</h1>
        <p className="text-xs text-text-muted">Track your required training and certifications</p>
      </div>

      {/* Expiring Warning */}
      {expiringCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {expiringCount} certification{expiringCount > 1 ? 's' : ''} expiring within 90 days.
            Please renew to maintain compliance.
          </p>
        </div>
      )}

      {/* Training Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: TrainingCertification) => {
          const config = statusConfig[item.status] ?? statusConfig.not_started;
          const StatusIcon = config.icon;
          const expiringSoon = isExpiringSoon(item.expiryDate);

          return (
            <Card
              key={item.id}
              className={cn(
                expiringSoon && 'border-amber-300 dark:border-amber-700',
                item.status === 'expired' && 'border-red-300 dark:border-red-700'
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'certification' ? (
                      <Award className="h-5 w-5 text-amber-500" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-purple-500" />
                    )}
                    <Badge className={typeBadge[item.type]}>{item.type}</Badge>
                  </div>
                  {item.requiredForRole && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      Required
                    </Badge>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.name}</h3>
                {item.issuer && (
                  <p className="text-xs text-text-muted mb-3">Issued by: {item.issuer}</p>
                )}

                {/* Status */}
                <div className="flex items-center gap-1.5 mb-2">
                  <StatusIcon className="h-3.5 w-3.5" />
                  <Badge className={config.badge}>{config.label}</Badge>
                </div>

                {/* Progress for in_progress items */}
                {item.status === 'in_progress' && (
                  <ProgressBar
                    value={50}
                    max={100}
                    label="Progress"
                    color="brand"
                    size="sm"
                    className="mb-2"
                  />
                )}

                {/* Dates */}
                <div className="space-y-1 mt-2 pt-2 border-t border-border">
                  {item.completedDate && (
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Completed</span>
                      <span className="text-text-primary">
                        {new Date(item.completedDate + 'T12:00:00').toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {item.expiryDate && (
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Expires</span>
                      <span className={cn(
                        'font-medium',
                        expiringSoon
                          ? 'text-amber-600 dark:text-amber-400'
                          : item.status === 'expired'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-text-primary'
                      )}>
                        {new Date(item.expiryDate + 'T12:00:00').toLocaleDateString()}
                        {expiringSoon && ' (soon)'}
                      </span>
                    </div>
                  )}
                  {item.score != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Score</span>
                      <span className="text-text-primary font-medium">{item.score}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-text-muted">No training records found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
