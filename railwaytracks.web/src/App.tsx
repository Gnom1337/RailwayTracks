import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { DefectsPage } from './pages/DefectsPage'
import { SimpleCrudPage } from './pages/SimpleCrudPage'
import { TrackSchemePage } from './pages/TrackSchemePage'
import { HistoryPage } from './pages/HistoryPage'
import { ForbiddenPage } from './pages/ForbiddenPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/defects" element={<DefectsPage />} />
          <Route path="/scheme" element={<TrackSchemePage />} />
          <Route path="/history" element={<HistoryPage />} />

          <Route element={<ProtectedRoute roles={['Admin']} />}>
            <Route path="/defect-types" element={<SimpleCrudPage title="Типы дефектов" resource="defect-types" />} />
            <Route path="/inspectors" element={<SimpleCrudPage title="Инспекторы" resource="inspectors" />} />
            <Route path="/repair-teams" element={<SimpleCrudPage title="Ремонтные бригады" resource="repair-teams" />} />
            <Route path="/data-sources" element={<SimpleCrudPage title="Источники данных" resource="data-sources" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
