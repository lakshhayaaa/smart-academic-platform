import { resourceTypeLabel } from '../../utils/format'

const styles = {
  PPT: 'bg-violet-50 text-violet-700 border-violet-200',
  NOTES: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PYQ: 'bg-sky-50 text-sky-700 border-sky-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function Badge({ value, kind = 'default' }) {
  const label = kind === 'type' ? resourceTypeLabel(value) : value
  const color = styles[value] || 'bg-slate-50 text-slate-700 border-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
