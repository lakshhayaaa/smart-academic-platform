
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  addResourceComment,
  downloadResource,
  getResource,
  getResourceComments,
  rateResource,
} from '../api/resourceApi'
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
  const { user, dashboard, refreshDashboard } = useAuth()

  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(0)
  const [ratingBusy, setRatingBusy] = useState(false)

  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentBusy, setCommentBusy] = useState(false)

  const existingRating = useMemo(
    () =>
      (dashboard.my_ratings?.items || []).find(
        (item) => String(item.resource_id) === String(resourceId)
      ),
    [dashboard, resourceId]
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

  async function loadComments() {
    setCommentsLoading(true)

    try {
      const { data } = await getResourceComments(resourceId)
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Could not load comments')
      )
    } finally {
      setCommentsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [resourceId])

  useEffect(() => {
    loadComments()
  }, [resourceId])

  useEffect(() => {
    setRating(existingRating ? existingRating.rating : 0)
  }, [existingRating, resourceId])

  useEffect(() => {
    setCommentText('')
  }, [resourceId])

  async function handleDownload() {
    try {
      const { data } = await downloadResource(resourceId)

      if (data?.signed_url) {
        window.open(data.signed_url, '_blank', 'noopener')
      }

      toast.success(data?.message || 'Download link ready')
      refreshDashboard().catch(() => {})
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Could not generate a download link')
      )
    }
  }

  async function handleRate(next) {
    if (ratingBusy) return

    const previousRating = rating
    setRating(next)
    setRatingBusy(true)

    try {
      const { data } = await rateResource(resourceId, next)

      toast.success(
        data?.message ||
          (existingRating
            ? 'Rating updated successfully'
            : 'Rating added successfully')
      )

      await refreshDashboard()
    } catch (err) {
      setRating(previousRating)
      toast.error(getErrorMessage(err, 'Could not save rating'))
    } finally {
      setRatingBusy(false)
    }
  }

  async function handleAddComment(event) {
    event.preventDefault()

    const text = commentText.trim()

    if (!text) {
      toast.error('Please enter a comment.')
      return
    }

    if (commentBusy) return

    if (!user?.roll_no) {
      toast.error('Please sign in to add a comment.')
      return
    }

    setCommentBusy(true)

    try {
      await addResourceComment(resourceId, text, user.roll_no)

      setCommentText('')
      toast.success('Comment added successfully')

      await loadComments()
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Could not add comment')
      )
    } finally {
      setCommentBusy(false)
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
      {/* Resource details */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {resource.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {resource.course_code}
              {resource.unit_number
                ? ` · Unit ${resource.unit_number}`
                : ''}
              {resource.unit_name ? ` · ${resource.unit_name}` : ''}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge value={resource.resource_type} kind="type" />
              {resource.status ? (
                <Badge value={resource.status} />
              ) : null}

              <span className="text-sm text-slate-500">
                Uploaded {formatDate(resource.created_at)}
              </span>
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

        {/* Ratings */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">
            {existingRating ? 'Edit your rating' : 'Rate this resource'}
          </p>

          <StarRating
            value={rating}
            onChange={handleRate}
            disabled={ratingBusy}
          />

          <p className="mt-2 text-xs text-slate-500">
            {ratingBusy
              ? 'Saving your rating…'
              : existingRating
                ? 'Select a different star rating to update your review.'
                : 'Choose 1 to 5 stars.'}
          </p>
        </div>
      </div>

      {/* Resource preview */}
      <ResourcePreview
        url={resource.signed_url}
        title={resource.title}
        onRetry={load}
        onDownload={handleDownload}
        error={null}
      />

      {/* Comments */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Comments
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Share your thoughts about this resource.
        </p>

        <form onSubmit={handleAddComment} className="mt-5 space-y-3">
          <label
            htmlFor="resource-comment"
            className="block text-sm font-medium text-slate-700"
          >
            Add a comment
          </label>

          <textarea
            id="resource-comment"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write your comment here..."
            rows={3}
            maxLength={2000}
            disabled={commentBusy}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={commentBusy || !commentText.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentBusy ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>

        {/* Existing comments */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">
            Recent comments ({comments.length})
          </h3>

          {commentsLoading ? (
            <p className="text-sm text-slate-500">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((item) => (
                <article
                  key={item.comment_id}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.roll_no || 'Student'}
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                    {item.comment}
                  </p>

                  {item.created_at && (
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(item.created_at)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
