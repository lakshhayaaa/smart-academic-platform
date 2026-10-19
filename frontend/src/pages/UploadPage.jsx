
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { uploadResource } from '../api/resourceApi'
import FileDropzone from '../components/resources/FileDropzone'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage, getErrorPayload } from '../utils/errors'
import {
  clearUploadDraft,
  getUploadDraft,
  setUploadDraft,
} from '../utils/storage'
import {
  clearCachedUploadFile,
  getCachedUploadFile,
  setCachedUploadFile,
} from '../utils/uploadCache'

const emptyForm = {
  title: '',
  department_code: '',
  regulation_year: '',
  semester_number: '',
  course_code: '',
  unit_number: '',
  resource_type: 'NOTES',
}

export default function UploadPage() {
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshDashboard } = useAuth()

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(location.state?.draft || {}),
  }))

  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const draft = getUploadDraft()

    if (draft) {
      setForm((current) => ({
        ...current,
        ...draft,
      }))
    }

    const cached = getCachedUploadFile()

    if (cached) {
      setFile(cached)
    }
  }, [])

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function persistDraft(nextFile = file) {
    setUploadDraft(form)
    setCachedUploadFile(nextFile)
  }

  function validate() {
    const next = {}

    if (!form.title.trim()) {
      next.title = 'Title is required.'
    }
    if (!form.department_code.trim()) {
      next.department_code = 'Department code is required.'
    }
    if (!form.regulation_year) {
      next.regulation_year = 'Regulation year is required.'
    }
    if (!form.semester_number) {
      next.semester_number = 'Semester is required.'
    }
    if (!form.course_code.trim()) {
      next.course_code = 'Course code is required.'
    }
    if (!form.unit_number) {
      next.unit_number = 'Unit number is required.'
    }
    if (!form.resource_type) {
      next.resource_type = 'Resource type is required.'
    }
    if (!file) {
      next.file = 'Choose a PDF, PPTX, or DOCX file.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) return

    persistDraft(file)
    setSubmitting(true)
    setProgress(0)
    setResult(null)

    try {
      const body = new FormData()

      body.append('title', form.title.trim())
      body.append('department_code', form.department_code.trim())
      body.append(
        'regulation_year',
        String(Number(form.regulation_year)),
      )
      body.append(
        'semester_number',
        String(Number(form.semester_number)),
      )
      body.append('course_code', form.course_code.trim())
      body.append('unit_number', String(Number(form.unit_number)))
      body.append('resource_type', form.resource_type)
      body.append('file', file)

      const { data } = await uploadResource(body, (event) => {
        if (!event.total) return

        setProgress(
          Math.round((event.loaded / event.total) * 100),
        )
      })

      setResult(data)
      toast.success('Resource uploaded successfully.')

      clearUploadDraft()
      clearCachedUploadFile()
      setFile(null)
      setForm(emptyForm)

      refreshDashboard().catch(() => {})
    } catch (error) {
      const payload = getErrorPayload(error)

      if (error.response?.status === 409 && payload?.redirect_to) {
        persistDraft(file)

        toast.info(
          payload.message ||
            'Register the missing course or unit, then retry the upload.',
        )

        navigate('/register-course', {
          state: {
            returnTo: '/upload',
            draft: form,
            course_code: payload.course_code || form.course_code,
            unit_number:
              payload.unit_number || form.unit_number,
            department_code: form.department_code,
            regulation_year: form.regulation_year,
            semester_number: form.semester_number,
            code: payload.code,
          },
        })

        return
      }

      toast.error(
        payload?.message || getErrorMessage(error, 'Upload failed'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Upload a resource
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Academic dropdowns are not available from the API, so enter
          department, regulation, course, and unit exactly as they exist
          in the database.
        </p>
      </div>

      {result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-medium text-emerald-800">
            Upload complete. Resource ID {result.resource_id}.
          </p>

          <div className="mt-3 flex gap-3">
            <Link
              to={`/resources/${result.resource_id}`}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
            >
              View resource
            </Link>

            <Link
              to="/dashboard"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium"
          >
            Resource title
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-rose-600">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="department_code"
              className="mb-1 block text-sm font-medium"
            >
              Department code
            </label>
            <input
              id="department_code"
              value={form.department_code}
              onChange={(event) =>
                update('department_code', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {errors.department_code ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.department_code}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="regulation_year"
              className="mb-1 block text-sm font-medium"
            >
              Regulation year
            </label>
            <input
              id="regulation_year"
              type="number"
              min="1"
              value={form.regulation_year}
              onChange={(event) =>
                update('regulation_year', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {errors.regulation_year ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.regulation_year}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="semester_number"
              className="mb-1 block text-sm font-medium"
            >
              Semester number
            </label>
            <input
              id="semester_number"
              type="number"
              min="1"
              value={form.semester_number}
              onChange={(event) =>
                update('semester_number', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {errors.semester_number ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.semester_number}
              </p>
            ) : null}
          </div>

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
                update('course_code', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {errors.course_code ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.course_code}
              </p>
            ) : null}
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
                update('unit_number', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {errors.unit_number ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.unit_number}
              </p>
            ) : null}
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
                update('resource_type', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="NOTES">NOTES</option>
              <option value="PPT">PPT</option>
              <option value="PYQ">PYQ</option>
            </select>
          </div>
        </div>

        <FileDropzone
          file={file}
          error={errors.file}
          onFile={(next) => {
            setFile(next)
            setCachedUploadFile(next)
          }}
        />

        {submitting ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Uploading… {progress}%
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : 'Upload resource'}
        </button>
      </form>
    </div>
  )
}
