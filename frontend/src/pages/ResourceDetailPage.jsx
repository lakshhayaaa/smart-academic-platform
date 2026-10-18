import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { downloadResource, getResource, rateResource } from '../api/resourceApi'
import Badge from '../components/common/Badge'
import ErrorState from '../components/common/ErrorState'
import Skeleton from '../components/common/Skeleton'
import StarRating from '../components/common/StarRating'
import ResourcePreview from '../components/resources/ResourcePreview'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'
import { formatDate } from '../utils/format'

export default function ResourceDetailPage() {
  const { resourceId } = useParams()
  const toast = useToast()
  const { dashboard, refreshDashboard } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [ratingBusy, setRatingBusy] = useState(false)

  const existingRating = useMemo(
    () => (dashboard.my_ratings?.items || []).find((item) => String(item.resource_id) === String(resourceId)),
    [dashboard, resourceId],
  )

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await getResource(resourceId)
      setResource(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this resource'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [resourceId])

  useEffect(() => {
    if (existingRating) setRating(existingRating.rating)
  }, [existingRating])

  async function handleDownload() {
    try {
      const { data } = await downloadResource(resourceId)
      if (data?.signed_url) window.open(data.signed_url, '_blank', 'noopener')
      toast.success(data?.message || 'Download link ready')
      refreshDashboard().catch(() => {})
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not generate a download link'))
    }
  }

  async function handleRate(next) {
    if (existingRating) {
      toast.info('You have already rated this resource.')
      return
    }
    setRating(next)
    setRatingBusy(true)
    try {
      const { data } = await rateResource(resourceId, next)
      toast.success(data?.message || 'Rating saved')
      refreshDashboard().catch(() => {})
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save rating'))
    } finally {
      setRatingBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[32rem] w-full" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{resource.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {resource.course_code}
              {resource.unit_number ? ` · Unit ${resource.unit_number}` : ''}
              {resource.unit_name ? ` · ${resource.unit_name}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge value={resource.resource_type} kind="type" />
              {resource.status ? <Badge value={resource.status} /> : null}
              <span className="text-sm text-slate-500">Uploaded {formatDate(resource.created_at)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Download
          </button>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Rate this resource</p>
          <StarRating value={rating} onChange={handleRate} disabled={ratingBusy || Boolean(existingRating)} />
          {existingRating ? (
            <p className="mt-2 text-xs text-slate-500">You already submitted a rating. Edits are not supported by the API.</p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Choose 1 to 5 stars. Ratings cannot be changed after they are saved.</p>
          )}
        </div>
      </div>

      <ResourcePreview
        url={resource.signed_url}
        title={resource.title}
        onRetry={load}
        onDownload={handleDownload}
        error={null}
      />
    </div>
  )
}
