import { Routes, Route } from 'react-router-dom'
import LeagueAdminLayout from './layouts/LeagueAdminLayout'
import DashboardPage from './pages/league-administrator/DashboardPage'
import TeamSubmissionPage from './pages/league-administrator/TeamSubmissionPage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />

        <Route path="/league-administrator" element={<LeagueAdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="team-submission" element={<TeamSubmissionPage />} />
        </Route>
      </Routes>
    </>
  )
}