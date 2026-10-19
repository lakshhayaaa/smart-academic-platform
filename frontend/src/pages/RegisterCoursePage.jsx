
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { registerCourse } from '../api/academicApi'
import { useToast } from '../context/ToastContext'
import { getErrorMessage, getErrorPayload } from '../utils/errors'

export default function RegisterCoursePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const prefill = location.state || {}

  // Only permit the known in-app return routes.
  const returnTo =
    prefill.returnTo === '/requests' ? '/requests' : '/upload'

  const [form, setForm] = useState({
    course_code: prefill.course_code || '',
    course_name: '',
    department_code: prefill.department_code || '',
    regulation_year: prefill.regulation_year || '',
    semester_number: prefill.semester_number || '',
    units: [
      {
        unit_number: prefill.unit_number || 1,
        unit_name: '',
      },
    ],
  })

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateUnit(index, field, value) {
    setForm((current) => ({
      ...current,
      units: current.units.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit,
      ),
    }))
  }

  function addUnit() {
    setForm((current) => ({
      ...current,
      units: [
        ...current.units,
        {
          unit_number: current.units.length + 1,
          unit_name: '',
        },
      ],
    }))
  }

  function validate() {
    const next = {}

    if (!form.course_code.trim()) {
      next.course_code = 'Course code is required.'
    }
    if (!form.course_name.trim()) {
      next.course_name = 'Course name is required.'
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
    if (!form.units.length) {
      next.units = 'Add at least one unit.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) return

    setSubmitting(true)

    try {
      await registerCourse({
        course_code: form.course_code.trim(),
        course_name: form.course_name.trim(),
        department_code: form.department_code.trim(),
        regulation_year: Number(form.regulation_year),
        semester_number: Number(form.semester_number),
        units: form.units.map((unit) => ({
          unit_number: Number(unit.unit_number),
          unit_name: unit.unit_name.trim(),
        })),
      })

      toast.success(
        'Course registered successfully. Return to your previous task to continue.',
      )

      // Return to the page the user originally came from.
      // Keep the original form draft in router state.
      navigate(returnTo, {
        replace: true,
        state: {
          draft: prefill.draft,
          restoredFromRegistration: true,
        },
      })
    } catch (error) {
      const payload = getErrorPayload(error)

      toast.error(
        payload?.message ||
          getErrorMessage(error, 'Could not register the course'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Register a course
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {prefill.code === 'UNIT_NOT_FOUND'
            ? 'The unit is missing. Register the course with the required units, then return to your previous task.'
            : 'This course is not in the catalog yet. Register it, then return to your previous task. Registration does not upload a file or submit a resource request.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
              htmlFor="course_name"
              className="mb-1 block text-sm font-medium"
            >
              Course name
            </label>
            <input
              id="course_name"
              value={form.course_name}
              onChange={(event) =>
                update('course_name', event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {errors.course_name ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.course_name}
              </p>
            ) : null}
          </div>

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
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Units</h2>
            <button
              type="button"
              onClick={addUnit}
              className="text-sm font-medium text-indigo-600"
            >
              Add unit
            </button>
          </div>

          <div className="space-y-3">
            {form.units.map((unit, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-[8rem_1fr]"
              >
                <input
                  type="number"
                  min="1"
                  aria-label={`Unit ${index + 1} number`}
                  value={unit.unit_number}
                  onChange={(event) =>
                    updateUnit(
                      index,
                      'unit_number',
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />

                <input
                  aria-label={`Unit ${index + 1} name`}
                  placeholder="Unit name"
                  value={unit.unit_name}
                  onChange={(event) =>
                    updateUnit(
                      index,
                      'unit_name',
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
            ))}
          </div>

          {errors.units ? (
            <p className="mt-1 text-sm text-rose-600">
              {errors.units}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Registering…' : 'Register course'}
          </button>

          <Link
            to={returnTo}
            state={{
              draft: prefill.draft,
              restoredFromRegistration: true,
            }}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium"
          >
            {returnTo === '/requests'
              ? 'Back to requests'
              : 'Back to upload'}
          </Link>
        </div>
      </form>
    </div>
  )
}
