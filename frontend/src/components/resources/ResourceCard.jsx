import { Download, Eye, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../common/Badge'
import { formatDate, formatDateTime } from '../../utils/format'

export default function ResourceCard({
  resource,
  timestampLabel,
  timestampValue,
  showDelete = false,
  onDelete,
  onDownload,
  extra,
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{resource.title}</h3>
        <Badge value={resource.resource_type} kind="type" />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {resource.course_code}
        {resource.unit_number ? ` · Unit ${resource.unit_number}` : ''}
        {resource.unit_name ? ` · ${resource.unit_name}` : ''}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Uploaded {formatDate(resource.created_at)}</span>
        {resource.status ? <Badge value={resource.status} /> : null}
        {timestampLabel ? (
          <span>
            {timestampLabel} {formatDateTime(timestampValue)}
          </span>
        ) : null}
      </div>
      {extra}
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          to={`/resources/${resource.resource_id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
        {onDownload ? (
          <button
            type="button"
            onClick={() => onDownload(resource)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        ) : null}
        {showDelete ? (
          <button
            type="button"
            onClick={() => onDelete?.(resource)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
      </div>
    </article>
  )
}
