import { Clock } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import ResourceCard from '../components/resources/ResourceCard'
import { useAuth } from '../context/AuthContext'

export default function RecentlyViewedPage() {
  const { dashboard, dashboardLoading, dashboardError, refreshDashboard } = useAuth()
  const items = dashboard.recently_viewed || []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Recently Viewed</h1>
        <p className="mt-1 text-sm text-slate-500">Limited to the most recent items returned by the dashboard API.</p>
      </div>
      {dashboardError ? <ErrorState message={dashboardError} onRetry={() => refreshDashboard()} /> : null}
      {dashboardLoading ? <CardSkeleton /> : null}
      {!dashboardLoading && !items.length ? (
        <EmptyState icon={Clock} title="No recently viewed resources" />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((resource) => (
          <ResourceCard
            key={`${resource.resource_id}-${resource.viewed_at}`}
            resource={resource}
            timestampLabel="Viewed"
            timestampValue={resource.viewed_at}
          />
        ))}
      </div>
    </div>
  )
}
