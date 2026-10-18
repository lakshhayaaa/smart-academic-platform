import { Files } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteResource } from '../api/resourceApi'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import ResourceCard from '../components/resources/ResourceCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function MyUploadsPage() {
  const { dashboard, dashboardLoading, dashboardError, refreshDashboard } = useAuth()
  const toast = useToast()
  const [pending, setPending] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const items = dashboard.my_uploads?.items || []

  async function confirmDelete() {
    if (!pending) return
    setDeleting(true)
    try {
      const { data } = await deleteResource(pending.resource_id)
      if (data?.storage_cleanup === 'failed') {
        toast.info(data.message)
      } else {
        toast.success(data?.message || 'Resource deleted')
      }
      setPending(null)
      await refreshDashboard()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete this resource'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Uploads</h1>
        <p className="mt-1 text-sm text-slate-500">
          The backend does not expose a paginated “all uploads” endpoint, so this page uses the authenticated dashboard list (latest 10).
        </p>
      </div>
      {dashboardError ? <ErrorState message={dashboardError} onRetry={() => refreshDashboard()} /> : null}
      {dashboardLoading ? <CardSkeleton /> : null}
      {!dashboardLoading && !items.length ? (
        <EmptyState
          icon={Files}
          title="You have not uploaded anything yet"
          action={<Link to="/upload" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Upload a resource</Link>}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((resource) => (
          <ResourceCard key={resource.resource_id} resource={resource} showDelete onDelete={setPending} />
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete this resource?"
        description="The resource will be removed from the application. This cannot be undone from the frontend."
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setPending(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
