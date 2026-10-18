import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { downloadResource, searchResources } from '../api/resourceApi'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import { CardSkeleton } from '../components/common/Skeleton'
import ResourceCard from '../components/resources/ResourceCard'
import { useToast } from '../context/ToastContext'
import { useDebounce } from '../hooks/useDebounce'
import { getErrorMessage } from '../utils/errors'

const PAGE_SIZE_OPTIONS = [12, 20, 40]

export default function DiscoverPage() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [courseCode, setCourseCode] = useState(searchParams.get('course_code') || '')
  const [unitNumber, setUnitNumber] = useState(searchParams.get('unit_number') || '')
  const [resourceType, setResourceType] = useState(searchParams.get('resource_type') || '')
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 12)
  const [offset, setOffset] = useState(Number(searchParams.get('offset')) || 0)
  const [results, setResults] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const debouncedQ = useDebounce(q)

  useEffect(() => {
    const params = {}
    if (debouncedQ) params.q = debouncedQ
    if (courseCode) params.course_code = courseCode
    if (unitNumber) params.unit_number = unitNumber
    if (resourceType) params.resource_type = resourceType
    if (limit !== 12) params.limit = String(limit)
    if (offset) params.offset = String(offset)
    setSearchParams(params, { replace: true })
  }, [debouncedQ, courseCode, unitNumber, resourceType, limit, offset, setSearchParams])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await searchResources({
          q: debouncedQ || undefined,
          course_code: courseCode || undefined,
          unit_number: unitNumber ? Number(unitNumber) : undefined,
          resource_type: resourceType || undefined,
          limit,
          offset,
        })
        if (!cancelled) setResults(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Could not search resources'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [debouncedQ, courseCode, unitNumber, resourceType, limit, offset])

  function resetFilters() {
    setQ('')
    setCourseCode('')
    setUnitNumber('')
    setResourceType('')
    setOffset(0)
  }

  async function handleDownload(resource) {
    try {
      const { data } = await downloadResource(resource.resource_id)
      if (data?.signed_url) window.open(data.signed_url, '_blank', 'noopener')
      toast.success(data?.message || 'Download link ready')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not download this resource'))
    }
  }

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil((results.total || 0) / limit))

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <label className="relative block">
          <span className="sr-only">Search resources</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              setOffset(0)
            }}
            placeholder="Search by title or course code"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm outline-none focus:border-indigo-400 focus:bg-white"
          />
          {q ? (
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400" onClick={() => { setQ(''); setOffset(0) }} aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="course_code" className="mb-1 block text-xs font-medium text-slate-500">Course code</label>
            <input id="course_code" value={courseCode} onChange={(event) => { setCourseCode(event.target.value); setOffset(0) }} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="unit_number" className="mb-1 block text-xs font-medium text-slate-500">Unit number</label>
            <input id="unit_number" type="number" min="1" value={unitNumber} onChange={(event) => { setUnitNumber(event.target.value); setOffset(0) }} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="resource_type" className="mb-1 block text-xs font-medium text-slate-500">Resource type</label>
            <select id="resource_type" value={resourceType} onChange={(event) => { setResourceType(event.target.value); setOffset(0) }} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">All types</option>
              <option value="PPT">PPT</option>
              <option value="NOTES">NOTES</option>
              <option value="PYQ">PYQ</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={resetFilters} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Clear all filters
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>{loading ? 'Searching…' : `${results.total || 0} result${results.total === 1 ? '' : 's'}`}</p>
          <label className="flex items-center gap-2">
            Page size
            <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setOffset(0) }} className="rounded-lg border border-slate-200 px-2 py-1">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? <ErrorState message={error} onRetry={() => setOffset((value) => value)} /> : null}
      {loading ? <CardSkeleton count={6} /> : null}
      {!loading && !error && !results.items?.length ? (
        <EmptyState title="No matching resources" description="Try a different title, course code, or filter combination." />
      ) : null}
      {!loading && results.items?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.items.map((resource) => (
            <ResourceCard key={resource.resource_id} resource={resource} onDownload={handleDownload} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={offset === 0 || loading}
          onClick={() => setOffset(Math.max(0, offset - limit))}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
        <button
          type="button"
          disabled={offset + limit >= (results.total || 0) || loading}
          onClick={() => setOffset(offset + limit)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
