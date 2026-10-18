import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">This page does not exist</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">The route you opened is not part of ScholarShare. Head back to your dashboard to continue.</p>
      <Link to="/dashboard" className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
        Back to dashboard
      </Link>
    </div>
  )
}
