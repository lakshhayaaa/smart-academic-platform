import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DiscoverPage from './pages/DiscoverPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import UploadPage from './pages/UploadPage'
import RegisterCoursePage from './pages/RegisterCoursePage'
import MyUploadsPage from './pages/MyUploadsPage'
import MyRatingsPage from './pages/MyRatingsPage'
import RecentlyViewedPage from './pages/RecentlyViewedPage'
import RecentlyDownloadedPage from './pages/RecentlyDownloadedPage'
import RequestsPage from './pages/RequestsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resources" element={<DiscoverPage />} />
          <Route path="/resources/:resourceId" element={<ResourceDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/register-course" element={<RegisterCoursePage />} />
          <Route path="/my-uploads" element={<MyUploadsPage />} />
          <Route path="/my-ratings" element={<MyRatingsPage />} />
          <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
          <Route path="/recently-downloaded" element={<RecentlyDownloadedPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
