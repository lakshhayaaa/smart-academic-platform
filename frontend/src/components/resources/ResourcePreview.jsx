import { Download, FileWarning, LoaderCircle } from 'lucide-react'

function isPdf(url) {
  if (!url) return false
  const lower = url.toLowerCase()
  return lower.includes('.pdf') || lower.includes('application/pdf')
}

export default function ResourcePreview({ url, title, loading, error, onRetry, onDownload }) {
  if (loading) {
    return (
      <div className="flex h-[32rem] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-sm text-slate-500">Loading preview…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 text-center">
        <FileWarning className="h-8 w-8 text-rose-500" />
        <p className="mt-3 text-sm text-rose-800">{error}</p>
        <div className="mt-4 flex gap-2">
          {onRetry ? (
            <button type="button" onClick={onRetry} className="rounded-lg bg-white px-4 py-2 text-sm font-medium ring-1 ring-rose-200">
              Refresh preview
            </button>
          ) : null}
          {onDownload ? (
            <button type="button" onClick={onDownload} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white">
              Download instead
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  if (url && isPdf(url)) {
    return (
      <iframe
        title={title || 'Resource preview'}
        src={url}
        className="h-[40rem] w-full rounded-2xl border border-slate-200 bg-white"
      />
    )
  }

  return (
    <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
      <p className="text-sm font-medium text-slate-800">Browser preview is unavailable for this file type.</p>
      <p className="mt-1 text-sm text-slate-500">PPTX and DOCX files stay in private storage. Download a copy to open them locally.</p>
      {onDownload ? (
        <button
          type="button"
          onClick={onDownload}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" />
          Download file
        </button>
      ) : null}
    </div>
  )
}
