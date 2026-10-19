
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createResourceRequest, listResourceRequests } from '../api/requestApi'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage, getErrorPayload } from '../utils/errors'
import { formatDateTime } from '../utils/format'

export default function RequestsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState(() => ({
    course_code: location.state?.draft?.course_code || '',
    unit_number: location.state?.draft?.unit_number || '',
    resource_type: location.state?.draft?.resource_type || 'NOTES',
  }))

  async function load() {
    setLoading(true)
    setError('')

    try {
      const { data } = await listResourceRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load resource requests'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const mine = useMemo(
    () =>
      requests.filter(
        (item) => item.requested_by === user?.roll_no
      ),
    [requests, user?.roll_no]
  )

  const otherOpenRequests = useMemo(
    () =>
      requests.filter(
        (item) =>
          item.requested_by !== user?.roll_no &&
          ['OPEN', 'PENDING'].includes(
            String(item.status).toUpperCase()
          )
      ),
    [requests, user?.roll_no]
  )

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.course_code.trim() || !form.unit_number) {
      toast.error('Course code and unit number are required.')
      return
    }

    setSubmitting(true)

    try {
      await createResourceRequest({
        course_code: form.course_code.trim(),
        unit_number: Number(form.unit_number),
        resource_type: form.resource_type,
      })

      toast.success('Request submitted')

      setForm({
        course_code: '',
        unit_number: '',
        resource_type: 'NOTES',
      })

      await load()
    } catch (err) {
      const payload = getErrorPayload(err)

      if (payload?.redirect_to) {
        toast.info(
          payload.message ||
            'Register the missing course or unit, then return to your request.'
        )

        navigate('/register-course', {
          state: {
            returnTo: '/requests',
            draft: form,
            course_code: payload.course_code || form.course_code,
            unit_number:
              payload.unit_number || form.unit_number || 1,
            department_code: payload.department_code || '',
            regulation_year: payload.regulation_year || '',
            semester_number: payload.semester_number || '',
            code: payload.code,
          },
        })

        return
      }

      toast.error(
        payload?.message ||
          getErrorMessage(err, 'Could not create the request')
      )
    } finally {
      setSubmitting(false)
    }
  }

  function RequestTable({ items, emptyTitle, emptyDescription }) {
    if (!items.length) {
      return (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      )
    }

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Fulfilled resource</th>
            </tr>
          </thead>

          <tbody>
            {items.map((request) => (
              <tr
                key={request.request_id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3">
                  {request.course_code}
                </td>

                <td className="px-4 py-3">
                  {request.unit_number}
                </td>

                <td className="px-4 py-3">
                  <Badge value={request.resource_type} kind="type" />
                </td>

                <td className="px-4 py-3">
                  <Badge value={request.status} />
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {formatDateTime(request.created_at)}
                </td>

                <td className="px-4 py-3">
                  {request.fulfilled_resource_id ? (
                    <Link
                      to={`/resources/${request.fulfilled_resource_id}`}
                      className="font-medium text-indigo-600"
                    >
                      Open resource {request.fulfilled_resource_id}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Resource Requests
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your requests and help other students find the
          resources they need.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-4"
      >
        <div>
          <label
            htmlFor="course_code"
            className="mb-1 block text-sm font-medium"
          >
            Course code
          </label>
          <input
            id="course_code"
            value={form.course_code}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                course_code: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="unit_number"
            className="mb-1 block text-sm font-medium"
          >
            Unit number
          </label>
          <input
            id="unit_number"
            type="number"
            min="1"
            value={form.unit_number}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                unit_number: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="resource_type"
            className="mb-1 block text-sm font-medium"
          >
            Resource type
          </label>
          <select
            id="resource_type"
            value={form.resource_type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                resource_type: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="NOTES">NOTES</option>
            <option value="PPT">PPT</option>
            <option value="PYQ">PYQ</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading requests…
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                My Requests
              </h2>
              <p className="text-sm text-slate-500">
                All the requests you have submitted.
              </p>
            </div>

            <RequestTable
              items={mine}
              emptyTitle="You have not requested anything yet"
              emptyDescription="Ask for notes, presentations, or question papers for a course unit."
            />
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Other Open Requests
              </h2>
              <p className="text-sm text-slate-500">
                Help other students by uploading the resources they need.
              </p>
            </div>

            <RequestTable
              items={otherOpenRequests}
              emptyTitle="No other open requests"
              emptyDescription="There are currently no open requests from other students."
            />
          </section>
        </>
      )}
    </div>
  )
}
