import { Compass, Files, Star, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import StarRating from '../components/common/StarRating'
import ResourceCard from '../components/resources/ResourceCard'
import { downloadResource } from '../api/resourceApi'
import { getErrorMessage } from '../utils/errors'

function Section({ title, count, to, children, empty, loading }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {typeof count === 'number' ? <p className="text-sm text-slate-500">{count} total</p> : null}
        </div>
        {to ? (
          <Link to={to} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        ) : null}
      </div>
      {loading ? <CardSkeleton count={3} /> : children?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      ) : (
        empty
      )}
    </section>
  )
}

export default function DashboardPage() {
  const { user, dashboard, dashboardLoading, dashboardError, refreshDashboard } = useAuth()
  const toast = useToast()

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

  if (dashboardError && !dashboard?.student) {
    return <ErrorState message={dashboardError} onRetry={() => refreshDashboard()} />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Your academic resources, all in one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/upload" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <Upload className="h-4 w-4" />
            Upload a resource
          </Link>
          <Link to="/resources" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Compass className="h-4 w-4" />
            Discover resources
          </Link>
        </div>
      </div>

      <Section
        title="My Uploads"
        count={dashboard.my_uploads?.total}
        to="/my-uploads"
        loading={dashboardLoading}
        empty={(
          <EmptyState
            icon={Files}
            title="No uploads yet"
            description="Share notes, presentations, or question papers with your class."
            action={<Link to="/upload" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Upload now</Link>}
          />
        )}
      >
        {(dashboard.my_uploads?.items || []).map((resource) => (
          <ResourceCard key={resource.resource_id} resource={resource} />
        ))}
      </Section>

      <Section
        title="Recently Viewed"
        to="/recently-viewed"
        loading={dashboardLoading}
        empty={<EmptyState icon={Compass} title="Nothing viewed yet" description="Open a resource from Discover to start your history." />}
      >
        {(dashboard.recently_viewed || []).map((resource) => (
          <ResourceCard
            key={`${resource.resource_id}-${resource.viewed_at}`}
            resource={resource}
            timestampLabel="Viewed"
            timestampValue={resource.viewed_at}
          />
        ))}
      </Section>

      <Section
        title="Recently Downloaded"
        to="/recently-downloaded"
        loading={dashboardLoading}
        empty={<EmptyState icon={Files} title="No downloads yet" description="Download a resource to keep a record here." />}
      >
        {(dashboard.recently_downloaded || []).map((resource) => (
          <ResourceCard
            key={`${resource.resource_id}-${resource.downloaded_at}`}
            resource={resource}
            timestampLabel="Downloaded"
            timestampValue={resource.downloaded_at}
            onDownload={handleDownload}
          />
        ))}
      </Section>

      <Section
        title="My Ratings"
        count={dashboard.my_ratings?.total}
        to="/my-ratings"
        loading={dashboardLoading}
        empty={<EmptyState icon={Star} title="No ratings yet" description="Rate a resource after you have used it." />}
      >
        {(dashboard.my_ratings?.items || []).map((item) => (
          <ResourceCard
            key={item.rating_id}
            resource={item}
            timestampLabel="Rated"
            timestampValue={item.rated_at}
            extra={<div className="mt-3"><StarRating value={item.rating} readOnly /></div>}
          />
        ))}
      </Section>
    </div>
  )
}
