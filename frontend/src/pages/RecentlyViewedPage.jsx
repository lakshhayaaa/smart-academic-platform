
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import ResourceCard from '../components/resources/ResourceCard'
import { useAuth } from '../context/AuthContext'

export default function RecentlyViewedPage() {
  const {
    dashboard,
    dashboardLoading,
    dashboardError,
    refreshDashboard,
  } = useAuth()

  const items = useMemo(() => {
    const recent = dashboard.recently_viewed || []

    // Sort newest first, then keep only the latest entry
    // for each resource.
    const sorted = [...recent].sort(
      (a, b) =>
        new Date(b.viewed_at).getTime() -
        new Date(a.viewed_at).getTime(),
    )

    const seen = new Set()

    return sorted.filter((resource) => {
      const id = String(resource.resource_id)

      if (seen.has(id)) {
        return false
      }

      seen.add(id)
      return true
    })
  }, [dashboard.recently_viewed])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Recently Viewed
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your recently viewed resources, with each resource shown once.
        </p>
      </div>

      {dashboardError ? (
        <ErrorState
          message={dashboardError}
          onRetry={() => refreshDashboard()}
        />
      ) : null}

      {dashboardLoading ? <CardSkeleton /> : null}

      {!dashboardLoading && !dashboardError && !items.length ? (
        <EmptyState
          icon={Clock}
          title="No recently viewed resources"
        />
      ) : null}

      {!dashboardLoading && items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((resource) => (
            <ResourceCard
              key={resource.resource_id}
              resource={resource}
              timestampLabel="Viewed"
              timestampValue={resource.viewed_at}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
