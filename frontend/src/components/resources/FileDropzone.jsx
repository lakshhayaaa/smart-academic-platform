import { FileUp, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { fileExtension, formatBytes } from '../../utils/format'

const ACCEPT = '.pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export default function FileDropzone({ file, onFile, error }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(list) {
    const next = list?.[0]
    if (next) onFile(next)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            handleFiles(event.dataTransfer.files)
          }}
          className={`flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <FileUp className="h-8 w-8 text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-800">Drop a file here or browse</p>
          <p className="mt-1 text-xs text-slate-500">PDF, PPTX, or DOCX</p>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">
              {fileExtension(file.name)} · {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}
