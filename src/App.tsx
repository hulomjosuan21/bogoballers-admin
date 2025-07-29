import { Routes, Route } from 'react-router-dom'
import LeagueAdminLayout from './layouts/LeagueAdminLayout'
import DashboardPage from './pages/league-administrator/DashboardPage'
import TeamSubmissionPage from './pages/league-administrator/TeamSubmissionPage'
import BracketStructurePage from './pages/league-administrator/bracket/structurePage'
import SettingsPage from './pages/settingPage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />

        <Route path="/league-administrator" element={<LeagueAdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="team-submission" element={<TeamSubmissionPage />} />
          <Route path="league/bracket/structure" element={<BracketStructurePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  )
}