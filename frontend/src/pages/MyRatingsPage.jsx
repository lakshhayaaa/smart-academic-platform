import { Star } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import StarRating from '../components/common/StarRating'
import ResourceCard from '../components/resources/ResourceCard'
import { useAuth } from '../context/AuthContext'

export default function MyRatingsPage() {
  const { dashboard, dashboardLoading, dashboardError, refreshDashboard } = useAuth()
  const items = dashboard.my_ratings?.items || []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Ratings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Showing ratings returned by GET /dashboard. There is no separate ratings history endpoint.
        </p>
      </div>
      {dashboardError ? <ErrorState message={dashboardError} onRetry={() => refreshDashboard()} /> : null}
      {dashboardLoading ? <CardSkeleton /> : null}
      {!dashboardLoading && !items.length ? (
        <EmptyState icon={Star} title="No ratings yet" description="Open a resource and submit a 1–5 star rating." />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ResourceCard
            key={item.rating_id}
            resource={item}
            timestampLabel="Rated"
            timestampValue={item.rated_at}
            extra={<div className="mt-3"><StarRating value={item.rating} readOnly /></div>}
          />
        ))}
      </div>
    </div>
  )
}
