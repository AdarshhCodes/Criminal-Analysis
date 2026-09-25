import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import {
  CommandCentrePage,
  InvestigationsPage,
  CaseDetailPage,
  NetworkGraphPage,
  EvidencePage,
  TimelinePage,
  AlertsPage,
  AICopilotPage,
  ReportsPage,
  AuditTrailPage,
  SettingsPage,
} from './pages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/command-centre" replace />} />
          <Route path="/command-centre" element={<CommandCentrePage />} />
          <Route path="/investigations" element={<InvestigationsPage />} />
          <Route path="/investigations/:caseId" element={<CaseDetailPage />} />
          <Route path="/graph" element={<NetworkGraphPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/ai" element={<AICopilotPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit" element={<AuditTrailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/command-centre" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
