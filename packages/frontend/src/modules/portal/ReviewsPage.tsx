import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { Star, CheckCircle2, Circle } from 'lucide-react';
import { useEmployeeReviews } from '../../data-layer/hooks/usePortal';
import type { EmployeeReview } from '@erp/shared';

function RatingBar({ label, rating, max = 5 }: { label: string; rating: number; max?: number }) {
  const percentage = (rating / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs font-medium text-text-primary">{rating}/{max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-2">
        <div
          className="h-2 rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ReviewCard({ review, isLatest }: { review: EmployeeReview; isLatest: boolean }) {
  const [goalsChecked, setGoalsChecked] = useState<Set<number>>(new Set());

  const toggleGoal = (index: number) => {
    setGoalsChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const typeBadge: Record<string, string> = {
    annual: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    quarterly: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    probationary: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    promotion: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  };

  return (
    <Card className={isLatest ? 'border-amber-200 dark:border-amber-800' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{review.period}</CardTitle>
            <Badge className={typeBadge[review.type]}>{review.type}</Badge>
          </div>
          <span className="text-xs text-text-muted">
            {new Date(review.reviewDate + 'T12:00:00').toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {review.overallRating}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Overall Rating</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(review.overallRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Reviewed by {review.reviewerName}
              </p>
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase mb-3">
              Category Ratings
            </h4>
            <div className="space-y-3">
              {review.categories.map((cat) => (
                <RatingBar key={cat.name} label={cat.name} rating={cat.rating} />
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-2">
                Strengths
              </h4>
              <ul className="space-y-1">
                {review.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-2">
                Areas for Improvement
              </h4>
              <ul className="space-y-1">
                {review.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Goals</h4>
            <div className="space-y-2">
              {review.goals.map((goal, i) => (
                <button
                  key={i}
                  onClick={() => toggleGoal(i)}
                  className="flex w-full items-center gap-2 text-left text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {goalsChecked.has(i) ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0 text-text-muted" />
                  )}
                  <span className={goalsChecked.has(i) ? 'line-through text-text-muted' : ''}>
                    {goal}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage() {
  const { data: reviewsData } = useEmployeeReviews();
  const reviews = useMemo(() => reviewsData ?? [], [reviewsData]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Performance Reviews</h1>
        <p className="text-xs text-text-muted">View your performance feedback and goals</p>
      </div>

      {reviews.map((review: EmployeeReview, i: number) => (
        <ReviewCard key={review.id} review={review} isLatest={i === 0} />
      ))}

      {reviews.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-text-muted">No reviews available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
