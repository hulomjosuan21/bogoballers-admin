import { Routes, Route } from 'react-router-dom'
import LeagueAdminLayout from './layouts/LeagueAdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { leagueAdminRoutes } from './routes/leagueAdminRoutes'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/league-administrator" element={<LeagueAdminLayout />}>
            {leagueAdminRoutes.map((route, index) => (
              <Route
                key={index}
                index={route.index}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>
      </Routes>
    </>
  )
}