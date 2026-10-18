import { Star } from 'lucide-react'

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  disabled = false,
  size = 'h-5 w-5',
}) {
  return (
    <div className="flex items-center gap-1" role={readOnly ? 'img' : 'radiogroup'} aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value
        if (readOnly) {
          return (
            <Star
              key={star}
              className={`${size} ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          )
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            disabled={disabled}
            onClick={() => onChange?.(star)}
            className="rounded-md p-0.5 disabled:opacity-50"
          >
            <Star className={`${size} ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
          </button>
        )
      })}
    </div>
  )
}
