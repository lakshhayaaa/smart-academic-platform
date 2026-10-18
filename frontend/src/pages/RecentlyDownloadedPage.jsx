import { Download } from 'lucide-react'
import { downloadResource } from '../api/resourceApi'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import ResourceCard from '../components/resources/ResourceCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function RecentlyDownloadedPage() {
  const { dashboard, dashboardLoading, dashboardError, refreshDashboard } = useAuth()
  const toast = useToast()
  const items = dashboard.recently_downloaded || []

  async function handleDownload(resource) {
    try {
      const { data } = await downloadResource(resource.resource_id)
      if (data?.signed_url) window.open(data.signed_url, '_blank', 'noopener')
      toast.success(data?.message || 'Download link ready')
      refreshDashboard().catch(() => {})
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not download this resource'))
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Recently Downloaded</h1>
        <p className="mt-1 text-sm text-slate-500">Limited to the most recent items returned by the dashboard API.</p>
      </div>
      {dashboardError ? <ErrorState message={dashboardError} onRetry={() => refreshDashboard()} /> : null}
      {dashboardLoading ? <CardSkeleton /> : null}
      {!dashboardLoading && !items.length ? (
        <EmptyState icon={Download} title="No downloads yet" />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((resource) => (
          <ResourceCard
            key={`${resource.resource_id}-${resource.downloaded_at}`}
            resource={resource}
            timestampLabel="Downloaded"
            timestampValue={resource.downloaded_at}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  )
}
